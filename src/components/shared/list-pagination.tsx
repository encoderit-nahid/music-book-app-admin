import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
};

export function ListPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}: Props) {
  const { t } = useTranslation();
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // window of 5 pages around current
  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
  const pages = totalPages > 0 ? Array.from({ length: end - start + 1 }, (_, i) => start + i) : [];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-app-text-muted",
        className
      )}
    >
      <p>{t("common.showingEntries", { from, to, total })}</p>

      {totalPages > 0 && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-app-text-muted hover:text-app-text disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="size-4" /> {t("common.prev")}
          </button>

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={cn(
                "inline-flex items-center justify-center min-w-7 h-7 px-2 rounded text-xs font-medium transition-colors",
                p === page
                  ? "bg-pagination-active text-white dark:text-gray-900"
                  : "bg-pagination-inactive text-app-text-muted hover:text-app-text"
              )}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 px-2 py-1 rounded text-app-text-muted hover:text-app-text disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("common.next")} <ChevronRight className="size-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Select
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange?.(Number(v))}
        >
          <SelectTrigger size="sm" className="w-20 h-7 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>{t("common.itemsPerPage")}</span>
      </div>
    </div>
  );
}
