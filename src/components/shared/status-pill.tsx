import { cn } from "@/lib/utils";

export type PillStatus = "booked" | "completed" | "canceled" | "no-show" | "cancelled" | "waiting";

const styles: Record<PillStatus, string> = {
  booked: "bg-status-booked-bg text-status-booked-text",
  completed: "bg-status-completed-bg text-status-completed-text",
  canceled: "bg-status-canceled-bg text-status-canceled-text",
  "no-show": "bg-status-canceled-bg text-status-canceled-text",
  cancelled: "bg-status-canceled-bg text-status-canceled-text",
  waiting: "bg-yellow-100 text-yellow-800",
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: PillStatus;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        styles[status],
        className
      )}
    >
      {label}
    </span>
  );
}
