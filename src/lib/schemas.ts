import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone must be at least 7 digits").regex(/^[\d\s+()-]+$/, "Invalid phone format"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const barberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone must be at least 7 digits").regex(/^[\d\s+()-]+$/, "Invalid phone format"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  avatar_path: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean(),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  duration_minutes: z.number().int().min(5, "Duration must be at least 5 minutes"),
  is_active: z.boolean(),
});

export const shopSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  phone: z.string().min(7, "Phone must be at least 7 digits").regex(/^[\d\s+()-]+$/, "Invalid phone format"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  is_active: z.boolean(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category_id: z.number().int().min(1, "Please select a category"),
  barcode: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
});

export const appointmentSchema = z.object({
  customer_id: z.number().int().min(1, "Please select a customer"),
  service_id: z.number().int().min(1, "Please select a service"),
  barber_id: z.number().int().min(1, "Please select a barber"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  notes: z.string().optional(),
});

export const vacationSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

export const holidaySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  recurs_yearly: z.boolean(),
  shop_ids: z.array(z.number()),
}).refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
  message: "End date must be on or after start date",
  path: ["end_date"],
});

export const shopHoursSchema = z.array(z.object({
  day_of_week: z.number().int().min(0).max(6),
  is_open: z.boolean(),
  open_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  close_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
})).refine((hours) => {
  return hours.every((h) => !h.is_open || h.close_time > h.open_time);
}, {
  message: "Close time must be after open time",
});

export const settingSchema = z.object({
  shop_name: z.string().min(2, "Shop name must be at least 2 characters"),
  shop_address: z.string().optional(),
  shop_phone: z.string().min(7).regex(/^[\d\s+()-]+$/, "Invalid phone format").optional(),
  shop_email: z.string().email("Invalid email").optional().or(z.literal("")),
  cancellation_limit_hours: z.number().int().min(1, "Must be at least 1 hour"),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type BarberInput = z.infer<typeof barberSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ShopInput = z.infer<typeof shopSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type VacationInput = z.infer<typeof vacationSchema>;
export type HolidayInput = z.infer<typeof holidaySchema>;
export type ShopHoursInput = z.infer<typeof shopHoursSchema>;
export type SettingInput = z.infer<typeof settingSchema>;