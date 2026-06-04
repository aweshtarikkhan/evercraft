import { z } from 'zod';

export const DuplicateCheckSchema = z.object({
  email: z.string(),
  phone: z.string()
});

export const UserSignupSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  password: z.string(),
  status: z.string().default("Logged In")
});

export const UserLoginSchema = z.object({
  email: z.string(),
  password: z.string()
});

export const UserUpdateSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  profile_image: z.string()
});

export const PasswordChangeSchema = z.object({
  new_password: z.string()
});

export const PasswordResetSchema = z.object({
  email: z.string(),
  new_password: z.string()
});

export const EmailCheckSchema = z.object({
  email: z.string()
});

export const AddressCreateSchema = z.object({
  type: z.string(),
  address: z.string(),
  city: z.string(),
  pincode: z.string()
});

export const OrderItemSchema = z.object({
  id: z.number().int(),
  qty: z.number().int()
});

export const OrderCreateSchema = z.object({
  user_id: z.number().int(),
  items: z.array(OrderItemSchema),
  shipping_address_id: z.number().int(),
  coupon_code: z.string().optional().nullable()
});

export const OrderStatusUpdateSchema = z.object({
  status: z.string()
});

export const CouponCreateSchema = z.object({
  code: z.string(),
  discount_percent: z.number().int()
});

export const SettingsUpdateSchema = z.object({
  gst_percent: z.string(),
  shipping_cost: z.string()
});

export const AdminLoginSchema = z.object({
  email: z.string(),
  password: z.string()
});

export const FrontStatsUpdateSchema = z.object({
  happy_readers: z.string(),
  cities_reached: z.string(),
  sales_platforms: z.string()
});

export const CookieConsentCreateSchema = z.object({
  session_id: z.string(),
  user_id: z.number().int().optional().nullable(),
  status: z.string() // 'accepted' or 'denied'
});

export const SubscriberCreateSchema = z.object({
  email: z.string()
});

export const PublishReqCreateSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  country: z.string().optional(),
  genre: z.string().optional(),
  manuscript: z.string().optional()
});

export const ContactMsgCreateSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  subject: z.string(),
  message: z.string()
});

export const BookCreateSchema = z.object({
  title: z.string(),
  titleHindi: z.string(),
  author: z.string(),
  authorHindi: z.string(),
  mrp: z.number(),
  price: z.number(),
  isbn: z.string(),
  genre: z.string(),
  language: z.string(),
  pages: z.number().int(),
  badge: z.string(),
  rating: z.number(),
  reviews: z.number().int(),
  available: z.boolean(),
  frontCover: z.string(),
  backCover: z.string(),
  amazonLink: z.string(),
  flipkartLink: z.string(),
  ondcLink: z.string(),
  description: z.string(),
  descriptionHindi: z.string(),
  is_hero: z.boolean().default(false),
  is_bestseller: z.boolean().default(false)
});

export const SupabaseLoginSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  profile_image: z.string().optional().nullable()
});

