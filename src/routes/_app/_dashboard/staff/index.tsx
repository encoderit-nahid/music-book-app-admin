import { createFileRoute } from "@tanstack/react-router";
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
import AppTable from "@/components/app-table";
import { PageHeader } from "@/components/glimra/page-header";
import { ConfirmDelete } from "@/components/glimra/confirm-delete";
import { staffService, type Staff } from "@/services/glimra/staff";
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
import { Plus, Pencil, Trash2, Shield } from "lucide-react";

export const Route = createFileRoute("/_app/_dashboard/staff/")({
  component: StaffPage,
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters").optional().or(z.literal("")),
  role: z.enum(["super-admin", "editor"]),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function StaffPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [toDelete, setToDelete] = useState<Staff | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["glimra", "staff", search],
    queryFn: () => staffService.list({ search: search || undefined, per_page: 100 }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", role: "editor", is_active: true },
  });

  const openCreate = () => {
    setEditing(null);
    form.reset({ name: "", email: "", password: "", role: "editor", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (staff: Staff) => {
    setEditing(staff);
    form.reset({ name: staff.name, email: staff.email, password: "", role: (staff.role as any) ?? "editor", is_active: staff.is_active });
    setDialogOpen(true);
  };

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = { ...values };
      if (!payload.password) delete payload.password;
      return editing
        ? staffService.update(editing.id, payload)
        : staffService.create(payload as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "staff"] });
      toast.success(editing ? t("staff.updated") : t("staff.created"));
      setDialogOpen(false);
    },
    onError: (e) => toast.error(extractApiError(e, t("staff.failedToSave"))),
  });

  const remove = useMutation({
    mutationFn: (id: string) => staffService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "staff"] });
      toast.success(t("staff.deleted"));
      setToDelete(null);
    },
    onError: (e) => toast.error(extractApiError(e, t("staff.failedToSave"))),
  });

  const columns: ColumnDef<Staff>[] = [
    {
      id: "avatar",
      header: "",
      cell: () => <div className="size-8 rounded-full bg-muted flex items-center justify-center"><Shield className="size-4 text-muted-foreground" /></div>,
    },
    { accessorKey: "name", header: t("staff.name"), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "email", header: t("staff.email") },
    {
      accessorKey: "role",
      header: t("staff.role"),
      cell: ({ row }) => (
        <Badge variant={row.original.role === "super-admin" ? "default" : "secondary"}>
          {row.original.role === "super-admin" ? t("staff.superAdmin") : t("staff.editor")}
        </Badge>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("staff.status"),
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
        title={t("staff.title")}
        description={t("staff.description")}
        action={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> {t("staff.newStaff")}
          </Button>
        }
      />

      <div className="mb-4 max-w-xs">
        <Input placeholder={t("staff.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <AppTable
        data={data?.data ?? []}
        columns={columns}
        emptyMessage={isLoading ? t("common.loading") : t("common.noResults")}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t("staff.editStaff") : t("staff.newStaff")}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("staff.name")}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("staff.email")}</FormLabel>
                    <FormControl><Input type="email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editing && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("common.password")}</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("staff.role")}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="super-admin">{t("staff.superAdmin")}</SelectItem>
                        <SelectItem value="editor">{t("staff.editor")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
        title={t("staff.deleteTitle")}
        description={t("staff.deleteDescription", { name: toDelete?.name ?? "" })}
        loading={remove.isPending}
        onConfirm={() => toDelete && remove.mutate(toDelete.id)}
      />
    </section>
  );
}
