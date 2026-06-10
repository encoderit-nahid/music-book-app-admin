import { api } from "@/axios";
import type { Book, Paginated, Single } from "@/types/glimra";

export interface BookFilters {
  search?: string;
  author?: string;
  category?: string;
  age_group?: string;
  status?: boolean;
  per_page?: number;
  page?: number;
}

export interface BookPayload {
  title: string;
  category_ids?: string[] | null;
  subtitle?: string | null;
  author?: string | null;
  description?: string | null;
  age_group?: string | null;
  language?: string;
  is_active?: boolean;
  published_at?: string | null;
  cover_image?: File | null;
}

/** Build FormData so optional files can ride along with the fields. */
function toFormData(data: Partial<BookPayload>, method?: "PUT") {
  const fd = new FormData();
  if (method) fd.append("_method", method);
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) value.forEach((v) => fd.append(`${key}[]`, String(v)));
    else if (value instanceof File) fd.append(key, value);
    else if (typeof value === "boolean") fd.append(key, value ? "1" : "0");
    else fd.append(key, String(value));
  });
  return fd;
}

export const booksService = {
  list: async (params?: BookFilters) => {
    const res = await api.get<Paginated<Book>>("/admin/books", { params });
    return res.data;
  },
  get: async (id: string) => {
    const res = await api.get<Single<Book>>(`/admin/books/${id}`);
    return res.data;
  },
  create: async (data: Partial<BookPayload>) => {
    const res = await api.post<Single<Book>>("/admin/books", toFormData(data), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  update: async (id: string, data: Partial<BookPayload>) => {
    const res = await api.post<Single<Book>>(`/admin/books/${id}`, toFormData(data, "PUT"), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/admin/books/${id}`);
  },
};
