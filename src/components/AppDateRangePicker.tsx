"use client";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type DateRange = { from: Date | undefined; to?: Date | undefined };

type AppDatePickerProps = {
  name?: string;
  mode?: "single" | "multiple" | "range";
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  onChangeValue: (range: DateRange) => void;
  dateRange: DateRange | undefined;
};

export default function AppDateRangePicker({
  placeholder = "Pick a date range",
  disabled = false,
  className = "",
  onChangeValue,
  dateRange,
}: AppDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full peer h-11 ps-8 pe-2 bg-custom-background placeholder:text-custom-header-text shadow-sm",
            !dateRange?.from && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "PPP")} – {format(dateRange.to, "PPP")}
              </>
            ) : (
              format(dateRange.from, "PPP")
            )
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            onChangeValue(range || { from: undefined, to: undefined });
            console.log("🚀 ~ range:", range);
          }}
          captionLayout="dropdown"
          numberOfMonths={1}
          className="rounded-lg border shadow-sm"
        />
      </PopoverContent>
    </Popover>
  );
}
