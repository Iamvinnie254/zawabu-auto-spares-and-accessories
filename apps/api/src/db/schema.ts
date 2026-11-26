import { sql } from 'drizzle-orm'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import {
  DELIVERY_METHODS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  PRODUCT_CONDITIONS,
  ROLES,
  VEHICLE_TYPES,
  type Role,
} from '@zawabu/shared'

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
}

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ROLES }).$type<Role>().notNull().default('SALES_PERSON'),
  isActive: boolean('is_active').notNull().default(true),
  ...timestamps,
})

export const products = pgTable(
  'products',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sku: text('sku').notNull().unique(),
    name: text('name').notNull(),
    category: text('category').notNull(),
    vehicle: text('vehicle', { enum: VEHICLE_TYPES }).notNull(),
    make: text('make'),
    model: text('model'),
    yearFrom: integer('year_from'),
    yearTo: integer('year_to'),
    engine: text('engine'),
    partNumber: text('part_number'),
    brand: text('brand'),
    condition: text('condition', { enum: PRODUCT_CONDITIONS })
      .notNull()
      .default('Aftermarket'),
    price: integer('price').notNull(),
    oldPrice: integer('old_price'),
    stock: integer('stock').notNull().default(0),
    lowStockThreshold: integer('low_stock_threshold').notNull().default(5),
    description: text('description'),
    img: text('img'),
    isActive: boolean('is_active').notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index('products_category_idx').on(table.category),
    index('products_vehicle_idx').on(table.vehicle),
    index('products_make_idx').on(table.make),
    index('products_part_number_idx').on(table.partNumber),
  ],
)

export const orders = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderNumber: text('order_number').notNull().unique(),
    customer: text('customer').notNull(),
    phone: text('phone').notNull(),
    email: text('email'),
    location: text('location').notNull(),
    delivery: text('delivery', { enum: DELIVERY_METHODS }).notNull(),
    payment: text('payment', { enum: PAYMENT_METHODS }).notNull(),
    paymentStatus: text('payment_status', { enum: PAYMENT_STATUSES })
      .notNull()
      .default('Unpaid'),
    status: text('status', { enum: ORDER_STATUSES }).notNull().default('Pending'),
    subtotal: integer('subtotal').notNull(),
    deliveryFee: integer('delivery_fee').notNull(),
    total: integer('total').notNull(),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => [
    index('orders_status_idx').on(table.status),
    index('orders_phone_idx').on(table.phone),
  ],
)

export const orderItems = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    name: text('name').notNull(),
    sku: text('sku').notNull(),
    qty: integer('qty').notNull(),
    unitPrice: integer('unit_price').notNull(),
    lineTotal: integer('line_total').notNull(),
    ...timestamps,
  },
  (table) => [index('order_items_order_id_idx').on(table.orderId)],
)

export const enquiries = pgTable('enquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status', { enum: ['New', 'Replied'] }).notNull().default('New'),
  ...timestamps,
})

export const stockMovements = pgTable(
  'stock_movements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
    delta: integer('delta').notNull(),
    reason: text('reason').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('stock_movements_product_id_idx').on(table.productId)],
)

export const schema = {
  users,
  products,
  orders,
  orderItems,
  enquiries,
  stockMovements,
}

export const now = sql`now()`

export type Database = PostgresJsDatabase<typeof schema>
export type UserRow = typeof users.$inferSelect
export type ProductRow = typeof products.$inferSelect
export type OrderRow = typeof orders.$inferSelect
export type OrderItemRow = typeof orderItems.$inferSelect
export type EnquiryRow = typeof enquiries.$inferSelect
