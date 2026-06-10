import { createFileRoute, Link } from '@tanstack/react-router'
import { ShieldX, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/forbidden')({
  component: ForbiddenPage,
})

function ForbiddenPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-[#0A0A0A] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(252,1,0,0.06)_0%,_transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <ShieldX className="size-9 text-red-400/80" />
        </div>

        <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-white/30">
          Error 403
        </p>

        <h1 className="select-none text-[140px] font-bold leading-none tracking-tighter sm:text-[180px] md:text-[220px]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          403
        </h1>

        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-medium text-white/70 sm:text-xl">
            Access denied
          </p>
          <p className="max-w-sm text-sm text-white/40">
            You don't have permission to access this page. Contact your administrator if you think this is a mistake.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex h-11 items-center gap-2.5 rounded-xl bg-white/5 px-6 text-sm font-medium text-white/80 ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white hover:ring-white/20 active:scale-[0.98]"
        >
          <ArrowLeft className="size-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="absolute bottom-8 z-10 flex items-center gap-2 text-xs text-white/20">
        <div className="size-1 rounded-full bg-white/20" />
        <span>Barber Shop</span>
        <div className="size-1 rounded-full bg-white/20" />
      </div>
    </div>
  )
}
