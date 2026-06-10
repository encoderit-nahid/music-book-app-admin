import { z } from "zod";

// Monthly Service Chart Schema
const MonthlyServiceChartSchema = z.object({
  total: z.string(),
  pending_count: z.string(),
  assigned_count: z.string(),
  live_count: z.string(),
  completed_count: z.string(),
  incomplete_count: z.string(),
  month: z.string(),
  month_name: z.string(),
  year: z.string(),
  status_label: z.string().nullable(),
});

// Weekly Service Chart Schema
const WeeklyServiceChartSchema = z.object({
  total: z.string(),
  pending_count: z.string(),
  assigned_count: z.string(),
  live_count: z.string(),
  completed_count: z.string(),
  incomplete_count: z.string(),
  day: z.string(),
  day_name: z.string(),
  month: z.string(),
  month_name: z.string(),
  year: z.string(),
  created_at: z.string(),
  status_label: z.string().nullable(),
});

// Dashboard Data Schema
const DashboardDataSchema = z.object({
  total_client: z.number().int(),
  total_supervisor: z.number().int(),
  total_commissioned_officer: z.number().int(),
  total_non_commissioned_officer: z.number().int(),
  total_service: z.number().int(),
  total_pending_service: z.number().int(),
  total_assigned_service: z.number().int(),
  total_live_service: z.number().int(),
  total_completed_service: z.number().int(),
  total_incomplete_service: z.number().int(),
  monthly_service_chart: z.array(MonthlyServiceChartSchema),
  weekly_service_chart: z.array(WeeklyServiceChartSchema),
});

// Root Dashboard Response Schema
export const DashboardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: DashboardDataSchema,
});

// Types
export type TDashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type TDashboardData = z.infer<typeof DashboardDataSchema>;
export type TMonthlyServiceChart = z.infer<typeof MonthlyServiceChartSchema>;
export type TWeeklyServiceChart = z.infer<typeof WeeklyServiceChartSchema>;
