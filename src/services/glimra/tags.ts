import { api } from "@/axios";
import type { Tag } from "@/types/glimra";

export const tagsService = {
  list: async (params?: { type?: string; per_page?: number }) => {
    const res = await api.get<{ data: Tag[] }>("/admin/tags", { params });
    return res.data;
  },
  create: async (data: { name: string; type: string }) => {
    const res = await api.post<{ data: Tag }>("/admin/tags", data);
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/admin/tags/${id}`);
  },
};
