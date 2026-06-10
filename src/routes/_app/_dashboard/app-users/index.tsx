import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppTable from "@/components/app-table";
import { PageHeader } from "@/components/glimra/page-header";
import { appUsersService } from "@/services/glimra/app-users";
import type { AppUser } from "@/types/glimra";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { extractApiError } from "@/utils/error";
import { Search, User } from "lucide-react";

export const Route = createFileRoute("/_app/_dashboard/app-users/")({
  component: AppUsersPage,
});

function AppUsersPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["glimra", "app-users", search],
    queryFn: () => appUsersService.list({ search: search || undefined, per_page: 50 }),
  });

  const { data: userProgress } = useQuery({
    queryKey: ["glimra", "app-users", selectedUser?.id, "progress"],
    queryFn: () => appUsersService.progress(selectedUser!.id),
    enabled: !!selectedUser,
  });

  const { data: userFavorites } = useQuery({
    queryKey: ["glimra", "app-users", selectedUser?.id, "favorites"],
    queryFn: () => appUsersService.favorites(selectedUser!.id),
    enabled: !!selectedUser,
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      appUsersService.setActive(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "app-users"] });
      toast.success(t("appUsers.activated"));
    },
    onError: (e) => toast.error(extractApiError(e, "Failed to update user")),
  });

  const columns: ColumnDef<AppUser>[] = [
    {
      accessorKey: "avatar",
      header: "",
      cell: ({ row }) => (
        row.original.avatar
          ? <img src={row.original.avatar} alt="" className="size-8 rounded-full object-cover" />
          : <div className="size-8 rounded-full bg-muted flex items-center justify-center"><User className="size-4 text-muted-foreground" /></div>
      ),
    },
    { accessorKey: "name", header: t("appUsers.name"), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "email", header: t("appUsers.email") },
    {
      accessorKey: "is_active",
      header: t("appUsers.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("appUsers.joined"),
      cell: ({ row }) => row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedUser(row.original)}>
            <Search className="size-3" /> {t("appUsers.progress")}
          </Button>
          {row.original.is_active
            ? <Button variant="outline" size="sm" onClick={() => toggleActive.mutate({ id: row.original.id, is_active: false })}>
                {t("common.inactive")}
              </Button>
            : <Button variant="outline" size="sm" onClick={() => toggleActive.mutate({ id: row.original.id, is_active: true })}>
                {t("common.active")}
              </Button>
          }
        </div>
      ),
    },
  ];

  return (
    <section className="p-6">
      <PageHeader
        title={t("appUsers.title")}
        description={t("appUsers.description")}
      />

      <div className="mb-4 max-w-xs">
        <Input
          placeholder={t("appUsers.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AppTable
        data={data?.data ?? []}
        columns={columns}
        emptyMessage={isLoading ? t("common.loading") : t("common.noResults")}
      />

      <Dialog open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold mb-2">{t("appUsers.progress")}</h4>
              {userProgress?.data?.length
                ? <ul className="space-y-1">
                    {userProgress.data.slice(0, 10).map((p: any) => (
                      <li key={p.id} className="text-sm text-muted-foreground">
                        Chapter {p.chapter_id?.slice(0, 8)} — {p.is_completed ? "✅" : `${Math.round(p.percentage_completed ?? 0)}%`}
                      </li>
                    ))}
                  </ul>
                : <p className="text-sm text-muted-foreground">{t("appUsers.noProgress")}</p>
              }
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">{t("appUsers.favorites")}</h4>
              {userFavorites?.data?.length
                ? <ul className="space-y-1">
                    {userFavorites.data.map((b: any) => (
                      <li key={b.id} className="text-sm text-muted-foreground">{b.title}</li>
                    ))}
                  </ul>
                : <p className="text-sm text-muted-foreground">{t("appUsers.noFavorites")}</p>
              }
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
