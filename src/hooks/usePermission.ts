import { useCurrentUser } from "./useCurrentUser";

export const usePermission = () => {
  const { data: user } = useCurrentUser();

  const can = (permission: string): boolean =>
    Boolean(user?.permissions?.[permission]);

  const canAny = (permissions: string[]): boolean =>
    permissions.some((p) => can(p));

  const canAll = (permissions: string[]): boolean =>
    permissions.every((p) => can(p));

  return { can, canAny, canAll };
};
