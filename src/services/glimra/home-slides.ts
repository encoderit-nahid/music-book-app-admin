import { api } from "@/axios";
import type { HomeSlide, Paginated, Single } from "@/types/glimra";

export interface HomeSlidePayload {
  title: string;
  description?: string | null;
  image?: File | null;
  sort_order?: number;
  is_active?: boolean;
}

function toFormData(data: Partial<HomeSlidePayload>, method?: "PUT") {
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
  slides: { id: string; sort_order: number }[];
}

export const homeSlidesService = {
  list: async (params?: { search?: string; status?: boolean; per_page?: number; page?: number }) => {
    const res = await api.get<Paginated<HomeSlide>>("/admin/home-slides", { params });
    return res.data;
  },
  create: async (data: Partial<HomeSlidePayload>) => {
    const res = await api.post<Single<HomeSlide>>("/admin/home-slides", toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  update: async (id: string, data: Partial<HomeSlidePayload>) => {
    const res = await api.post<Single<HomeSlide>>(`/admin/home-slides/${id}`, toFormData(data, "PUT"), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  reorder: async (data: ReorderPayload) => {
    const res = await api.put("/admin/home-slides/reorder", data);
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/admin/home-slides/${id}`);
  },
};
