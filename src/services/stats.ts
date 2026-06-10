import { api } from "@/axios";
import type {
  ApiResponse,
  StatsOverview,
  ServiceStat,
  BarberStatsResponse,
  AppointmentStat,
  WeeklyPeakEntry,
  HourlyDemandEntry,
  Appointment,
} from "@/types/barber-shop";

export interface StatsFilters {
  date_from?: string;
  date_to?: string;
}

const DAY_KEYS = [
  "shortMonday",
  "shortTuesday",
  "shortWednesday",
  "shortThursday",
  "shortFriday",
  "shortSaturday",
  "shortSunday",
] as const;

const BUSINESS_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

export const statsService = {
  getOverview: async (
    params?: StatsFilters
  ): Promise<ApiResponse<StatsOverview>> => {
    const res = await api.get("/admin/stats/overview", { params });
    return res.data;
  },

  getServiceStats: async (
    params?: StatsFilters
  ): Promise<ApiResponse<ServiceStat[]>> => {
    const res = await api.get("/admin/stats/services", { params });
    return res.data;
  },

  getBarberStats: async (
    params?: StatsFilters
  ): Promise<ApiResponse<BarberStatsResponse>> => {
    const res = await api.get("/admin/stats/barbers", { params });
    return res.data;
  },

  getAppointmentStats: async (
    params?: StatsFilters
  ): Promise<ApiResponse<AppointmentStat[]>> => {
    const res = await api.get("/admin/stats/appointments", { params });
    return res.data;
  },

  getWeeklyPeakAndHourly: async (): Promise<{
    weeklyPeak: WeeklyPeakEntry[];
    hourlyDemand: HourlyDemandEntry[];
  }> => {
    const res = await api.get("/admin/appointments", {
      params: { per_page: 500 },
    });
    const appointments: Appointment[] = res.data?.data ?? [];

    const dayCount = new Array(7).fill(0);
    const hourCount: Record<number, number> = {};

    for (const apt of appointments) {
      if (apt.starts_at) {
        const dt = new Date(apt.starts_at);
        // getDay() is 0=Sun; convert to Mon=0 index
        const dow = (dt.getDay() + 6) % 7;
        dayCount[dow]++;
        const h = dt.getHours();
        hourCount[h] = (hourCount[h] ?? 0) + 1;
      }
    }

    const maxDay = Math.max(...dayCount, 1);
    const weeklyPeak: WeeklyPeakEntry[] = DAY_KEYS.map((dayKey, i) => ({
      dayKey,
      intensity: dayCount[i] / maxDay,
    }));

    const hourlyDemand: HourlyDemandEntry[] = BUSINESS_HOURS.map((h) => ({
      hour: `${h}:00`,
      bookings: hourCount[h] ?? 0,
    }));

    return { weeklyPeak, hourlyDemand };
  },
};
