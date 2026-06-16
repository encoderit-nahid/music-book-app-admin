import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/axios";
import { toast } from "sonner";
import { extractApiError } from "@/utils/error";
import type { NotificationResponse } from "@/queries/use-get-all-notifications";

interface MarkAsReadResponse {
  success: boolean;
  message: string;
}

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["mark-notification-as-read"],
    mutationFn: async (notificationId: string): Promise<MarkAsReadResponse> => {
      const response = await api.put<MarkAsReadResponse>(
        `/notifications/mark-as-read/${notificationId}`
      );
      return response.data;
    },
    onSuccess: async (_data, notificationId) => {
      try {
        const queries = queryClient.getQueriesData<NotificationResponse>({ queryKey: ["notifications"] });
        queries.forEach(([queryKey, cached]) => {
          if (!cached) return;

          queryClient.setQueryData<NotificationResponse>(queryKey, (prev) => {
            if (!prev) return prev;

            let changed = false;
            const list = prev.data.notifications.data.map((n) => {
              if (n.id === notificationId && !n.read_at) {
                changed = true;
                return { ...n, read_at: new Date().toISOString() };
              }
              return n;
            });

            if (!changed) return prev;

            return {
              ...prev,
              data: {
                ...prev.data,
                notifications: {
                  ...prev.data.notifications,
                  data: list,
                },
                unread_count: Math.max(0, (prev.data.unread_count || 0) - 1),
              },
            };
          });
        });
      } catch (err) {
        await queryClient.refetchQueries({ queryKey: ["notifications"] });
      }
    },
    onError: (error) => {
      toast.error(extractApiError(error, "Failed to mark notification as read."));
    },
  });
};
