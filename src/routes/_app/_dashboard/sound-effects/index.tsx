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
import { soundEffectsService } from "@/services/glimra/sound-effects";
import { categoriesService } from "@/services/glimra/categories";
import type { SoundEffect } from "@/types/glimra";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export const Route = createFileRoute("/_app/_dashboard/sound-effects/")({
  component: SoundEffectsPage,
});

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  category_id: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function SoundEffectsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SoundEffect | null>(null);
  const [toDelete, setToDelete] = useState<SoundEffect | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [playingUrl, setPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (url: string) => {
    if (playingUrl === url && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingUrl(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play()
        .then(() => setPlayingUrl(url))
        .catch(() => {
          toast.error(t("soundEffects.playError"));
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
    queryKey: ["glimra", "sound-effects", search],
    queryFn: () => soundEffectsService.list({ search: search || undefined, per_page: 100 }),
    // While any clip is still transcoding in the background, poll so the row
    // flips from "Processing" to a playable file without a manual refresh.
    refetchInterval: (query) =>
      query.state.data?.data?.some((se) => se.status === "processing") ? 4000 : false,
  });

  const { data: categories } = useQuery({
    queryKey: ["glimra", "categories", "all"],
    queryFn: () => categoriesService.list({ per_page: 100 }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", category_id: "", is_active: true },
  });

  const openCreate = () => {
    setEditing(null);
    setAudioFile(null);
    form.reset({ name: "", category_id: "", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (se: SoundEffect) => {
    setEditing(se);
    setAudioFile(null);
    form.reset({ name: se.name, category_id: se.category_id ?? "", is_active: se.is_active });
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = audioFile ? { ...values, file: audioFile } : values;
      return editing
        ? soundEffectsService.update(editing.id, payload)
        : soundEffectsService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "sound-effects"] });
      toast.success(editing ? t("soundEffects.updated") : t("soundEffects.created"));
      setDialogOpen(false);
    },
    onError: (e) => toast.error(extractApiError(e, t("soundEffects.failedToSave"))),
  });

  const remove = useMutation({
    mutationFn: (id: string) => soundEffectsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "sound-effects"] });
      toast.success(t("soundEffects.deleted"));
      setToDelete(null);
    },
    onError: (e) => toast.error(extractApiError(e, t("soundEffects.failedToSave"))),
  });

  const columns: ColumnDef<SoundEffect>[] = [
    { accessorKey: "name", header: t("soundEffects.name"), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "category", header: t("soundEffects.category"), cell: ({ row }) => row.original.category?.name ?? "—" },
    {
      accessorKey: "duration_seconds",
      header: t("soundEffects.duration"),
      cell: ({ row }) => row.original.duration_seconds ? `${row.original.duration_seconds}s` : "—",
    },
    {
      accessorKey: "file_url",
      header: t("soundEffects.file"),
      cell: ({ row }) => {
        if (row.original.status === "processing") {
          return (
            <span className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="size-4 animate-spin" /> {t("soundEffects.processing")}
            </span>
          );
        }
        if (row.original.status === "failed") {
          return <span className="text-destructive text-sm">{t("soundEffects.failed")}</span>;
        }
        const isPlaying = playingUrl === row.original.file_url;
        return row.original.file_url
          ? <Button variant="ghost" size="icon" onClick={() => togglePlay(row.original.file_url!)}>
              {isPlaying ? <Square className="size-4 text-destructive" /> : <Play className="size-4 text-primary" />}
            </Button>
          : <span className="text-muted-foreground text-sm">{t("soundEffects.noFile")}</span>;
      },
    },
    {
      accessorKey: "is_active",
      header: t("soundEffects.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
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
        title={t("soundEffects.title")}
        description={t("soundEffects.description")}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> {t("soundEffects.newSoundEffect")}
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Input placeholder={t("soundEffects.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <AppTable
        data={data?.data ?? []}
        columns={columns}
        emptyMessage={isLoading ? t("common.loading") : t("common.noResults")}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent key={editing?.id ?? "new"}>
          <DialogHeader>
            <DialogTitle>{editing ? t("soundEffects.editSoundEffect") : t("soundEffects.newSoundEffect")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("soundEffects.name")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("soundEffects.category")}</FormLabel>
                    <Select value={field.value || "none"} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                      <FormControl><SelectTrigger className="w-full"><SelectValue placeholder={t("common.select")} /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {(categories?.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>{t("soundEffects.file")}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      <Upload className="size-4" />
                      <span>{t("soundEffects.uploadFile")}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        className="hidden"
                        onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {audioFile && (
                      <p className="text-xs text-muted-foreground">{audioFile.name}</p>
                    )}
                    {!audioFile && editing?.file_url && (
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => togglePlay(editing.file_url!)}>
                          {playingUrl === editing.file_url ? <Square className="size-3" /> : <Play className="size-3" />}
                          {playingUrl === editing.file_url ? t("common.stop") : t("common.play")}
                        </Button>
                        <span className="text-xs text-muted-foreground">{t("soundEffects.noFile")}</span>
                      </div>
                    )}
                  </div>
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <label className="flex items-center gap-2 h-9 text-sm">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                        {t("common.active")}
                      </label>
                    </FormControl>
                  </FormItem>
                )}
              />
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
        title={t("soundEffects.deleteTitle")}
        description={t("soundEffects.deleteDescription", { name: toDelete?.name ?? "" })}
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </section>
  );
}
