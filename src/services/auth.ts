import { api } from "@/axios";

export const authService = {
  login: async (data: {
    email: string;
    password: string;
  }): Promise<{ token: string; user: any }> => {
    const res = await api.post("/auth/admin/login", data);
    return res.data.data ?? res.data;
  },

  me: async (): Promise<any> => {
    const res = await api.get("/auth/me");
    return res.data.data ?? res.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  changePassword: async (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }): Promise<void> => {
    await api.put("/auth/change-password", data);
  },
};
