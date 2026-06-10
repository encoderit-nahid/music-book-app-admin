import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePermission } from "@/hooks/usePermission";
import Loading from "@/components/base/loading";

interface Props {
  /** Single permission or array — user needs at least one (OR logic). */
  permission: string | string[];
  children: ReactNode;
}

export function RequirePermission({ permission, children }: Props) {
  const { data: user, isLoading, isFetching } = useCurrentUser();
  const { canAny } = usePermission();
  const navigate = useNavigate();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = !!user && canAny(permissions);

  useEffect(() => {
    if (isLoading || isFetching) return;
    if (!user) {
      navigate({ to: "/login", replace: true });
      return;
    }
    if (!hasAccess) {
      navigate({ to: "/forbidden", replace: true });
    }
  }, [user, isLoading, isFetching, hasAccess, navigate]);

  if (isLoading || (isFetching && !user)) {
    return (
      <div className="flex h-svh w-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!user || !hasAccess) return null;

  return <>{children}</>;
}
