import { api } from "@/axios";
import type { DailyPoint, PopularBook, StatsOverview } from "@/types/glimra";

export interface StatsRange {
  date_from?: string;
  date_to?: string;
}

export const glimraStatsService = {
  overview: async () => {
    const res = await api.get<{ data: StatsOverview }>("/admin/stats/overview");
    return res.data.data;
  },
  progress: async (params?: StatsRange) => {
    const res = await api.get<{ data: DailyPoint[] }>("/admin/stats/progress", { params });
    return res.data.data;
  },
  popular: async () => {
    const res = await api.get<{ data: PopularBook[] }>("/admin/stats/popular");
    return res.data.data;
  },
  sessions: async (params?: StatsRange) => {
    const res = await api.get<{ data: DailyPoint[] }>("/admin/stats/sessions", { params });
    return res.data.data;
  },
};
