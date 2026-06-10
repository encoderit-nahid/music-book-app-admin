import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/glimra/page-header";
import { glimraSettingsService } from "@/services/glimra/settings";
import type { Setting } from "@/types/glimra";
import { toast } from "sonner";
import { extractApiError } from "@/utils/error";
import { Save } from "lucide-react";

export const Route = createFileRoute("/_app/_dashboard/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["glimra", "settings"],
    queryFn: () => glimraSettingsService.list(),
  });

  const save = useMutation({
    mutationFn: (settings: Setting[]) =>
      glimraSettingsService.update(
        settings.map((s) => ({
          key: s.key,
          value: s.type === "boolean" ? values[s.key] === "true" : values[s.key] ?? s.value,
          type: s.type,
        }))
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["glimra", "settings"] });
      toast.success(t("settings.updated"));
    },
    onError: (e) => toast.error(extractApiError(e, t("settings.failedToSave"))),
  });

  if (isLoading) {
    return <section className="p-6"><div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded" /></div></section>;
  }

  const settings = data?.data ?? [];

  if (settings.length > 0 && Object.keys(values).length === 0) {
    const initial: Record<string, string> = {};
    settings.forEach((s) => { initial[s.key] = String(s.value ?? ""); });
    if (Object.keys(values).length === 0) setValues(initial);
  }

  return (
    <section className="p-6">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
        action={
          <Button onClick={() => save.mutate(settings)} loading={save.isPending}>
            <Save className="size-4" /> {t("common.save")}
          </Button>
        }
      />

      <div className="space-y-4 max-w-xl">
        {settings.map((setting) => (
          <div key={setting.key} className="space-y-1.5">
            <label className="text-sm font-medium">{setting.key}</label>
            {setting.type === "text" ? (
              <Textarea
                rows={4}
                value={values[setting.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [setting.key]: e.target.value }))}
              />
            ) : setting.type === "boolean" ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values[setting.key] === "true"}
                  onChange={(e) => setValues((v) => ({ ...v, [setting.key]: String(e.target.checked) }))}
                />
                {values[setting.key] === "true" ? t("common.active") : t("common.inactive")}
              </label>
            ) : (
              <Input
                value={values[setting.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [setting.key]: e.target.value }))}
              />
            )}
            <p className="text-xs text-muted-foreground">{setting.type}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
