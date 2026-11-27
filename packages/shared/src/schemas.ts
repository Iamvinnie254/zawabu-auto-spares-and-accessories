import { z } from "zod";

export const ROLES = ["SUPER_ADMIN", "SALES_MANAGER", "SALES_PERSON"] as const;
export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Dispatched",
  "Delivered",
  "Cancelled",
] as const;
export const PAYMENT_METHODS = ["M-Pesa", "Cash on Delivery", "Bank Transfer"] as const;
export const PAYMENT_STATUSES = ["Unpaid", "Pending", "Paid", "Refunded"] as const;
export const DELIVERY_METHODS = ["Pickup", "Delivery"] as const;
export const VEHICLE_TYPES = ["Car", "Motorbike", "Universal"] as const;
export const PRODUCT_CONDITIONS = ["Genuine", "OEM", "Aftermarket", "Ex-Japan"] as const;

export const kenyanPhone = z
  .string()
  .regex(/^(\+?254|0)[17]\d{8}$/, "Enter a valid Kenyan phone number");

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const createUserSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.email(),
  password: z.string().min(8).max(128),
  role: z.enum(ROLES),
});

export const updateUserSchema = createUserSchema
  .extend({ isActive: z.boolean() })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "No fields to update");

export const createProductSchema = z.object({
  name: z.string().min(2).max(200),
  sku: z.string().min(2).max(60),
  category: z.string().min(2).max(60),
  vehicle: z.enum(VEHICLE_TYPES),
  make: z.string().max(60).optional(),
  model: z.string().max(80).optional(),
  yearFrom: z.int().min(1960).max(2100).optional(),
  yearTo: z.int().min(1960).max(2100).optional(),
  engine: z.string().max(60).optional(),
  partNumber: z.string().max(80).optional(),
  brand: z.string().max(80).optional(),
  condition: z.enum(PRODUCT_CONDITIONS).default("Aftermarket"),
  price: z.int().positive(),
  oldPrice: z.int().positive().optional(),
  stock: z.int().min(0).default(0),
  lowStockThreshold: z.int().min(0).max(1000).default(5),
  description: z.string().max(2000).optional(),
  img: z.url().optional(),
  isActive: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "No fields to update");

export const productQuerySchema = z.object({
  search: z.string().max(120).optional(),
  category: z.string().max(60).optional(),
  vehicle: z.enum(VEHICLE_TYPES).optional(),
  make: z.string().max(60).optional(),
  lowStock: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export const stkPaymentSchema = z.object({
  orderId: z.uuid(),
  phone: kenyanPhone,
});

export const paymentCallbackSchema = z.object({
  reference: z.string().min(3).max(100),
  status: z.enum(["Paid", "Failed"]),
});

export const createOrderSchema = z.object({
  customer: z.string().min(2).max(120),
  phone: kenyanPhone,
  email: z.email().optional(),
  location: z.string().min(2).max(200),
  delivery: z.enum(DELIVERY_METHODS),
  payment: z.enum(PAYMENT_METHODS),
  items: z
    .array(
      z.object({
        productId: z.uuid(),
        qty: z.int().positive().max(1000),
      }),
    )
    .min(1)
    .max(100),
  notes: z.string().max(1000).optional(),
});

export const updateOrderSchema = z
  .object({
    status: z.enum(ORDER_STATUSES).optional(),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    location: z.string().min(2).max(200).optional(),
    notes: z.string().max(1000).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "No fields to update");

export const orderQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(3).max(40),
  phone: kenyanPhone,
});

export const enquiryQuerySchema = z.object({
  status: z.enum(["New", "Replied"]).optional(),
});

export const updateEnquirySchema = z.object({
  status: z.enum(["New", "Replied"]),
});

export const enquirySchema = z.object({
  name: z.string().min(2).max(120),
  phone: kenyanPhone,
  email: z.email().optional(),
  subject: z.string().min(2).max(200),
  message: z.string().min(5).max(2000),
});

export type Role = (typeof ROLES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type EnquiryQuery = z.infer<typeof enquiryQuerySchema>;
export type UpdateEnquiryInput = z.infer<typeof updateEnquirySchema>;
export type StkPaymentInput = z.infer<typeof stkPaymentSchema>;
export type PaymentCallbackInput = z.infer<typeof paymentCallbackSchema>;
