import { api } from "@/axios";
import type { Setting } from "@/types/glimra";

export interface SettingInput {
  key: string;
  value: unknown;
  type?: Setting["type"];
}

export const glimraSettingsService = {
  list: async () => {
    const res = await api.get<{ data: Setting[] }>("/admin/settings");
    return res.data;
  },
  update: async (settings: SettingInput[]) => {
    const res = await api.put<{ data: Setting[] }>("/admin/settings", { settings });
    return res.data;
  },
};
