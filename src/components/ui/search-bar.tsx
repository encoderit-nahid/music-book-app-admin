import { useId } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "./input";


interface SearchBarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
}

export default function SearchBar({
  searchValue = "",
  searchPlaceholder = "Search...",
  onSearchChange,
}: SearchBarProps) {
  const id = useId();

  return (
    <div className="relative w-full max-w-xs">
      <Input
        id={`search-${id}`}
        className="w-full peer h-11 ps-8 pe-2 bg-custom-background placeholder:text-custom-header-text shadow-sm"
        type="search"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />

      <div className="text-custom-header-text pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2 peer-disabled:opacity-50 ">
        <SearchIcon size={16} />
      </div>
    </div>
  );
}
