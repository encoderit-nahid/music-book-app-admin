import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppTable from "@/components/app-table";
import { ConfirmDelete } from "@/components/glimra/confirm-delete";
import { booksService } from "@/services/glimra/books";
import { chaptersService } from "@/services/glimra/chapters";
import { triggerWordsService } from "@/services/glimra/trigger-words";
import { soundEffectsService } from "@/services/glimra/sound-effects";
import type { Chapter, TriggerWord } from "@/types/glimra";
import type { ColumnDef } from "@tanstack/react-table";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { extractApiError } from "@/utils/error";
import {
  Plus,
  BookOpen,
  Pencil,
  Trash2,
  ArrowLeft,
  Volume2,
  GripVertical,
} from "lucide-react";

export const Route = createFileRoute("/_app/_dashboard/books/$bookId/")({
  component: BookDetailPage,
});

const chapterSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  chapter_number: z.coerce.number().int().min(1),
  content: z.string().optional(),
});

const triggerSchema = z.object({
  trigger_word: z.string().min(1, "Word is required"),
  match_type: z.enum(["exact", "contains", "phonetic"]).default("exact"),
  sound_effect_id: z.string().optional(),
  volume: z.coerce.number().min(0).max(100).default(80),
  delay_ms: z.coerce.number().int().min(0).default(0),
  cooldown_ms: z.coerce.number().int().min(0).default(2000),
  repeat_allowed: z.boolean().default(true),
  is_active: z.boolean().default(true),
  variants: z.string().optional(),
});

type ChapterForm = z.infer<typeof chapterSchema>;
type TriggerForm = z.infer<typeof triggerSchema>;

function BookDetailPage() {
  const { t } = useTranslation();
  const { bookId } = useParams({ from: Route.id });
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [chapterDialog, setChapterDialog] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [toDeleteChapter, setToDeleteChapter] = useState<Chapter | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [triggerDialog, setTriggerDialog] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TriggerWord | null>(null);
  const [toDeleteTrigger, setToDeleteTrigger] = useState<TriggerWord | null>(null);
  const [chaptersOrder, setChaptersOrder] = useState<string[]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const reorderChapters = useMutation({
    mutationFn: (data: { id: string; sort_order: number }[]) =>
      chaptersService.reorder(bookId, { chapters: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "chapters", bookId] });
      toast.success("Chapters reordered");
    },
    onError: (e) => toast.error(extractApiError(e, t("chapters.saveError"))),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setChaptersOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      const reordered = arrayMove(prev, oldIndex, newIndex);

      const payload = reordered.map((id, i) => ({ id, sort_order: i + 1 }));
      reorderChapters.mutate(payload);

      return reordered;
    });
  };

  const { data: book, isLoading } = useQuery({
    queryKey: ["glimra", "book", bookId],
    queryFn: () => booksService.get(bookId),
  });

  const { data: chapters } = useQuery({
    queryKey: ["glimra", "chapters", bookId],
    queryFn: () => chaptersService.listByBook(bookId),
    enabled: !!bookId,
  });

  useEffect(() => {
    if (chapters?.data) {
      setChaptersOrder(chapters.data.map((c) => c.id));
    }
  }, [chapters]);

  const orderedChapters = chaptersOrder
    .map((id) => chapters?.data?.find((c) => c.id === id))
    .filter(Boolean) as Chapter[];

  const { data: triggers } = useQuery({
    queryKey: ["glimra", "triggers", selectedChapter],
    queryFn: () => triggerWordsService.listByChapter(selectedChapter!),
    enabled: !!selectedChapter,
  });

  const { data: soundEffects } = useQuery({
    queryKey: ["glimra", "sound-effects", "all"],
    queryFn: () => soundEffectsService.list({ per_page: 100 }),
  });

  const chapterForm = useForm<ChapterForm>({
    resolver: zodResolver(chapterSchema) as any,
    defaultValues: { title: "", chapter_number: 1, content: "" },
  });

  const triggerForm = useForm<TriggerForm>({
    resolver: zodResolver(triggerSchema) as any,
    defaultValues: {
      trigger_word: "",
      match_type: "exact",
      sound_effect_id: "",
      volume: 80,
      delay_ms: 0,
      cooldown_ms: 2000,
      repeat_allowed: true,
      is_active: true,
      variants: "",
    },
  });

  const openChapterCreate = () => {
    setEditingChapter(null);
    chapterForm.reset({ title: "", chapter_number: (chapters?.data?.length ?? 0) + 1, content: "" });
    setChapterDialog(true);
  };

  const openChapterEdit = (ch: Chapter) => {
    setEditingChapter(ch);
    chapterForm.reset({
      title: ch.title,
      chapter_number: ch.chapter_number,
      content: ch.content ?? "",
    });
    setChapterDialog(true);
  };

  const saveChapter = useMutation({
    mutationFn: (values: ChapterForm) => {
      return editingChapter
        ? chaptersService.update(editingChapter.id, values)
        : chaptersService.create(bookId, values);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "chapters", bookId] });
      qc.invalidateQueries({ queryKey: ["glimra", "book", bookId] });
      toast.success(editingChapter ? t("chapters.updated") : t("chapters.created"));
      setChapterDialog(false);
    },
    onError: (e) =>       toast.error(extractApiError(e, t("chapters.saveError"))),
  });

  const deleteChapter = useMutation({
    mutationFn: (id: string) => chaptersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "chapters", bookId] });
      qc.invalidateQueries({ queryKey: ["glimra", "book", bookId] });
      toast.success(t("chapters.deleted"));
      setToDeleteChapter(null);
    },
    onError: (e) =>       toast.error(extractApiError(e, t("chapters.deleteError"))),
  });

  const openTriggerCreate = () => {
    setEditingTrigger(null);
    triggerForm.reset({
      trigger_word: "",
      match_type: "exact",
      sound_effect_id: "",
      volume: 80, delay_ms: 0, cooldown_ms: 2000,
      repeat_allowed: true, is_active: true, variants: "",
    });
    setTriggerDialog(true);
  };

  const openTriggerEdit = (tr: TriggerWord) => {
    setEditingTrigger(tr);
    triggerForm.reset({
      trigger_word: tr.trigger_word,
      match_type: tr.match_type,
      sound_effect_id: tr.sound_effect_id ?? "",
      volume: Math.round(tr.volume * 100),
      delay_ms: tr.delay_ms,
      cooldown_ms: tr.cooldown_ms,
      repeat_allowed: tr.repeat_allowed,
      is_active: tr.is_active,
      variants: Array.isArray(tr.variants) ? tr.variants.join(", ") : "",
    });
    setTriggerDialog(true);
  };

  const saveTrigger = useMutation({
    mutationFn: (values: TriggerForm) => {
      const payload = {
        ...values,
        volume: values.volume / 100,
        variants: values.variants ? values.variants.split(",").map((v) => v.trim()).filter(Boolean) : [],
      };
      return editingTrigger
        ? triggerWordsService.update(editingTrigger.id, payload)
        : triggerWordsService.create(selectedChapter!, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "triggers", selectedChapter] });
      toast.success(t("chapters.saved"));
      setTriggerDialog(false);
    },
    onError: (e) =>       toast.error(extractApiError(e, t("chapters.saveError"))),
  });

  const deleteTrigger = useMutation({
    mutationFn: (id: string) => triggerWordsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "triggers", selectedChapter] });
      toast.success(t("chapters.triggerDeleted"));
      setToDeleteTrigger(null);
    },
    onError: (e) => toast.error(extractApiError(e, t("chapters.deleteTriggerError"))),
  });

  function SortableChapterRow({ chapter }: { chapter: Chapter }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: chapter.id,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flex items-center gap-3 rounded-lg border bg-card p-3 shadow-sm"
      >
        <button
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <span className="w-8 text-center font-mono text-sm text-muted-foreground">
          {chapter.chapter_number}
        </span>
        <span className="flex-1 truncate text-sm font-medium">{chapter.title}</span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {t("chapters.triggersCount", { count: chapter.triggers_count ?? 0 })}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant={selectedChapter === chapter.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedChapter(selectedChapter === chapter.id ? null : chapter.id)}
          >
            <Volume2 className="size-4" /> {t("chapters.triggers")}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => openChapterEdit(chapter)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setToDeleteChapter(chapter)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>
    );
  }

  const triggerColumns: ColumnDef<TriggerWord>[] = [
    { accessorKey: "trigger_word", header: t("chapters.triggerWord"), cell: ({ row }) => <span className="font-medium">{row.original.trigger_word}</span> },
    {
      accessorKey: "match_type",
      header: t("chapters.matchType"),
      cell: ({ row }) => <Badge variant="outline">{row.original.match_type}</Badge>,
    },
    {
      accessorKey: "sound_effect",
      header: t("chapters.soundEffect"),
      cell: ({ row }) => row.original.sound_effect?.name ?? "—",
    },
    { accessorKey: "volume", header: t("chapters.volume"), cell: ({ row }) => `${Math.round(row.original.volume * 100)}%` },
    {
      accessorKey: "is_active",
      header: t("common.status"),
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
          <Button variant="ghost" size="icon" onClick={() => openTriggerEdit(row.original)}>
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setToDeleteTrigger(row.original)}>
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (isLoading) return <section className="p-6"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div></section>;

  const b = book?.data;

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: "/books" })}>
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            {b?.cover_image
              ? <img src={b.cover_image} alt="" className="size-12 rounded object-cover" />
              : <div className="size-12 rounded bg-muted flex items-center justify-center"><BookOpen className="size-5 text-muted-foreground" /></div>
            }
            <div>
              <h1 className="text-2xl font-bold">{b?.title}</h1>
              <p className="text-sm text-muted-foreground">{b?.author} · {b?.category?.name} · {b?.age_group ?? t("common.allAges")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("chapters.title")}</h2>
        <Button onClick={openChapterCreate} size="sm"><Plus className="size-4" /> {t("chapters.newChapter")}</Button>
      </div>

      {orderedChapters.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("common.noResults")}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={chaptersOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {orderedChapters.map((chapter) => (
                <SortableChapterRow key={chapter.id} chapter={chapter} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {selectedChapter && (
        <div className="space-y-4 border rounded-xl p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("chapters.triggers")}</h3>
            <Button onClick={openTriggerCreate} size="sm" variant="outline"><Plus className="size-3" /> {t("chapters.addTrigger")}</Button>
          </div>
          <AppTable
            data={triggers?.data ?? []}
            columns={triggerColumns}
            emptyMessage={t("chapters.noTriggers")}
          />
        </div>
      )}

      <Dialog open={chapterDialog} onOpenChange={setChapterDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingChapter ? t("chapters.editChapter") : t("chapters.newChapter")}</DialogTitle></DialogHeader>
          <Form {...chapterForm}>
            <form onSubmit={chapterForm.handleSubmit((v) => saveChapter.mutate(v))} className="space-y-4">
              <FormField control={chapterForm.control} name="chapter_number" render={({ field }) => (
                <FormItem><FormLabel>{t("chapters.chapterNumber")}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={chapterForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>{t("chapters.chapterTitle")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={chapterForm.control} name="content" render={({ field }) => (
                <FormItem><FormLabel>{t("chapters.content")}</FormLabel><FormControl><Textarea rows={4} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setChapterDialog(false)}>{t("common.cancel")}</Button>
                <Button type="submit" loading={saveChapter.isPending}>{editingChapter ? t("common.save") : t("common.create")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={triggerDialog} onOpenChange={setTriggerDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingTrigger ? t("chapters.editTrigger") : t("chapters.addTrigger")}</DialogTitle></DialogHeader>
          <Form {...triggerForm}>
            <form onSubmit={triggerForm.handleSubmit((v) => saveTrigger.mutate(v))} className="space-y-4">
              <div className="flex gap-4">
                <FormField control={triggerForm.control} name="trigger_word" render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>{t("chapters.triggerWord")}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={triggerForm.control} name="match_type" render={({ field }) => (
                  <FormItem className="w-32"><FormLabel>{t("chapters.matchType")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="exact">{t("chapters.exact")}</SelectItem>
                        <SelectItem value="contains">{t("chapters.contains")}</SelectItem>
                        <SelectItem value="phonetic">{t("chapters.phonetic")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={triggerForm.control} name="sound_effect_id" render={({ field }) => (
                <FormItem><FormLabel>{t("chapters.soundEffect")}</FormLabel>
                    <Select value={field.value} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">—</SelectItem>
                      {(soundEffects?.data ?? []).map((se) => <SelectItem key={se.id} value={se.id}>{se.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-4">
                <FormField control={triggerForm.control} name="volume" render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>{t("chapters.volume")}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={triggerForm.control} name="delay_ms" render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>{t("chapters.delayMs")}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={triggerForm.control} name="cooldown_ms" render={({ field }) => (
                  <FormItem className="flex-1"><FormLabel>{t("chapters.cooldownMs")}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={triggerForm.control} name="variants" render={({ field }) => (
                <FormItem><FormLabel>{t("chapters.variants")}</FormLabel><FormControl><Input placeholder="hästen, hästarna" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={triggerForm.control} name="repeat_allowed" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                      {t("chapters.repeatAllowed")}
                    </label>
                  </FormControl>
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTriggerDialog(false)}>{t("common.cancel")}</Button>
                <Button type="submit" loading={saveTrigger.isPending}>{editingTrigger ? t("common.save") : t("common.create")}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <ConfirmDelete
        open={!!toDeleteChapter}
        onOpenChange={(o) => !o && setToDeleteChapter(null)}
        title={t("chapters.deleteTitle")}
        description={t("chapters.deleteDescription", { name: toDeleteChapter?.title ?? "" })}
        loading={deleteChapter.isPending}
        onConfirm={() => toDeleteChapter && deleteChapter.mutate(toDeleteChapter.id)}
      />

      <ConfirmDelete
        open={!!toDeleteTrigger}
        onOpenChange={(o) => !o && setToDeleteTrigger(null)}
        title={t("chapters.deleteTriggerTitle")}
        description={t("chapters.deleteTriggerDescription", { name: toDeleteTrigger?.trigger_word ?? "" })}
        loading={deleteTrigger.isPending}
        onConfirm={() => toDeleteTrigger && deleteTrigger.mutate(toDeleteTrigger.id)}
      />
    </section>
  );
}
