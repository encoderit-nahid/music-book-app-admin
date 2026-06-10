import {api} from "@/axios";
import {useQuery, type UseQueryOptions} from "@tanstack/react-query";
import type {TSearchSchema} from "@/types/search.ts";

export interface NotificationData {
  id: string;
  type: string;
  data: {
    type: string;
    data: {
      service?: {
        company_name: string;
      };
      [key: string]: unknown;
    };
    message: string;
    icon: string;
    color: string;
    created_at: string;
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    unread_count: number;
    read_count: number;
    notifications: {
      data: NotificationData[];
      meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        first_page_url: string;
        prev_page_url: string | null;
        next_page_url: string | null;
        last_page_url: string;
        path: string;
      };
    };
  };
}

type TProps = {
  params: TSearchSchema & {
    role?: string;
  };

  options: Omit<
      UseQueryOptions<NotificationResponse, Error, NotificationResponse>,
      "queryKey" | "queryFn"
  >;
};

export const useGetAllNotifications = ({params, options}: TProps) => {
  const {page, per_page, role, search} = params;

  return useQuery({
    ...options,
    queryKey: ["notifications", page, per_page, role, search],
    queryFn: async (): Promise<NotificationResponse> => {
      const response = await api.get<NotificationResponse>("/notifications", {params});
      return response.data as NotificationResponse;
    },
  });
};
