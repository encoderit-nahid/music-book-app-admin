import { api } from "@/axios";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export interface UserDetails {
  dob: string | null;
  address: string | null;
  zip_code: string | null;
  province: string | null;
  municipality: string | null;
  country: string | null;
}

export interface User {
  id: number;
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  role: string;
  roles?: string[];
  user_role?: string;
  avatar?: string;
  selected_shop_id: number | null;
  user_details?: UserDetails | null;
  permissions?: Record<string, boolean>;
  created_at?: string;
}

const setAuthHeader = (token: string) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const useCurrentUser = () => {
  return useQuery<User | null>({
    queryKey: ["currentUser"],
    retry: false,
    refetchOnWindowFocus: false,

    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) return null;

      setAuthHeader(token);

      try {
        const res = await api.get("/auth/me");
        const user = res.data.data ?? res.data;

        localStorage.setItem("user", JSON.stringify(user));
        return user;
      } catch (error) {
        if ((error as AxiosError).response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          return null;
        }
        throw error;
      }
    },

    initialData: () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) return null;

      setAuthHeader(token);
      return JSON.parse(user);
    },
  });
};
