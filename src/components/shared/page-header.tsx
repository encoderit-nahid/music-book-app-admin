import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-6 py-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {actionLabel && onAction && (
          <Button onClick={onAction} className="gap-1.5">
            {actionIcon ?? <Plus className="size-4" />}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
