import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type { CreateOrderInput, UpdateOrderInput } from '@zawabu/shared'
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm'

import { CacheService } from '../cache/cache.service'
import { DRIZZLE } from '../db/db.module'
import {
  orderItems,
  orders,
  products,
  stockMovements,
  type Database,
  type OrderItemRow,
  type OrderRow,
} from '../db/schema'

const DELIVERY_FEE = 300

type OrderWithItems = OrderRow & { items: OrderItemRow[] }

@Injectable()
export class OrdersService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly cache: CacheService,
  ) {}

  async create(input: CreateOrderInput): Promise<OrderWithItems> {
    const uniqueIds = [...new Set(input.items.map((item) => item.productId))]

    return this.db.transaction(async (tx) => {
      const available = await tx
        .select()
        .from(products)
        .where(inArray(products.id, uniqueIds))
      const byId = new Map(available.map((product) => [product.id, product]))

      const lines = input.items.map((item) => {
        const product = byId.get(item.productId)
        if (!product || !product.isActive) {
          throw new BadRequestException(`Product ${item.productId} is unavailable`)
        }
        return {
          product,
          qty: item.qty,
          lineTotal: product.price * item.qty,
        }
      })

      const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
      const deliveryFee = input.delivery === 'Delivery' ? DELIVERY_FEE : 0

      const [order] = await tx
        .insert(orders)
        .values({
          customer: input.customer,
          phone: input.phone,
          email: input.email,
          location: input.location,
          delivery: input.delivery,
          payment: input.payment,
          subtotal,
          deliveryFee,
          total: subtotal + deliveryFee,
          notes: input.notes,
          paymentStatus: input.payment === 'M-Pesa' ? 'Pending' : 'Unpaid',
        })
        .returning()

      const createdItems: OrderItemRow[] = []
      for (const line of lines) {
        const [reserved] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${line.qty}` })
          .where(
            and(
              eq(products.id, line.product.id),
              gte(products.stock, line.qty),
            ),
          )
          .returning({ id: products.id })

        if (!reserved) {
          throw new BadRequestException(`Insufficient stock for ${line.product.name}`)
        }

        const [createdItem] = await tx
          .insert(orderItems)
          .values({
            orderId: order.id,
            productId: line.product.id,
            name: line.product.name,
            sku: line.product.sku,
            qty: line.qty,
            unitPrice: line.product.price,
            lineTotal: line.lineTotal,
          })
          .returning()
        createdItems.push(createdItem)

        await tx.insert(stockMovements).values({
          productId: line.product.id,
          orderId: order.id,
          delta: -line.qty,
          reason: `Order ${order.orderNumber}`,
        })
      }

      await this.cache.invalidate('products')
      return { ...order, items: createdItems }
    })
  }

  async findAll(status?: OrderRow['status']): Promise<OrderWithItems[]> {
    const rows = await this.db
      .select()
      .from(orders)
      .where(status ? eq(orders.status, status) : undefined)
      .orderBy(desc(orders.createdAt))

    if (rows.length === 0) {
      return []
    }

    const items = await this.db
      .select()
      .from(orderItems)
      .where(
        inArray(
          orderItems.orderId,
          rows.map((row) => row.id),
        ),
      )

    return rows.map((row) => ({
      ...row,
      items: items.filter((item) => item.orderId === row.id),
    }))
  }

  async findOne(id: string): Promise<OrderWithItems> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .limit(1)

    if (!order) {
      throw new NotFoundException('Order not found')
    }

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id))

    return { ...order, items }
  }

  async track(orderNumber: string, phone: string): Promise<OrderWithItems> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(and(eq(orders.orderNumber, orderNumber), eq(orders.phone, phone)))
      .limit(1)

    if (!order) {
      throw new NotFoundException('No order matches those details')
    }

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id))

    return { ...order, items }
  }

  async update(id: string, input: UpdateOrderInput): Promise<OrderWithItems> {
    return this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .limit(1)

      if (!existing) {
        throw new NotFoundException('Order not found')
      }

      if (
        existing.status === 'Cancelled' &&
        input.status &&
        input.status !== 'Cancelled'
      ) {
        throw new BadRequestException('A cancelled order cannot be reopened')
      }

      const [updated] = await tx
        .update(orders)
        .set(input)
        .where(eq(orders.id, id))
        .returning()

      if (
        input.status === 'Cancelled' &&
        existing.status !== 'Cancelled'
      ) {
        const items = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, id))

        for (const item of items) {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${item.qty}` })
            .where(eq(products.id, item.productId))

          await tx.insert(stockMovements).values({
            productId: item.productId,
            orderId: id,
            delta: item.qty,
            reason: `Cancelled order ${existing.orderNumber}`,
          })
        }
        await this.cache.invalidate('products')
      }

      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, id))

      return { ...updated, items }
    })
  }

  async markPayment(
    reference: string,
    status: 'Paid' | 'Failed',
  ): Promise<OrderRow> {
    const [updated] = await this.db
      .update(orders)
      .set({
        paymentStatus: status === 'Paid' ? 'Paid' : 'Unpaid',
        ...(status === 'Paid' ? { status: 'Confirmed' as const } : {}),
      })
      .where(eq(orders.paymentReference, reference))
      .returning()

    if (!updated) {
      throw new NotFoundException('Payment reference not found')
    }

    return updated
  }

  async attachPaymentReference(
    orderId: string,
    reference: string,
  ): Promise<void> {
    await this.db
      .update(orders)
      .set({ paymentReference: reference })
      .where(eq(orders.id, orderId))
  }
}
