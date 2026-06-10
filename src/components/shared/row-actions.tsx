import { Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
};

export function RowActions({ onView, onEdit, onDelete, className }: Props) {
  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      {onView && (
        <button
          type="button"
          onClick={onView}
          aria-label="View"
          className="text-app-text-muted hover:text-app-text transition-colors"
        >
          <Eye className="size-4" />
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label="Edit"
          className="text-app-text-muted hover:text-app-text transition-colors"
        >
          <Pencil className="size-4" />
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete"
          className="text-status-canceled-bg hover:opacity-80 transition-opacity"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
