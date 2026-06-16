import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { GripVertical, Pencil, Plus, Trash2, Image as ImageIcon } from "lucide-react";
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

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { PageHeader } from "@/components/glimra/page-header";
import { ConfirmDelete } from "@/components/glimra/confirm-delete";
import { homeSlidesService } from "@/services/glimra/home-slides";
import type { HomeSlide } from "@/types/glimra";
import { extractApiError } from "@/utils/error";

export const Route = createFileRoute("/_app/_dashboard/home-slides/")({
  component: HomeSlidesPage,
});

const schema = z.object({
  title: z.string().min(1, "Title is required").max(150),
  description: z.string().max(2000).optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function SortableSlideRow({
  slide,
  onEdit,
  onDelete,
}: {
  slide: HomeSlide;
  onEdit: (s: HomeSlide) => void;
  onDelete: (s: HomeSlide) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
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
      {slide.image
        ? <img src={slide.image} alt="" className="h-10 w-16 rounded object-cover shrink-0" />
        : <div className="h-10 w-16 rounded bg-muted flex items-center justify-center shrink-0"><ImageIcon className="size-4 text-muted-foreground" /></div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{slide.title}</p>
        {slide.description && (
          <p className="text-xs text-muted-foreground truncate">{slide.description}</p>
        )}
      </div>
      <Badge variant={slide.is_active ? "default" : "secondary"}>
        {slide.is_active ? t("common.active") : t("common.inactive")}
      </Badge>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(slide)}>
          <Pencil className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(slide)}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function HomeSlidesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<HomeSlide | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<HomeSlide | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [slidesOrder, setSlidesOrder] = useState<string[]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data, isLoading } = useQuery({
    queryKey: ["glimra", "home-slides", search, status],
    queryFn: () =>
      homeSlidesService.list({
        search: search || undefined,
        status: status === "all" ? undefined : status === "active",
        per_page: 100,
      }),
  });

  useEffect(() => {
    if (data?.data) {
      setSlidesOrder(data.data.map((s) => s.id));
    }
  }, [data]);

  const orderedSlides = slidesOrder
    .map((id) => data?.data?.find((s) => s.id === id))
    .filter(Boolean) as HomeSlide[];

  const reorderSlides = useMutation({
    mutationFn: (payload: { id: string; sort_order: number }[]) =>
      homeSlidesService.reorder({ slides: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "home-slides"] });
      toast.success(t("homeSlides.reordered"));
    },
    onError: (e) => toast.error(extractApiError(e, t("homeSlides.failedToSave"))),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setSlidesOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      const reordered = arrayMove(prev, oldIndex, newIndex);

      const payload = reordered.map((id, i) => ({ id, sort_order: i + 1 }));
      reorderSlides.mutate(payload);

      return reordered;
    });
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { title: "", description: "", is_active: true },
  });

  const openCreate = () => {
    setEditing(null);
    setImageFile(null);
    form.reset({ title: "", description: "", is_active: true });
    setDialogOpen(true);
  };
  const openEdit = (s: HomeSlide) => {
    setEditing(s);
    setImageFile(null);
    form.reset({
      title: s.title,
      description: s.description ?? "",
      is_active: s.is_active,
    });
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = imageFile ? { ...values, image: imageFile } : values;
      return editing
        ? homeSlidesService.update(editing.id, payload)
        : homeSlidesService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "home-slides"] });
      toast.success(editing ? t("homeSlides.updated") : t("homeSlides.created"));
      setDialogOpen(false);
    },
    onError: (e) => toast.error(extractApiError(e, t("homeSlides.failedToSave"))),
  });

  const remove = useMutation({
    mutationFn: (id: string) => homeSlidesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "home-slides"] });
      toast.success(t("homeSlides.deleted"));
      setToDelete(null);
    },
    onError: (e) => toast.error(extractApiError(e, t("homeSlides.failedToSave"))),
  });

  return (
    <section className="p-6">
      <PageHeader
        title={t("homeSlides.title")}
        description={t("homeSlides.description")}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> {t("homeSlides.newSlide")}
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          className="max-w-xs"
          placeholder={t("homeSlides.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("homeSlides.allStatuses")}</SelectItem>
            <SelectItem value="active">{t("common.active")}</SelectItem>
            <SelectItem value="inactive">{t("common.inactive")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {orderedSlides.length === 0 ? (
        <p className="text-sm text-muted-foreground">{isLoading ? t("common.loading") : t("common.noResults")}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={slidesOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {orderedSlides.map((slide) => (
                <SortableSlideRow
                  key={slide.id}
                  slide={slide}
                  onEdit={openEdit}
                  onDelete={setToDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent key={editing?.id ?? "new"}>
          <DialogHeader>
            <DialogTitle>{editing ? t("homeSlides.editSlide") : t("homeSlides.newSlide")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("homeSlides.titleLabel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("homeSlides.titleLabel")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("homeSlides.descriptionLabel")}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>{t("homeSlides.image")}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {editing?.image && !imageFile && (
                      <div className="flex items-center gap-3">
                        <img src={editing.image} alt="" className="h-16 w-28 rounded object-cover border" />
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      <ImageIcon className="size-4" />
                      <span>{t("homeSlides.uploadImage")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {imageFile && (
                      <p className="text-xs text-muted-foreground">{imageFile.name}</p>
                    )}
                  </div>
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.active")}</FormLabel>
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
        title={t("homeSlides.deleteTitle")}
        description={t("homeSlides.deleteDescription", { name: toDelete?.title ?? "" })}
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </section>
  );
}
