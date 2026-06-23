import { api } from "@/axios";
import type { Chapter, Single } from "@/types/glimra";

export interface ChapterPayload {
  title: string;
  chapter_number: number;
  content?: string | null;
  background_sound_id?: string | null;
}

interface ReorderPayload {
  chapters: { id: string; sort_order: number }[];
}

export const chaptersService = {
  listByBook: async (bookId: string) => {
    const res = await api.get<{ data: Chapter[] }>(`/admin/books/${bookId}/chapters`);
    return res.data;
  },
  get: async (id: string) => {
    const res = await api.get<Single<Chapter>>(`/admin/chapters/${id}`);
    return res.data;
  },
  create: async (bookId: string, data: Partial<ChapterPayload>) => {
    const res = await api.post<Single<Chapter>>(`/admin/books/${bookId}/chapters`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<ChapterPayload>) => {
    const res = await api.put<Single<Chapter>>(`/admin/chapters/${id}`, data);
    return res.data;
  },
  reorder: async (bookId: string, data: ReorderPayload) => {
    const res = await api.put(`/admin/books/${bookId}/chapters/reorder`, data);
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/admin/chapters/${id}`);
  },
};
