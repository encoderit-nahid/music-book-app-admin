import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import AppTable from "@/components/app-table";
import { PageHeader } from "@/components/glimra/page-header";
import { ConfirmDelete } from "@/components/glimra/confirm-delete";
import { booksService } from "@/services/glimra/books";
import { categoriesService } from "@/services/glimra/categories";
import type { Book } from "@/types/glimra";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractApiError } from "@/utils/error";
import { Plus, BookOpen, Pencil, Trash2, Eye, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_app/_dashboard/books/")({
  component: BooksPage,
});

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  author: z.string().max(255).optional(),
  category_id: z.string().optional(),
  description: z.string().max(5000).optional(),
  age_group: z.string().optional(),
  language: z.string().default("sv"),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const AGE_GROUPS = ["4-6", "6-8", "8-12"];

function BooksPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [toDelete, setToDelete] = useState<Book | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["glimra", "books", search, page],
    queryFn: () => booksService.list({ search: search || undefined, page, per_page: 20 }),
  });

  const { data: categories } = useQuery({
    queryKey: ["glimra", "categories", "all"],
    queryFn: () => categoriesService.list({ per_page: 100 }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { title: "", author: "", description: "", language: "sv", is_active: true, age_group: "", category_id: "" },
  });

  const openCreate = () => {
    setEditing(null);
    setCoverFile(null);
    form.reset({ title: "", author: "", description: "", language: "sv", is_active: true, age_group: "", category_id: "" });
    setDialogOpen(true);
  };

  const openEdit = (book: Book) => {
    setEditing(book);
    setCoverFile(null);
    form.reset({
      title: book.title,
      author: book.author ?? "",
      description: book.description ?? "",
      language: book.language,
      is_active: book.is_active,
      age_group: book.age_group || "",
      category_id: book.category_id ?? "",
    });
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = coverFile ? { ...values, cover_image: coverFile } : values;
      return editing
        ? booksService.update(editing.id, payload)
        : booksService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "books"] });
      toast.success(editing ? t("books.updated") : t("books.created"));
      setDialogOpen(false);
    },
    onError: (e) => toast.error(extractApiError(e, t("books.failedToSave"))),
  });

  const remove = useMutation({
    mutationFn: (id: string) => booksService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "books"] });
      toast.success(t("books.deleted"));
      setToDelete(null);
    },
    onError: (e) => toast.error(extractApiError(e, t("books.failedToSave"))),
  });

  const columns: ColumnDef<Book>[] = [
    {
      accessorKey: "cover_image",
      header: "",
      cell: ({ row }) => (
        row.original.cover_image
          ? <img src={row.original.cover_image} alt="" className="size-10 rounded object-cover" />
          : <div className="size-10 rounded bg-muted flex items-center justify-center"><BookOpen className="size-4 text-muted-foreground" /></div>
      ),
    },
    {
      accessorKey: "title",
      header: t("books.title"),
      cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
    },
    { accessorKey: "author", header: t("books.author"), cell: ({ row }) => row.original.author ?? "—" },
    {
      accessorKey: "category",
      header: t("books.category"),
      cell: ({ row }) => row.original.category?.name ?? "—",
    },
    { accessorKey: "age_group", header: t("books.ageGroup"), cell: ({ row }) => row.original.age_group ?? "—" },
    { accessorKey: "total_chapters", header: t("books.chapters"), cell: ({ row }) => row.original.total_chapters },
    {
      accessorKey: "is_active",
      header: t("books.status"),
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
          <Link to="/books/$bookId" params={{ bookId: row.original.id }}>
            <Button variant="ghost" size="icon"><Eye className="size-4" /></Button>
          </Link>
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
        title={t("books.title")}
        description={t("books.description")}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> {t("books.newBook")}
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Input
          placeholder={t("books.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <AppTable
        data={data?.data ?? []}
        columns={columns}
        emptyMessage={isLoading ? t("common.loading") : t("common.noResults")}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent key={editing?.id ?? "new"} className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? t("books.editBook") : t("books.newBook")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("books.title")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t("books.author")}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age_group"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>{t("books.ageGroup")}</FormLabel>
                      <Select value={field.value} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                        <FormControl><SelectTrigger><SelectValue placeholder={t("common.select")} /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {AGE_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("books.category")}</FormLabel>
                    <Select value={field.value} onValueChange={(v) => field.onChange(v === "none" ? "" : v)}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {(categories?.data ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("books.descriptionLabel")}</FormLabel>
                    <FormControl><Textarea rows={3} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem>
                <FormLabel>{t("books.coverImage")}</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    {editing?.cover_image && !coverFile && (
                      <div className="flex items-center gap-3">
                        <img src={editing.cover_image} alt="" className="size-16 rounded object-cover border" />
                        <span className="text-xs text-muted-foreground">{t("books.noCover")}</span>
                      </div>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      <ImageIcon className="size-4" />
                      <span>{t("books.uploadCover")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                    {coverFile && (
                      <p className="text-xs text-muted-foreground">{coverFile.name}</p>
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
        title={t("books.deleteTitle")}
        description={t("books.deleteDescription", { name: toDelete?.title ?? "" })}
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </section>
  );
}
