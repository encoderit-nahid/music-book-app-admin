import { formatDateTime } from "@/utils/formatDateTime";

type Props = {
  value?: string | null;
};

export const DateTimeCell = ({ value }: Props) => {
  const formatted = formatDateTime(value);

  if (!formatted) return <span className="text-muted-foreground">N/A</span>;

  return (
    <div className="flex flex-col leading-tight">
      <span className="text-base">{formatted.dateStr}</span>
      <span className="text-base">
        {formatted.timeStr}
      </span>
    </div>
  );
};
