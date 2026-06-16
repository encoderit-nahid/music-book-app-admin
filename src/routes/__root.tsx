
import { Link, Outlet, createRootRoute, useNavigate, useLocation } from '@tanstack/react-router'
import { Home } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <>
      <div className="min-h-svh bg-custom-background">
        <Outlet />
      </div>
    </>
  );
}

function NotFoundPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/auth/reset-password') {
      navigate({
        to: '/reset-password',
        search: Object.fromEntries(new URLSearchParams(location.search).entries()) as Record<string, string>,
        replace: true,
      });
    }
  }, [location.pathname, location.search, navigate]);
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(252,1,0,0.08)_0%,_transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">
          Error 404
        </p>

        <h1 className="select-none text-[140px] font-bold leading-none tracking-tighter sm:text-[180px] md:text-[220px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </h1>

        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-white/70 sm:text-xl">
            Page not found
          </p>
          <p className="max-w-sm text-sm text-white/40">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-white/5 px-6 text-sm font-medium text-white/80 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white hover:ring-white/20 active:scale-[0.98]"
        >
          <Home className="size-4" />
          Back to Home
        </Link>
      </div>

      <div className="absolute bottom-8 z-10 flex items-center gap-2 text-xs text-white/20">
        <div className="size-1 rounded-full bg-white/20" />
        <span>Glimra Förlag</span>
        <div className="size-1 rounded-full bg-white/20" />
      </div>
    </div>
  );
}
