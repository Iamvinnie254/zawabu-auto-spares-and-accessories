import type {
  DeliveryMethod,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Role,
} from '@zawabu/shared'

export type Product = {
  id: string
  sku: string
  name: string
  category: string
  vehicle: 'Car' | 'Motorbike' | 'Universal'
  make: string
  model: string
  yearFrom: number | null
  yearTo: number | null
  engine: string
  partNumber: string
  brand: string
  condition: string
  price: number
  oldPrice: number | null
  stock: number
  lowStockThreshold: number
  description: string
  img: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type OrderItem = {
  id: string
  productId: string
  name: string
  sku: string
  qty: number
  price: number
  lineTotal: number
}

export type Order = {
  id: string
  orderNumber: string
  date: string
  customer: string
  phone: string
  email: string
  location: string
  delivery: DeliveryMethod
  payment: PaymentMethod
  paymentStatus: PaymentStatus
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  total: number
  notes: string
  items: OrderItem[]
}

export type Enquiry = {
  id: string
  date: string
  name: string
  phone: string
  email: string
  subject: string
  message: string
  status: 'New' | 'Replied'
}

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
}

export type CartLine = {
  id: string
  name: string
  price: number
  img: string
  qty: number
}

export type { OrderStatus }
