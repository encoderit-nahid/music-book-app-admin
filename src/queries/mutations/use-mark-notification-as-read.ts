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
      const response = await api.get<MarkAsReadResponse>(
        `/notifications/mark-as-read/${notificationId}`
      );
      return response.data as MarkAsReadResponse;
    },
    onSuccess: async (_data, notificationId) => {
      try {
        // Update all cached "notifications" queries in-place to mark the specific notification as read
        const queries = queryClient.getQueriesData<NotificationResponse>({ queryKey: ["notifications"] });
        queries.forEach(([queryKey, cached]) => {
          if (!cached) return;

          // Shallow clone the cached value to avoid mutating react-query internals
          const next = JSON.parse(JSON.stringify(cached)) as NotificationResponse;

          let changed = false;
          const list = next.data.notifications.data;
          for (let i = 0; i < list.length; i++) {
            const n = list[i];
            if (n.id === notificationId && !n.read_at) {
              n.read_at = new Date().toISOString();
              changed = true;
            }
          }

          if (changed) {
            // decrease unread_count safely
            next.data.unread_count = Math.max(0, (next.data.unread_count || 0) - 1);

            // update the cache for this specific query key
            queryClient.setQueryData(queryKey, next);
          }
        });
      } catch (err) {
        // If anything goes wrong updating the cache, as a fallback invalidate the notifications queries
        await queryClient.refetchQueries({ queryKey: ["notifications"] });
      }
    },
    onError: (error) => {
      toast.error(extractApiError(error, "Failed to mark notification as read."));
    },
  });
};
