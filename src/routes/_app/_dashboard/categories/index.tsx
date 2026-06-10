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
import { PageHeader } from "@/components/glimra/page-header";
import { ConfirmDelete } from "@/components/glimra/confirm-delete";
import { categoriesService } from "@/services/glimra/categories";
import type { Category } from "@/types/glimra";
import { extractApiError } from "@/utils/error";

export const Route = createFileRoute("/_app/_dashboard/categories/")({
  component: CategoriesPage,
});

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(2000).optional(),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function SortableCategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
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
      {category.image
        ? <img src={category.image} alt="" className="size-10 rounded object-cover" />
        : <div className="size-10 rounded bg-muted flex items-center justify-center shrink-0"><ImageIcon className="size-4 text-muted-foreground" /></div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{category.name}</p>
        <p className="text-xs text-muted-foreground truncate">{category.slug}</p>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {t("categories.booksCount", { count: category.books_count ?? 0 })}
      </span>
      <Badge variant={category.is_active ? "default" : "secondary"}>
        {category.is_active ? t("common.active") : t("common.inactive")}
      </Badge>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
          <Pencil className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(category)}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function CategoriesPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [categoriesOrder, setCategoriesOrder] = useState<string[]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const { data, isLoading } = useQuery({
    queryKey: ["glimra", "categories", search],
    queryFn: () => categoriesService.list({ search: search || undefined, per_page: 100 }),
  });

  useEffect(() => {
    if (data?.data) {
      setCategoriesOrder(data.data.map((c) => c.id));
    }
  }, [data]);

  const orderedCategories = categoriesOrder
    .map((id) => data?.data?.find((c) => c.id === id))
    .filter(Boolean) as Category[];

  const reorderCategories = useMutation({
    mutationFn: (payload: { id: string; sort_order: number }[]) =>
      categoriesService.reorder({ categories: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "categories"] });
      toast.success("Categories reordered");
    },
    onError: (e) => toast.error(extractApiError(e, t("categories.failedToSave"))),
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategoriesOrder((prev) => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      const reordered = arrayMove(prev, oldIndex, newIndex);

      const payload = reordered.map((id, i) => ({ id, sort_order: i + 1 }));
      reorderCategories.mutate(payload);

      return reordered;
    });
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: "", description: "", is_active: true },
  });

  const openCreate = () => {
    setEditing(null);
    setImageFile(null);
    form.reset({ name: "", description: "", is_active: true });
    setDialogOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c);
    setImageFile(null);
    form.reset({
      name: c.name,
      description: c.description ?? "",
      is_active: c.is_active,
    });
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = imageFile ? { ...values, image: imageFile } : values;
      return editing
        ? categoriesService.update(editing.id, payload)
        : categoriesService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "categories"] });
      toast.success(editing ? t("categories.updated") : t("categories.created"));
      setDialogOpen(false);
    },
    onError: (e) => toast.error(extractApiError(e, t("categories.failedToSave"))),
  });

  const remove = useMutation({
    mutationFn: (id: string) => categoriesService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "categories"] });
      toast.success(t("categories.deleted"));
      setToDelete(null);
    },
    onError: (e) => toast.error(extractApiError(e, t("categories.failedToSave"))),
  });

  return (
    <section className="p-6">
      <PageHeader
        title={t("categories.title")}
        description={t("categories.description")}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> {t("categories.newCategory")}
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Input placeholder={t("categories.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {orderedCategories.length === 0 ? (
        <p className="text-sm text-muted-foreground">{isLoading ? t("common.loading") : t("common.noResults")}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categoriesOrder} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {orderedCategories.map((category) => (
                <SortableCategoryRow
                  key={category.id}
                  category={category}
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
            <DialogTitle>{editing ? t("categories.editCategory") : t("categories.newCategory")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("categories.name")}</FormLabel>
                    <FormControl>
                      <Input placeholder="Äventyr" {...field} />
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
                    <FormLabel>{t("categories.description")}</FormLabel>
                    <FormControl>
                      <Textarea rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>{t("categories.image")}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {editing?.image && !imageFile && (
                      <div className="flex items-center gap-3">
                        <img src={editing.image} alt="" className="size-16 rounded object-cover border" />
                        <span className="text-xs text-muted-foreground">{t("categories.noImage")}</span>
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      <ImageIcon className="size-4" />
                      <span>{t("categories.uploadImage")}</span>
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
        title={t("categories.deleteTitle")}
        description={t("categories.deleteDescription", { name: toDelete?.name ?? "" })}
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </section>
  );
}
