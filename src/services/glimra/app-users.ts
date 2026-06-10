import { api } from "@/axios";
import type { AppUser, Book, Paginated, Single } from "@/types/glimra";

export interface AppUserFilters {
  search?: string;
  status?: boolean;
  per_page?: number;
  page?: number;
}

export const appUsersService = {
  list: async (params?: AppUserFilters) => {
    const res = await api.get<Paginated<AppUser>>("/admin/app-users", { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await api.get<Single<AppUser>>(`/admin/app-users/${id}`);
    return res.data;
  },
  setActive: async (id: string, is_active: boolean) => {
    const res = await api.put<Single<AppUser>>(`/admin/app-users/${id}/active`, { is_active });
    return res.data;
  },
  progress: async (id: string) => {
    const res = await api.get(`/admin/app-users/${id}/progress`);
    return res.data;
  },
  favorites: async (id: string) => {
    const res = await api.get<{ data: Book[] }>(`/admin/app-users/${id}/favorites`);
    return res.data;
  },
};
