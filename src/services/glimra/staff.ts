import { api } from "@/axios";
import type { Paginated, Single } from "@/types/glimra";

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: string | null;
  roles?: string[];
  is_active: boolean;
  created_at?: string;
}

export interface StaffPayload {
  name: string;
  email: string;
  password?: string;
  role: "super-admin" | "editor";
  is_active?: boolean;
}

export const staffService = {
  list: async (params?: { search?: string; per_page?: number; page?: number }) => {
    const res = await api.get<Paginated<Staff>>("/admin/staff", { params });
    return res.data;
  },
  create: async (data: StaffPayload) => {
    const res = await api.post<Single<Staff>>("/admin/staff", data);
    return res.data;
  },
  update: async (id: string, data: Partial<StaffPayload>) => {
    const res = await api.put<Single<Staff>>(`/admin/staff/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/admin/staff/${id}`);
  },
};
