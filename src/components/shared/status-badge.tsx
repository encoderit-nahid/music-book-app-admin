import type { AppointmentStatus } from "@/types/barber-shop";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  booked: {
    label: "Booked",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  "no-show": {
    label: "No Show",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  waiting: {
    label: "Waiting",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
     className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
