import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { X, ChevronsUpDown } from "lucide-react";
import { tagsService } from "@/services/glimra/tags";
import { useQuery } from "@tanstack/react-query";

interface Props {
  value: string[];
  onChange: (tags: string[]) => void;
}

export function TagInput({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: allTags } = useQuery({
    queryKey: ["glimra", "tags", "sound-effect"],
    queryFn: () => tagsService.list({ type: "sound-effects" }),
  });

  const existing = allTags?.data ?? [];

  const filtered = existing.filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !value.includes(tag.name),
  );

  const addTag = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || value.includes(trimmed)) return;
    const found = existing.find((t) => t.name === trimmed);
    if (!found) {
      try {
        await tagsService.create({ name: trimmed, type: "sound-effects" });
      } catch {
        // ignore — tag may already exist server-side
      }
    }
    onChange([...value, trimmed]);
    setSearch("");
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) {
        addTag(filtered[0].name);
      } else if (search.trim()) {
        addTag(search);
      }
    }
    if (e.key === "Backspace" && !search && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <button
              type="button"
              className="ml-0.5 rounded-full outline-none hover:bg-muted"
              onClick={() => removeTag(tag)}
            >
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-muted-foreground font-normal"
          >
            {t("soundEffects.selectTags")}
            <ChevronsUpDown className="size-4 ml-2 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              ref={inputRef}
              placeholder={t("soundEffects.searchTags")}
              value={search}
              onValueChange={setSearch}
              onKeyDown={handleKeyDown}
            />
            <CommandList>
              {search.trim() && filtered.length === 0 && (
                <CommandItem
                  onSelect={() => addTag(search)}
                  className="cursor-pointer"
                >
                  {t("soundEffects.createTag", { name: search })}
                </CommandItem>
              )}
              {filtered.length > 0 && (
                <CommandGroup heading={t("soundEffects.existingTags")}>
                  {filtered.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => addTag(tag.name)}
                      className="cursor-pointer"
                    >
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {!search.trim() && filtered.length === 0 && (
                <CommandEmpty>{t("common.noResults")}</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
