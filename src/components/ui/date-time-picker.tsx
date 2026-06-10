import { format } from "date-fns";
import { type FieldValues, type Control } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CalendarIcon } from "lucide-react";

type DateTimePickerMode =
  | "date"
  | "time"
  | "datetime"
  | "dateRange"
  | "datetimeRange";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface BaseDateTimePickerProps<TFieldValues extends FieldValues = FieldValues> {
  label?: string;
  description?: string;
  placeholder?: string;
  control?: Control<TFieldValues>;
  name?: string;
  className?: string;
  disabled?: boolean;
  disablePast?: boolean;
}

interface SingleDateTimePickerProps<TFieldValues extends FieldValues = FieldValues> 
  extends BaseDateTimePickerProps<TFieldValues> {
  mode?: "date" | "time" | "datetime" | "datetimeRange";
  value?: Date;
  onChange?: (date: Date | undefined) => void;
}

interface RangeDateTimePickerProps<TFieldValues extends FieldValues = FieldValues> 
  extends BaseDateTimePickerProps<TFieldValues> {
  mode: "dateRange" | "datetimeRange";
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
}

type DateTimePickerProps<TFieldValues extends FieldValues = FieldValues> =
  | SingleDateTimePickerProps<TFieldValues>
  | RangeDateTimePickerProps<TFieldValues>;

export function DateTimePicker<TFieldValues extends FieldValues = FieldValues>(
  props: DateTimePickerProps<TFieldValues>
) {
  const {
    mode = "datetime",
    label,
    description,
    placeholder,
    value,
    onChange,
    control,
    name = "datetime",
    className,
    disabled = false,
    disablePast = false,
  } = props;
  
  const isRangeMode = mode === "dateRange" || mode === "datetimeRange";
  
  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    
    if (mode === "date") return "MM/DD/YYYY";
    if (mode === "time") return "hh:mm aa";
    if (mode === "datetime") return "MM/DD/YYYY hh:mm aa";
    if (mode === "dateRange") return "MM/DD/YYYY - MM/DD/YYYY";
    if (mode === "datetimeRange") return "MM/DD/YYYY hh:mm aa - MM/DD/YYYY hh:mm aa";
    
    return "Select date";
  };

  const getDisplayFormat = () => {
    if (mode === "date" || mode === "dateRange") return "MM/dd/yyyy";
    if (mode === "time") return "hh:mm aa";
    return "MM/dd/yyyy hh:mm aa";
  };

  const formatDisplay = (val: Date | DateRange | undefined) => {
    if (!val) return getPlaceholder();
    
    if (isRangeMode && typeof val === "object" && "from" in val) {
      const range = val as DateRange;
      if (!range.from) return getPlaceholder();
      
      const fromStr = format(range.from, getDisplayFormat());
      const toStr = range.to ? format(range.to, getDisplayFormat()) : "...";
      
      return `${fromStr} - ${toStr}`;
    }
    
    if (val instanceof Date) {
      return format(val, getDisplayFormat());
    }
    
    return getPlaceholder();
  };

  // Single date/time handlers
  const handleDateSelect = (
    date: Date | undefined,
    currentValue: Date | undefined,
    onChangeCallback: (date: Date | undefined) => void
  ) => {
    if (date) {
      if (mode === "time") {
        const currentDate = currentValue || new Date();
        const newDate = new Date(currentDate);
        newDate.setHours(date.getHours());
        newDate.setMinutes(date.getMinutes());
        onChangeCallback(newDate);
      } else {
        const newDate = mode === "datetime" && currentValue 
          ? new Date(date.setHours(currentValue.getHours(), currentValue.getMinutes()))
          : date;
        onChangeCallback(newDate);
      }
    }
  };

  const handleTimeChange = (
    type: "hour" | "minute" | "ampm",
    timeValue: string,
    currentValue: Date | undefined,
    onChangeCallback: (date: Date | undefined) => void
  ) => {
    const currentDate = currentValue || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(timeValue, 10);
      const currentHours = newDate.getHours();
      if (currentHours >= 12) {
        newDate.setHours(hour === 12 ? 12 : hour + 12);
      } else {
        newDate.setHours(hour === 12 ? 0 : hour);
      }
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(timeValue, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (timeValue === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (timeValue === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    onChangeCallback(newDate);
  };

  // Range handlers
  const handleRangeDateSelect = (
    date: Date | undefined,
    currentRange: DateRange | undefined,
    onChangeCallback: (range: DateRange | undefined) => void
  ) => {
    if (!date) return;

    const range = currentRange || { from: undefined, to: undefined };

    if (!range.from || (range.from && range.to)) {
      // Start new selection
      const newDate = mode === "datetimeRange" 
        ? new Date(date.setHours(range.from?.getHours() || 0, range.from?.getMinutes() || 0))
        : date;
      onChangeCallback({ from: newDate, to: undefined });
    } else {
      // Complete the range
      const newDate = mode === "datetimeRange" && range.from
        ? new Date(date.setHours(range.from.getHours(), range.from.getMinutes()))
        : date;
      
      if (newDate < range.from) {
        onChangeCallback({ from: newDate, to: range.from });
      } else {
        onChangeCallback({ from: range.from, to: newDate });
      }
    }
  };

  const handleRangeTimeChange = (
    type: "hour" | "minute" | "ampm",
    timeValue: string,
    currentRange: DateRange | undefined,
    onChangeCallback: (range: DateRange | undefined) => void,
    isEndTime: boolean = false
  ) => {
    const range = currentRange || { from: undefined, to: undefined };
    const currentDate = (isEndTime ? range.to : range.from) || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(timeValue, 10);
      const currentHours = newDate.getHours();
      if (currentHours >= 12) {
        newDate.setHours(hour === 12 ? 12 : hour + 12);
      } else {
        newDate.setHours(hour === 12 ? 0 : hour);
      }
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(timeValue, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (timeValue === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (timeValue === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    if (isEndTime) {
      onChangeCallback({ ...range, to: newDate });
    } else {
      onChangeCallback({ ...range, from: newDate });
    }
  };

  // Render time picker
  const renderTimePicker = (
    currentValue: Date | undefined,
    onChangeCallback: (date: Date | undefined) => void
  ) => (
    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
      <ScrollArea className="w-64 sm:w-auto">
        <div className="flex sm:flex-col p-2">
          {Array.from({ length: 12 }, (_, i) => i + 1)
            .reverse()
            .map((hour) => (
              <Button
                key={hour}
                size="icon"
                variant={
                  currentValue &&
                  currentValue.getHours() % 12 === hour % 12
                    ? "default"
                    : "ghost"
                }
                className="sm:w-full shrink-0 aspect-square"
                onClick={() => handleTimeChange("hour", hour.toString(), currentValue, onChangeCallback)}
                type="button"
              >
                {hour}
              </Button>
            ))}
        </div>
        <ScrollBar orientation="horizontal" className="sm:hidden" />
      </ScrollArea>
      <ScrollArea className="w-64 sm:w-auto">
        <div className="flex sm:flex-col p-2">
          {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
            <Button
              key={minute}
              size="icon"
              variant={
                currentValue && currentValue.getMinutes() === minute
                  ? "default"
                  : "ghost"
              }
              className="sm:w-full shrink-0 aspect-square"
              onClick={() =>
                handleTimeChange("minute", minute.toString(), currentValue, onChangeCallback)
              }
              type="button"
            >
              {minute.toString().padStart(2, "0")}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="sm:hidden" />
      </ScrollArea>
      <ScrollArea className="">
        <div className="flex sm:flex-col p-2">
          {["AM", "PM"].map((ampm) => (
            <Button
              key={ampm}
              size="icon"
              variant={
                currentValue &&
                ((ampm === "AM" && currentValue.getHours() < 12) ||
                  (ampm === "PM" && currentValue.getHours() >= 12))
                  ? "default"
                  : "ghost"
              }
              className="sm:w-full shrink-0 aspect-square"
              onClick={() => handleTimeChange("ampm", ampm, currentValue, onChangeCallback)}
              type="button"
            >
              {ampm}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  // Render range time picker
  const renderRangeTimePicker = (
    currentRange: DateRange | undefined,
    onChangeCallback: (range: DateRange | undefined) => void,
    isEndTime: boolean = false
  ) => {
    const currentValue = isEndTime ? currentRange?.to : currentRange?.from;
    
    return (
      <div className="flex flex-col space-y-2 p-3">
        <div className="text-sm font-medium text-center">
          {isEndTime ? "End Time" : "Start Time"}
        </div>
        <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
          <ScrollArea className="w-64 sm:w-auto">
            <div className="flex sm:flex-col p-2">
              {Array.from({ length: 12 }, (_, i) => i + 1)
                .reverse()
                .map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      currentValue &&
                      currentValue.getHours() % 12 === hour % 12
                        ? "default"
                        : "ghost"
                    }
                    className="sm:w-full shrink-0 aspect-square"
                    onClick={() => handleRangeTimeChange("hour", hour.toString(), currentRange, onChangeCallback, isEndTime)}
                    type="button"
                  >
                    {hour}
                  </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>
          <ScrollArea className="w-64 sm:w-auto">
            <div className="flex sm:flex-col p-2">
              {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                <Button
                  key={minute}
                  size="icon"
                  variant={
                    currentValue && currentValue.getMinutes() === minute
                      ? "default"
                      : "ghost"
                  }
                  className="sm:w-full shrink-0 aspect-square"
                  onClick={() =>
                    handleRangeTimeChange("minute", minute.toString(), currentRange, onChangeCallback, isEndTime)
                  }
                  type="button"
                >
                  {minute.toString().padStart(2, "0")}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" className="sm:hidden" />
          </ScrollArea>
          <ScrollArea className="">
            <div className="flex sm:flex-col p-2">
              {["AM", "PM"].map((ampm) => (
                <Button
                  key={ampm}
                  size="icon"
                  variant={
                    currentValue &&
                    ((ampm === "AM" && currentValue.getHours() < 12) ||
                      (ampm === "PM" && currentValue.getHours() >= 12))
                      ? "default"
                      : "ghost"
                  }
                  className="sm:w-full shrink-0 aspect-square"
                  onClick={() => handleRangeTimeChange("ampm", ampm, currentRange, onChangeCallback, isEndTime)}
                  type="button"
                >
                  {ampm}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  // Render content based on mode
  const renderContent = (
    currentValue: Date | DateRange | undefined,
    onChangeCallback: (value: Date | DateRange | undefined) => void
  ) => {
    // Range modes
    if (mode === "dateRange") {
      const rangeValue = (currentValue as DateRange) || { from: undefined, to: undefined };
      return (
        <Calendar
          mode="range"
          selected={{ from: rangeValue.from, to: rangeValue.to }}
          onSelect={(range) => {
            if (range) {
              handleRangeDateSelect(range.from, rangeValue, onChangeCallback as (range: DateRange | undefined) => void);
              if (range.to) {
                handleRangeDateSelect(range.to, { ...rangeValue, from: range.from }, onChangeCallback as (range: DateRange | undefined) => void);
              }
            }
          }}
          disabled={disablePast ? { before: new Date() } : undefined}
          initialFocus
          numberOfMonths={2}
        />
      );
    }

    if (mode === "datetimeRange") {
      const rangeValue = (currentValue as DateRange) || { from: undefined, to: undefined };
      return (
        <div className="flex flex-col">
          <Calendar
            mode="range"
            selected={{ from: rangeValue.from, to: rangeValue.to }}
            onSelect={(range) => {
              if (range) {
                handleRangeDateSelect(range.from, rangeValue, onChangeCallback as (range: DateRange | undefined) => void);
                if (range.to) {
                  handleRangeDateSelect(range.to, { ...rangeValue, from: range.from }, onChangeCallback as (range: DateRange | undefined) => void);
                }
              }
            }}
            disabled={disablePast ? { before: new Date() } : undefined}
            initialFocus
            numberOfMonths={2}
          />
          {rangeValue.from && (
            <div className="border-t">
              <div className="grid grid-cols-2 divide-x">
                {renderRangeTimePicker(rangeValue, onChangeCallback as (range: DateRange | undefined) => void, false)}
                {rangeValue.to && renderRangeTimePicker(rangeValue, onChangeCallback as (range: DateRange | undefined) => void, true)}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Single date/time modes
    const singleValue = currentValue as Date | undefined;
    
    if (mode === "time") {
      return renderTimePicker(singleValue, onChangeCallback as (date: Date | undefined) => void);
    }

    if (mode === "date") {
      return (
        <Calendar
          mode="single"
          selected={singleValue}
          onSelect={(date) => handleDateSelect(date, singleValue, onChangeCallback as (date: Date | undefined) => void)}
          disabled={disablePast ? { before: new Date() } : undefined}
          initialFocus
        />
      );
    }

    // datetime mode
    return (
      <div className="sm:flex">
        <Calendar
          mode="single"
          selected={singleValue}
          onSelect={(date) => handleDateSelect(date, singleValue, onChangeCallback as (date: Date | undefined) => void)}
          disabled={disablePast ? { before: new Date() } : undefined}
          initialFocus
        />
        {renderTimePicker(singleValue, onChangeCallback as (date: Date | undefined) => void)}
      </div>
    );
  };

  // Check if value is set for display
  const hasValue = () => {
    if (isRangeMode) {
      return !!(value as DateRange)?.from;
    }
    return !!value;
  };

  // If control is provided, use FormField (react-hook-form mode)
  if (control) {
    return (
      <FormField
        control={control}
        name={name as any}
        render={({ field }) => (
          <FormItem className={cn("flex flex-col", className)}>
            {label && <FormLabel>{label}</FormLabel>}
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      "w-full pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">{formatDisplay(field.value)}</span>
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                {renderContent(field.value, (val) => {
                  field.onChange(val);
                  onChange?.(val as any);
                })}
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  // Standalone mode (without react-hook-form)
  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !hasValue() && "text-muted-foreground"
            )}
          >
            <span className="truncate">{formatDisplay(value)}</span>
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {renderContent(value, onChange as any)}
        </PopoverContent>
      </Popover>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}

// Export types
export type { DateTimePickerMode, DateRange };