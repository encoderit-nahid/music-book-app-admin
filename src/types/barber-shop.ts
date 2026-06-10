// ─── Pagination ────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// ─── Shop ──────────────────────────────────────────────────
export interface Shop {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  barbers?: Barber[];
  services?: Service[];
  barbers_count?: number;
  services_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ShopFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
  latitude?: number | null;
  longitude?: number | null;
}

// ─── Service ───────────────────────────────────────────────────
export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number; // minutes
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormData {
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

// ─── Barber ────────────────────────────────────────────────────
export interface Barber {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  gender: 'male' | 'female' | 'other' | null;
  is_active: boolean;
  services?: Service[];
  hours?: BarberHour[];
  vacations?: Vacation[];
  current_shop?: Shop | null;
  working_hours?: WorkingHours[];
  created_at: string;
  updated_at: string;
}

export interface BarberFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: File | null;
  is_active: boolean;
  shop_id?: number | null;
  service_ids?: number[];
  working_hours?: BarberHourInput[];
  vacations?: VacationFormData[];
}

export interface BarberHour {
  id?: number;
  day_of_week: number; // 0=Sun..6=Sat (matches Carbon dayOfWeek)
  start_time: string | null;
  end_time: string | null;
  is_working: boolean;
  selected_slots?: string[];
}

export interface BarberHourInput {
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_working: boolean;
  selected_slots?: string[];
}

export interface WorkingHours {
  id?: number;
  shop_id?: number | null;
  day_of_week: number; // 0=Sun..6=Sat (matches Carbon dayOfWeek)
  day_name?: string;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  breaks: BreakSlot[];
  available_slots?: string[];
}

export interface BreakSlot {
  id?: number;
  start_time: string;
  end_time: string;
}

export interface SetShopHoursPayload {
  hours: Array<{
    day_of_week: number;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
    breaks: BreakSlot[];
  }>;
  shop_ids?: number[];
  apply_to_all?: boolean;
}

export interface Vacation {
  id?: number;
  reason?: string | null;
  start_date: string;
  end_date: string;
  scope?: 'shop' | 'barber';
  created_at?: string;
}

export interface VacationFormData {
  reason?: string;
  start_date: string;
  end_date: string;
  recurs_yearly?: boolean;
  shop_ids?: number[];
}

// ─── Customer ──────────────────────────────────────────────────
export interface UserDetails {
  dob: string | null;
  address: string | null;
  zip_code: string | null;
  province: string | null;
  municipality: string | null;
  country: string | null;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  user_details?: UserDetails | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  password?: string;
  dob?: string | null;
  address?: string | null;
  zip_code?: string | null;
  province?: string | null;
  municipality?: string | null;
  country?: string | null;
}

// ─── Appointment ───────────────────────────────────────────────
export type AppointmentStatus = 'booked' | 'completed' | 'cancelled' | 'no-show' | 'waiting';

export interface AppointmentUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  role?: string;
}

export interface Appointment {
  id: number;
  user: AppointmentUser;
  service: Service;
  barber: Barber;
  alternative_barber?: Barber | null;
  shop: Shop;
  starts_at: string;
  ends_at: string;
  alternative_starts_at?: string | null;
  alternative_ends_at?: string | null;
  status: AppointmentStatus;
  notes: string | null;
  recurring_group_id: string | null;
  created_at: string;
}

export interface AppointmentFormData {
  user_id: number;
  service_id: number;
  barber_id: number;
  shop_id?: number;
  date: string;
  time: string;
  notes?: string;
}

// ─── Contact ───────────────────────────────────────────────────
export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  updated_at: string;
}

// ─── Inventory ─────────────────────────────────────────────────
export interface InventoryCategory {
  id: number;
  name: string;
  description?: string | null;
  parent_id: number | null;
  parent?: InventoryCategory | null;
  children?: InventoryCategory[];
  products_count?: number;
  created_at: string;
}

export interface InventoryCategoryFormData {
  name: string;
  description?: string;
  parent_id?: number | null;
}

export interface ProductStock {
  id?: number;
  product_id?: number;
  shop_id: number;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  category: InventoryCategory;
  barcode: string | null;
  price?: number;
  quantity?: number;
  low_stock_threshold?: number;
  stocks?: ProductStock[];
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description?: string;
  category_id: number;
  barcode?: string;
  price?: number;
  low_stock_threshold?: number;
  stocks: { shop_id: number; quantity: number }[];
}

export interface Stock {
  id: number;
  product: Product;
  shop: Shop;
  quantity: number;
  updated_at: string;
}

// ─── Stats ─────────────────────────────────────────────────────
export interface StatsOverview {
  total_appointments: number;
  total_revenue: number;
  appointments_today: number;
  no_show_rate: number;
  cancellation_rate: number;
  busiest_day_of_week: string;
  most_requested_time: string;
  new_customers_this_month: number;
  returning_customers: number;
}

export interface ServiceStat {
  service_id: number;
  service_name: string;
  total_bookings: number;
  total_revenue: string;
  cancellation_count: string;
}

export interface BarberStat {
  barber_id: number;
  barber_name: string;
  total_clients_handled: number;
  total_appointments: number;
  revenue_generated: string;
  no_show_count: string;
}

export interface BarberStatsResponse {
  barbers: BarberStat[];
  shop_total_revenue: number;
}

export interface AppointmentStat {
  period: string;
  appointment_count: number;
  revenue: string;
}

export interface WeeklyPeakEntry {
  dayKey: string;
  intensity: number;
}

export interface HourlyDemandEntry {
  hour: string;
  bookings: number;
}

export interface HeatmapEntry {
  day_of_week: number;
  hour: number;
  count: number;
}

// ─── Settings ──────────────────────────────────────────────────
export interface ShopSettings {
  shop_name: string;
  address: string;
  phone: string;
  email: string;
  cancellation_limit_hours: number;
  timezone?: string;
}

export interface Holiday {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  recurs_yearly: boolean;
  shop_ids: number[];
  shop_names?: string[];
  date?: string;
}

export interface HolidayFormData {
  name: string;
  start_date: string;
  end_date: string;
  recurs_yearly: boolean;
  shop_ids: number[];
}

export interface ShopVacation {
  id: number;
  reason: string | null;
  start_date: string;
  end_date: string;
  recurs_yearly: boolean;
  shop_ids: number[];
  shop_names?: string[];
  vacationable_id?: number | null;
}

// ─── Inventory Summary ──────────────────────────────────────────
export interface InventorySummary {
  total_products: number;
  total_categories: number;
  total_stock_quantity: number;
  low_stock_count: number;
  low_stock_products: Product[];
  recent_products: Product[];
}
