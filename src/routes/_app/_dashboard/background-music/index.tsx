import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppTable from "@/components/app-table";
import { PageHeader } from "@/components/glimra/page-header";
import { ConfirmDelete } from "@/components/glimra/confirm-delete";
import { backgroundMusicService } from "@/services/glimra/background-music";
import type { BackgroundMusic } from "@/types/glimra";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { extractApiError } from "@/utils/error";
import { Plus, Pencil, Trash2, Play, Square, Upload, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/_dashboard/background-music/")({
  component: BackgroundMusicPage,
});

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  volume: z.coerce.number().min(0).max(100).default(80),
});

type FormValues = z.infer<typeof schema>;

function BackgroundMusicPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BackgroundMusic | null>(null);
  const [toDelete, setToDelete] = useState<BackgroundMusic | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const { data, isLoading } = useQuery({
    queryKey: ["glimra", "background-music", "library"],
    queryFn: () => backgroundMusicService.library(),
    refetchInterval: (query) =>
      query.state.data?.data?.some((m) => m.status === "processing") ? 4000 : false,
  });

  const tracks = (data?.data ?? []).filter((m) =>
    m.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: { name: "", volume: 80 },
  });

  const openCreate = () => {
    setEditing(null);
    setAudioFile(null);
    form.reset({ name: "", volume: 80 });
    setDialogOpen(true);
  };

  const openEdit = (track: BackgroundMusic) => {
    setEditing(track);
    setAudioFile(null);
    form.reset({ name: track.name, volume: Math.round((track.volume ?? 0.8) * 100) });
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        name: values.name,
        volume: values.volume / 100,
        file: audioFile ?? undefined,
      };
      return editing
        ? backgroundMusicService.libraryUpdate(editing.id, payload)
        : backgroundMusicService.libraryCreate(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "background-music"] });
      toast.success(editing ? t("backgroundMusic.updated") : t("backgroundMusic.created"));
      setDialogOpen(false);
    },
    onError: (e) => toast.error(extractApiError(e, t("backgroundMusic.saveError"))),
  });

  const remove = useMutation({
    mutationFn: (id: string) => backgroundMusicService.libraryRemove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "background-music"] });
      toast.success(t("backgroundMusic.deleted"));
      setToDelete(null);
    },
    onError: (e) => toast.error(extractApiError(e, t("backgroundMusic.deleteError"))),
  });

  const onSubmit = (values: FormValues) => {
    if (!editing && !audioFile) {
      toast.error(t("backgroundMusic.fileRequired"));
      return;
    }
    save.mutate(values);
  };

  const columns: ColumnDef<BackgroundMusic>[] = [
    {
      accessorKey: "name",
      header: t("backgroundMusic.name"),
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: "books_count",
      header: t("backgroundMusic.bookCount"),
      cell: ({ row }) => <Badge variant="secondary">{row.original.books_count ?? 0}</Badge>,
    },
    {
      accessorKey: "chapters_count",
      header: t("backgroundMusic.chapterCount"),
      cell: ({ row }) => <Badge variant="secondary">{row.original.chapters_count ?? 0}</Badge>,
    },
    {
      accessorKey: "volume",
      header: t("backgroundMusic.volume"),
      cell: ({ row }) => `${Math.round((row.original.volume ?? 0) * 100)}%`,
    },
    {
      accessorKey: "duration_seconds",
      header: t("backgroundMusic.duration"),
      cell: ({ row }) => (row.original.duration_seconds ? `${row.original.duration_seconds}s` : "—"),
    },
    {
      accessorKey: "file_url",
      header: t("backgroundMusic.file"),
      cell: ({ row }) => {
        if (row.original.status === "processing") {
          return (
            <span className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" /> {t("backgroundMusic.status.processing")}
            </span>
          );
        }
        if (row.original.status === "failed") {
          return <span className="text-destructive text-sm">{t("backgroundMusic.status.failed")}</span>;
        }
        const isPlaying = playingUrl === row.original.file_url;
        return row.original.file_url
          ? <Button variant="ghost" size="icon" onClick={() => togglePlay(row.original.file_url!)}>
              {isPlaying ? <Square className="size-4 text-destructive" /> : <Play className="size-4 text-primary" />}
            </Button>
          : <span className="text-muted-foreground text-sm">—</span>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => openEdit(row.original)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setToDelete(row.original)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section className="p-6">
      <PageHeader
        title={t("backgroundMusic.moduleTitle")}
        description={t("backgroundMusic.moduleDescription")}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> {t("backgroundMusic.newTrack")}
          </Button>
        }
      />

      <div className="mb-4 w-full max-w-xs">
        <Input
          placeholder={t("backgroundMusic.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AppTable
        data={tracks}
        columns={columns}
        emptyMessage={isLoading ? t("common.loading") : t("common.noResults")}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent key={editing?.id ?? "new"} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("backgroundMusic.editTrack") : t("backgroundMusic.newTrack")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("backgroundMusic.name")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="volume" render={({ field }) => (
                  <FormItem className="w-28">
                    <FormLabel>{t("backgroundMusic.volume")} %</FormLabel>
                    <FormControl><Input type="number" min={0} max={100} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormItem>
                <FormLabel>{t("backgroundMusic.file")}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      <Upload className="size-4" />
                      <span>{editing ? t("backgroundMusic.replaceFile") : t("backgroundMusic.uploadFile")}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {audioFile && <p className="text-xs text-muted-foreground">{audioFile.name}</p>}
                    {!audioFile && editing?.file_url && (
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => togglePlay(editing.file_url!)}>
                          {playingUrl === editing.file_url ? <Square className="size-3" /> : <Play className="size-3" />}
                          {playingUrl === editing.file_url ? t("common.stop") : t("common.play")}
                        </Button>
                        <span className="text-xs text-muted-foreground">{t("backgroundMusic.keepFile")}</span>
                      </div>
                    )}
                  </div>
                </FormControl>
              </FormItem>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" loading={save.isPending}>
                  {editing ? t("common.save") : t("common.create")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title={t("backgroundMusic.deleteTitle")}
        description={t("backgroundMusic.deleteDescription", { name: toDelete?.name ?? "" })}
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </section>
  );
}
