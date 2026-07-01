import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Music, Play, Pause, Pencil, Trash2, Plus, FileAudio } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import MultipleSelector, { type Option } from "@/components/ui/multiselect";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { ConfirmDelete } from "@/components/glimra/confirm-delete";
import { backgroundMusicService } from "@/services/glimra/background-music";
import { chaptersService } from "@/services/glimra/chapters";
import type { BackgroundMusic, Book } from "@/types/glimra";
import { extractApiError } from "@/utils/error";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  volume: z.coerce.number().min(0).max(100).default(80),
  chapter_ids: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;
type Source = "existing" | "upload";

interface Props {
  book: Book | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BackgroundMusicDialog({ book, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const bookId = book?.id ?? "";

  const [editing, setEditing] = useState<BackgroundMusic | null>(null);
  const [toDelete, setToDelete] = useState<BackgroundMusic | null>(null);
  const [source, setSource] = useState<Source>("existing");
  const [existingId, setExistingId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { name: "", volume: 80, chapter_ids: [] },
  });

  const { data: tracks } = useQuery({
    queryKey: ["glimra", "background-music", bookId],
    queryFn: () => backgroundMusicService.listByBook(bookId),
    enabled: !!bookId && open,
    refetchInterval: (query) =>
      query.state.data?.data?.some((m) => m.status === "processing") ? 4000 : false,
  });

  const { data: libraryData } = useQuery({
    queryKey: ["glimra", "background-music", "library"],
    queryFn: () => backgroundMusicService.library(),
    enabled: open,
  });

  const { data: chapters } = useQuery({
    queryKey: ["glimra", "chapters", bookId],
    queryFn: () => chaptersService.listByBook(bookId),
    enabled: !!bookId && open,
  });

  // The track currently being assigned — used to keep its own chapters visible.
  const currentTrackId = editing?.id ?? (source === "existing" ? existingId : "");

  // Hide chapters already claimed by another track in this book.
  const chapterOptions: Option[] = (chapters?.data ?? [])
    .filter((c) => !c.background_music_id || c.background_music_id === currentTrackId)
    .map((c) => ({ value: c.id, label: `#${c.chapter_number} · ${c.title}` }));

  // Library tracks not already used in this book (those are edited in the list).
  const usedIds = new Set((tracks?.data ?? []).map((tk) => tk.id));
  const libraryOptions = (libraryData?.data ?? [])
    .filter((tk) => !usedIds.has(tk.id))
    .map((tk) => ({ value: tk.id, label: tk.name }));

  const resetForm = () => {
    setEditing(null);
    setSource("existing");
    setExistingId("");
    setFile(null);
    form.reset({ name: "", volume: 80, chapter_ids: [] });
  };

  useEffect(() => {
    if (!open) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingUrl(null);
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const togglePlay = (url: string) => {
    if (playingUrl === url && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingUrl(null);
    } else {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play()
        .then(() => setPlayingUrl(url))
        .catch(() => {
          toast.error(t("backgroundMusic.playError"));
          audioRef.current = null;
          setPlayingUrl(null);
        });
      audio.addEventListener("ended", () => {
        if (audioRef.current === audio) {
          audioRef.current = null;
          setPlayingUrl(null);
        }
      });
    }
  };

  const startEdit = (track: BackgroundMusic) => {
    setEditing(track);
    setExistingId("");
    setFile(null);
    form.reset({
      name: track.name,
      volume: Math.round((track.volume ?? 0.8) * 100),
      chapter_ids: track.chapter_ids ?? [],
    });
  };

  const pickExisting = (id: string) => {
    setExistingId(id);
    const track = (libraryData?.data ?? []).find((tk) => tk.id === id);
    form.reset({
      name: track?.name ?? "",
      volume: Math.round((track?.volume ?? 0.8) * 100),
      chapter_ids: [],
    });
  };

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["glimra", "background-music", bookId] });
    qc.invalidateQueries({ queryKey: ["glimra", "background-music", "library"] });
    qc.invalidateQueries({ queryKey: ["glimra", "chapters", bookId] });
    qc.invalidateQueries({ queryKey: ["glimra", "book", bookId] });
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const volume = values.volume / 100;
      if (editing) {
        return backgroundMusicService.update(bookId, editing.id, {
          name: values.name,
          volume,
          chapter_ids: values.chapter_ids,
          file: file ?? undefined,
        });
      }
      if (source === "existing") {
        return backgroundMusicService.update(bookId, existingId, {
          volume,
          chapter_ids: values.chapter_ids,
        });
      }
      return backgroundMusicService.create(bookId, {
        name: values.name,
        volume,
        chapter_ids: values.chapter_ids,
        file: file ?? undefined,
      });
    },
    onSuccess: () => {
      invalidate();
      toast.success(editing ? t("backgroundMusic.updated") : t("backgroundMusic.created"));
      resetForm();
    },
    onError: (e) => toast.error(extractApiError(e, t("backgroundMusic.saveError"))),
  });

  const remove = useMutation({
    mutationFn: (id: string) => backgroundMusicService.remove(bookId, id),
    onSuccess: () => {
      invalidate();
      toast.success(t("backgroundMusic.removed"));
      setToDelete(null);
      if (editing && toDelete && editing.id === toDelete.id) resetForm();
    },
    onError: (e) => toast.error(extractApiError(e, t("backgroundMusic.deleteError"))),
  });

  const onSubmit = (values: FormValues) => {
    if (!editing && source === "existing" && !existingId) {
      toast.error(t("backgroundMusic.selectExistingRequired"));
      return;
    }
    if (!editing && source === "upload" && !file) {
      toast.error(t("backgroundMusic.fileRequired"));
      return;
    }
    save.mutate(values);
  };

  const statusVariant = (s: BackgroundMusic["status"]) =>
    s === "ready" ? "default" : s === "failed" ? "destructive" : "secondary";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="size-4" /> {t("backgroundMusic.title")}
            {book && <span className="text-muted-foreground font-normal">· {book.title}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tracks used in this book */}
          <div className="space-y-2">
            {(tracks?.data ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("backgroundMusic.empty")}</p>
            ) : (
              (tracks?.data ?? []).map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={!track.file_url}
                    onClick={() => track.file_url && togglePlay(track.file_url)}
                  >
                    {playingUrl === track.file_url ? <Pause className="size-4" /> : <Play className="size-4" />}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{track.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("backgroundMusic.chaptersCount", { count: track.chapter_ids?.length ?? 0 })}
                      {" · "}
                      {t("backgroundMusic.volume")}: {Math.round((track.volume ?? 0) * 100)}%
                    </p>
                  </div>
                  <Badge variant={statusVariant(track.status)}>{t(`backgroundMusic.status.${track.status}`)}</Badge>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(track)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setToDelete(track)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Add / edit form */}
          <div className="rounded-xl border p-4 bg-muted/20">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {editing ? t("backgroundMusic.editTrack") : t("backgroundMusic.addTrack")}
              </h3>
              {!editing && (
                <div className="flex gap-1 rounded-md border p-0.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={source === "existing" ? "default" : "ghost"}
                    onClick={() => { setSource("existing"); setFile(null); }}
                  >
                    {t("backgroundMusic.selectExisting")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={source === "upload" ? "default" : "ghost"}
                    onClick={() => { setSource("upload"); setExistingId(""); }}
                  >
                    {t("backgroundMusic.uploadNew")}
                  </Button>
                </div>
              )}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Source: pick an existing library track */}
                {!editing && source === "existing" && (
                  <FormItem>
                    <FormLabel>{t("backgroundMusic.existingTrack")}</FormLabel>
                    <SearchableSelect
                      className="w-full"
                      value={existingId}
                      onChange={(v) => pickExisting(String(v))}
                      placeholder={t("backgroundMusic.selectExistingPlaceholder")}
                      emptyMessage={t("backgroundMusic.libraryEmpty")}
                      options={libraryOptions}
                    />
                  </FormItem>
                )}

                {/* Name (upload new, or editing) */}
                {(editing || source === "upload") && (
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("backgroundMusic.name")}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <div className="flex items-start gap-4">
                  <FormField control={form.control} name="chapter_ids" render={({ field }) => {
                    const selected = chapterOptions.filter((o) => (field.value ?? []).includes(o.value));
                    return (
                      <FormItem className="flex-1">
                        <FormLabel>{t("backgroundMusic.chapters")}</FormLabel>
                        <FormControl>
                          <MultipleSelector
                            value={selected}
                            options={chapterOptions}
                            onChange={(opts) => field.onChange(opts.map((o) => o.value))}
                            placeholder={t("backgroundMusic.selectChapters")}
                            hidePlaceholderWhenSelected
                            emptyIndicator={<p className="text-center text-sm text-muted-foreground">{t("common.noResults")}</p>}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }} />

                  <FormField control={form.control} name="volume" render={({ field }) => (
                    <FormItem className="w-28">
                      <FormLabel>{t("backgroundMusic.volume")} %</FormLabel>
                      <FormControl><Input type="number" min={0} max={100} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* File (upload new, or replace while editing) */}
                {(editing || source === "upload") && (
                  <FormItem>
                    <FormLabel>{t("backgroundMusic.file")}</FormLabel>
                    <FormControl>
                      <div className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                          <FileAudio className="size-4" />
                          <span>{editing ? t("backgroundMusic.replaceFile") : t("backgroundMusic.uploadFile")}</span>
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                          />
                        </label>
                        {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
                        {!file && editing && <p className="text-xs text-muted-foreground">{t("backgroundMusic.keepFile")}</p>}
                      </div>
                    </FormControl>
                  </FormItem>
                )}

                <div className="flex justify-end gap-2">
                  {editing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      {t("common.cancel")}
                    </Button>
                  )}
                  <Button type="submit" loading={save.isPending}>
                    {editing ? <>{t("common.save")}</> : <><Plus className="size-4" /> {t("backgroundMusic.addTrack")}</>}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t("backgroundMusic.removeTitle")}
        description={t("backgroundMusic.removeDescription", { name: toDelete?.name ?? "" })}
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </Dialog>
  );
}
