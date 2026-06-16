import { Button } from '@/components/ui/button';
import { createFileRoute, Link, Outlet, useRouterState, redirect } from '@tanstack/react-router'
import { CornerDownLeft } from 'lucide-react';

export const Route = createFileRoute('/_auth')({
    beforeLoad: () => {
        const token = localStorage.getItem("token");
        if (token) {
            throw redirect({ to: "/", replace: true });
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    const path = useRouterState({
        select: (state) => state.location.pathname,
    });

    return (
        <div className="min-h-svh bg-[#0A0A0A] overflow-hidden flex items-center justify-center relative">
            {path !== "/login" && (
                <Button
                    variant="outline"
                    asChild
                    size={"icon"}
                    className="absolute top-4 left-4"
                >
                    <Link to="/login">
                        <CornerDownLeft />
                    </Link>
                </Button>
            )}
            <div className="w-full max-w-md flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                </div>
                <Outlet />
            </div>
        </div>
    )
}
