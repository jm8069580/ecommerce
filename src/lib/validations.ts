import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  email: z.string().trim().toLowerCase().email("Email invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
})

export const userCreateSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  email: z.string().trim().toLowerCase().email("Email invalido"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
  role: z.enum(["customer", "admin"]).default("customer"),
})

export const addressSchema = z.object({
  label: z.string().trim().min(1, "El rotulo es requerido"),
  name: z.string().trim().min(1, "El nombre es requerido"),
  phone: z.string().optional().or(z.literal("")).default(""),
  address: z.string().trim().min(1, "La direccion es requerida"),
  city: z.string().trim().min(1, "La ciudad es requerida"),
  state: z.string().trim().min(1, "El departamento es requerido"),
  zipCode: z.string().optional().or(z.literal("")).default(""),
  isDefault: z.boolean().optional(),
})

const priceSchema = z.coerce.number().nonnegative().refine((v) => v >= 0)

export const productSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  slug: z.string().trim().min(1, "El slug es requerido"),
  description: z.string().optional().or(z.literal("")),
  price: priceSchema,
  comparePrice: z.coerce.number().nonnegative().optional().nullable(),
  stock: z.coerce.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
  specs: z.record(z.string(), z.string()).optional(),
  isNew: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  categoryId: z.string().min(1, "La categoria es requerida"),
  brandId: z.string().min(1, "La marca es requerida"),
})

export const categorySchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  slug: z.string().trim().min(1, "El slug es requerido"),
  icon: z.string().optional().or(z.literal("")),
})

export const brandSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  slug: z.string().trim().min(1, "El slug es requerido"),
  logo: z.string().optional().or(z.literal("")),
})

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().positive(),
})

export const orderCreateSchema = z.object({
  subtotal: z.coerce.number().nonnegative(),
  shipping: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
  paymentMethod: z.string().min(1),
  notes: z.string().optional().nullable(),
  addressId: z.string().min(1),
  items: z.array(orderItemSchema).min(1, "El pedido debe tener al menos un item"),
})

export const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  notes: z.string().optional().nullable(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type BrandInput = z.infer<typeof brandSchema>
export type OrderCreateInput = z.infer<typeof orderCreateSchema>
export type OrderStatusInput = z.infer<typeof orderStatusSchema>