import { api } from "@/axios";
import type { Category, Paginated, Single } from "@/types/glimra";

export interface CategoryPayload {
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  image?: File | null;
  sort_order?: number;
  is_active?: boolean;
}

function toFormData(data: Partial<CategoryPayload>, method?: "PUT") {
  const fd = new FormData();
  if (method) fd.append("_method", method);
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) fd.append(key, value);
    else fd.append(key, String(value));
  });
  return fd;
}

interface ReorderPayload {
  categories: { id: string; sort_order: number }[];
}

export const categoriesService = {
  list: async (params?: { search?: string; per_page?: number; page?: number }) => {
    const res = await api.get<Paginated<Category>>("/admin/categories", { params });
    return res.data;
  },
  create: async (data: Partial<CategoryPayload>) => {
    const res = await api.post<Single<Category>>("/admin/categories", toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  update: async (id: string, data: Partial<CategoryPayload>) => {
    const res = await api.post<Single<Category>>(`/admin/categories/${id}`, toFormData(data, "PUT"), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  reorder: async (data: ReorderPayload) => {
    const res = await api.put("/admin/categories/reorder", data);
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/admin/categories/${id}`);
  },
};
