import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export interface WeekHoursDay {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
  breaks?: { start: string; end: string }[];
}

interface WeekHoursGridProps {
  value: WeekHoursDay[];
  onChange: (value: WeekHoursDay[]) => void;
  readOnly?: boolean;
}

export function WeekHoursGrid({ value, onChange, readOnly = false }: WeekHoursGridProps) {
  function updateDay(index: number, updates: Partial<WeekHoursDay>) {
    const updated = [...value];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  }


  function addBreak(dayIndex: number) {
    const day = value[dayIndex];
    const breaks = [...(day.breaks ?? []), { start: "12:00", end: "13:00" }];
    updateDay(dayIndex, { breaks });
  }

  function removeBreak(dayIndex: number, breakIndex: number) {
    const day = value[dayIndex];
    const breaks = (day.breaks ?? []).filter((_, i) => i !== breakIndex);
    updateDay(dayIndex, { breaks });
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[120px_repeat(7,1fr)] gap-2 text-sm font-medium border-b pb-2">
        <div />
        {DAYS.map((day) => (
          <div key={day} className="text-center">{day.slice(0, 3)}</div>
        ))}
      </div>

      {value.map((day, dayIndex) => (
        <div key={dayIndex} className="grid grid-cols-[120px_repeat(7,1fr)] gap-2 items-start">
          <div className="flex items-center h-10">
            <Label className="text-sm font-medium">{DAYS[dayIndex]}</Label>
          </div>
          <div className={cn("col-span-7 grid grid-cols-7 gap-2", day.is_open ? "contents" : "opacity-50")}>
            <div className="flex items-center justify-center">
              <Checkbox
                checked={day.is_open}
                onCheckedChange={(v) => updateDay(dayIndex, { is_open: !!v })}
                disabled={readOnly}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Open</Label>
              <Input
                type="time"
                step="900"
                value={day.open_time}
                onChange={(e) => updateDay(dayIndex, { open_time: e.target.value })}
                disabled={readOnly || !day.is_open}
                className="h-8 text-xs"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Close</Label>
              <Input
                type="time"
                step="900"
                value={day.close_time}
                onChange={(e) => updateDay(dayIndex, { close_time: e.target.value })}
                disabled={readOnly || !day.is_open}
                className="h-8 text-xs"
              />
            </div>
            <div className="col-span-4">
              <div className="flex flex-wrap gap-1 items-center">
                {(day.breaks ?? []).map((b, bIndex) => (
                  <div key={bIndex} className="flex items-center gap-1 bg-muted/50 rounded px-1.5 py-0.5 text-xs">
                    <span>{b.start}</span>
                    <span>-</span>
                    <span>{b.end}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => removeBreak(dayIndex, bIndex)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
                {!readOnly && day.is_open && (
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs px-1" onClick={() => addBreak(dayIndex)}>
                    + Break
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}