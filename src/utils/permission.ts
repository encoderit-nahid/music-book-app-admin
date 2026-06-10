import type { User } from "@/hooks/useCurrentUser";

export const hasPermission = (
  user: User | undefined,
  permission: string
) => {
  return Boolean(user?.permissions?.[permission]);
};
