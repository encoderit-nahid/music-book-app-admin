import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  from?: Date;
  to?: Date;
  onSelect: (range: { from?: Date; to?: Date }) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  from,
  to,
  onSelect,
  placeholder = "Select date range",
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState<Date | undefined>(from);
  const [tempTo, setTempTo] = useState<Date | undefined>(to);
  // "from" = waiting for start date, "to" = waiting for end date
  const [step, setStep] = useState<"from" | "to">("from");

  useEffect(() => {
    setTempFrom(from);
    setTempTo(to);
  }, [from, to]);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setStep("from");
    setOpen(nextOpen);
  }

  function handleSelect(range: { from?: Date; to?: Date } | undefined) {
    if (step === "from") {
      // First click: lock in start date, clear end date, wait for end
      setTempFrom(range?.from);
      setTempTo(undefined);
      setStep("to");
    } else {
      // Second click: end date picked — use range.to, or range.from if picker
      // collapsed them to the same value (same-day click edge case)
      const endDate = range?.to ?? range?.from;
      const startDate = tempFrom;
      setTempTo(endDate);
      setStep("from");
      if (startDate && endDate) {
        const finalFrom = startDate <= endDate ? startDate : endDate;
        const finalTo = startDate <= endDate ? endDate : startDate;
        onSelect({ from: finalFrom, to: finalTo });
        setOpen(false);
      }
    }
  }

  const display = from && to
    ? `${format(from, "MMM d, yyyy")} – ${format(to, "MMM d, yyyy")}`
    : from
    ? `${format(from, "MMM d")} – Select end date`
    : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[280px] justify-start text-left font-normal", className)}
        >
          <CalendarIcon className="mr-2 size-4" />
          <span className="truncate">{display}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{ from: tempFrom, to: tempTo }}
          onSelect={handleSelect}
          numberOfMonths={2}
          defaultMonth={tempFrom ?? new Date()}
          className="rounded-lg border-0"
        />
        <div className="flex items-center justify-end gap-2 p-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTempFrom(undefined);
              setTempTo(undefined);
              setStep("from");
              onSelect({ from: undefined, to: undefined });
              setOpen(false);
            }}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date();
              setTempFrom(today);
              setTempTo(today);
              setStep("from");
              onSelect({ from: today, to: today });
              setOpen(false);
            }}
          >
            Today
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const f = startOfMonth(new Date());
              const t = endOfMonth(new Date());
              setTempFrom(f);
              setTempTo(t);
              setStep("from");
              onSelect({ from: f, to: t });
              setOpen(false);
            }}
          >
            This Month
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}