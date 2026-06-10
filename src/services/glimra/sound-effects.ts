import { api } from "@/axios";
import type { Paginated, Single, SoundEffect } from "@/types/glimra";

export interface SoundEffectFilters {
  search?: string;
  category?: string;
  per_page?: number;
  page?: number;
}

export interface SoundEffectPayload {
  name: string;
  category_id?: string | null;
  duration_seconds?: number | null;
  is_active?: boolean;
  file?: File | null;
}

function toFormData(data: Partial<SoundEffectPayload>, method?: "PUT") {
  const fd = new FormData();
  if (method) fd.append("_method", method);
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) fd.append(key, value);
    else if (typeof value === "boolean") fd.append(key, value ? "1" : "0");
    else fd.append(key, String(value));
  });
  return fd;
}

export const soundEffectsService = {
  list: async (params?: SoundEffectFilters) => {
    const res = await api.get<Paginated<SoundEffect>>("/admin/sound-effects", { params });
    return res.data;
  },
  create: async (data: Partial<SoundEffectPayload>) => {
    const res = await api.post<Single<SoundEffect>>("/admin/sound-effects", toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  update: async (id: string, data: Partial<SoundEffectPayload>) => {
    const res = await api.post<Single<SoundEffect>>(`/admin/sound-effects/${id}`, toFormData(data, "PUT"), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/admin/sound-effects/${id}`);
  },
};
