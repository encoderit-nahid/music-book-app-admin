import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type DropdownSelectProps = {
  value?: string | number;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export function DropdownSelect({
  value,
  options,
  onChange,
  placeholder = "Select option",
  className,
  disabled = false,
}: DropdownSelectProps) {
  console.log("options",{options, value})
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  const handleSelect = (optionValue: string) => {
    if (disabled) return;
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "w-full max-w-64 h-11 flex items-center justify-between rounded-md border px-3 py-2 text-sm text-custom-header-text shadow-sm",
            disabled && "opacity-50 cursor-not-allowed bg-muted",
            className
          )}
        >
          {selectedLabel ? (
            <span>{selectedLabel}</span>
          ) : (
            <span className="text-custom-header-text">{placeholder}</span>
          )}

          <ChevronDownIcon size={16} />
        </button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-48">
        <ul className="divide-y rounded-md border bg-background text-custom-header-text max-h-60 overflow-y-auto">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm hover:bg-accent",
                  value === option.value && "bg-accent/50"
                )}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}