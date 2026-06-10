import { api } from "@/axios";
import type { Single, TriggerWord } from "@/types/glimra";

export interface TriggerWordPayload {
  trigger_word: string;
  variants?: string[];
  match_type?: "exact" | "contains" | "phonetic";
  sound_effect_id?: string | null;
  volume?: number;
  delay_ms?: number;
  cooldown_ms?: number;
  repeat_allowed?: boolean;
  is_chapter_end?: boolean;
  is_active?: boolean;
}

export const triggerWordsService = {
  listByChapter: async (chapterId: string) => {
    const res = await api.get<{ data: TriggerWord[] }>(`/admin/chapters/${chapterId}/trigger-word-mappings`);
    return res.data;
  },
  create: async (chapterId: string, data: TriggerWordPayload) => {
    const res = await api.post<Single<TriggerWord>>(`/admin/chapters/${chapterId}/trigger-word-mappings`, data);
    return res.data;
  },
  update: async (id: string, data: Partial<TriggerWordPayload>) => {
    const res = await api.put<Single<TriggerWord>>(`/admin/trigger-word-mappings/${id}`, data);
    return res.data;
  },
  remove: async (id: string) => {
    await api.delete(`/admin/trigger-word-mappings/${id}`);
  },
};
