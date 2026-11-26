import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import type {
  CreateProductInput,
  UpdateProductInput,
} from '@zawabu/shared'
import { PRODUCT_CACHE_TTL_SECONDS } from '@zawabu/shared'
import { and, eq, ilike, or, sql } from 'drizzle-orm'

import { CacheService } from '../cache/cache.service'
import { DRIZZLE } from '../db/db.module'
import {
  orderItems,
  products,
  stockMovements,
  type Database,
  type ProductRow,
} from '../db/schema'
import { Inject } from '@nestjs/common'

interface ProductQuery {
  search?: string
  category?: string
  vehicle?: 'Car' | 'Motorbike' | 'Universal'
  make?: string
  lowStock?: boolean
}

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DRIZZLE) private readonly db: Database,
    private readonly cache: CacheService,
  ) {}

  async findAll(query: ProductQuery): Promise<ProductRow[]> {
    const key = `products:list:${JSON.stringify(query)}`
    const cached = await this.cache.get<ProductRow[]>(key)
    if (cached) {
      return cached
    }

    const conditions = [eq(products.isActive, true)]
    if (query.search) {
      const term = `%${query.search}%`
      const search = or(
        ilike(products.name, term),
        ilike(products.sku, term),
        ilike(products.partNumber, term),
        ilike(products.brand, term),
      )
      if (search) {
        conditions.push(search)
      }
    }
    if (query.category) {
      conditions.push(eq(products.category, query.category))
    }
    if (query.vehicle) {
      conditions.push(eq(products.vehicle, query.vehicle))
    }
    if (query.make) {
      conditions.push(ilike(products.make, `%${query.make}%`))
    }
    if (query.lowStock) {
      conditions.push(
        sql`${products.stock} <= ${products.lowStockThreshold}`,
      )
    }

    const rows = await this.db
      .select()
      .from(products)
      .where(and(...conditions))
      .orderBy(products.name)

    await this.cache.set(key, rows, PRODUCT_CACHE_TTL_SECONDS)
    return rows
  }

  async findLowStock(): Promise<ProductRow[]> {
    return this.db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          sql`${products.stock} <= ${products.lowStockThreshold}`,
        ),
      )
      .orderBy(products.stock)
  }

  async findOne(id: string): Promise<ProductRow> {
    const key = `products:detail:${id}`
    const cached = await this.cache.get<ProductRow>(key)
    if (cached) {
      return cached
    }

    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1)

    if (!product) {
      throw new NotFoundException('Product not found')
    }

    await this.cache.set(key, product, PRODUCT_CACHE_TTL_SECONDS)
    return product
  }

  async create(input: CreateProductInput): Promise<ProductRow> {
    const [created] = await this.db
      .insert(products)
      .values(input)
      .returning()

    await this.invalidate()
    return created
  }

  async update(id: string, input: UpdateProductInput): Promise<ProductRow> {
    const existing = await this.findOne(id)

    const [updated] = await this.db
      .update(products)
      .set(input)
      .where(eq(products.id, id))
      .returning()

    if (input.stock !== undefined && input.stock !== existing.stock) {
      await this.db.insert(stockMovements).values({
        productId: id,
        delta: input.stock - existing.stock,
        reason: 'Manual stock adjustment',
      })
    }

    await this.invalidate()
    return updated
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id)

    const [reference] = await this.db
      .select({ id: orderItems.id })
      .from(orderItems)
      .where(eq(orderItems.productId, id))
      .limit(1)

    if (reference) {
      throw new BadRequestException(
        'This product has order history and cannot be deleted; deactivate it instead',
      )
    }

    await this.db.delete(products).where(eq(products.id, id))
    await this.invalidate()
  }

  private async invalidate(): Promise<void> {
    await this.cache.invalidate('products')
  }
}
