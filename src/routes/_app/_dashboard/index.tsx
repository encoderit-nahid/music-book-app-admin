import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { glimraStatsService } from "@/services/glimra/stats";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  BookOpen,
  Users,
  Headphones,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Heart,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_app/_dashboard/")({
  component: RouteComponent,
});

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function RouteComponent() {
  const { t } = useTranslation();

  const { data: overview, isLoading } = useQuery({
    queryKey: ["glimra", "stats", "overview"],
    queryFn: () => glimraStatsService.overview(),
  });

  const { data: popular } = useQuery({
    queryKey: ["glimra", "stats", "popular"],
    queryFn: () => glimraStatsService.popular(),
  });

  const { data: progress } = useQuery({
    queryKey: ["glimra", "stats", "progress"],
    queryFn: () => glimraStatsService.progress(),
  });

  if (isLoading) {
    return (
      <section className="p-6 bg-background min-h-full flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </section>
    );
  }

  const kpiCards = [
    {
      label: t("dashboard.totalUsers"),
      value: fmt(overview?.total_users ?? 0),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: t("dashboard.activeUsers"),
      value: fmt(overview?.active_users ?? 0),
      icon: Heart,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: t("dashboard.totalBooks"),
      value: fmt(overview?.total_books ?? 0),
      icon: BookOpen,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: t("dashboard.totalChapters"),
      value: fmt(overview?.total_chapters ?? 0),
      icon: Layers,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: t("dashboard.totalSoundEffects"),
      value: fmt(overview?.total_sound_effects ?? 0),
      icon: Headphones,
      color: "text-rose-600",
      bg: "bg-rose-100 dark:bg-rose-900/30",
    },
    {
      label: t("dashboard.completedChapters"),
      value: fmt(overview?.completed_chapters ?? 0),
      icon: Sparkles,
      color: "text-indigo-600",
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      label: t("dashboard.totalSessions"),
      value: fmt(overview?.total_sessions ?? 0),
      icon: Clock,
      color: "text-cyan-600",
      bg: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      label: t("dashboard.readingMinutes"),
      value: fmt(overview?.total_reading_minutes ?? 0),
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-900/30",
    },
  ];

  return (
    <section className="p-6 space-y-6 bg-background min-h-full">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.label}
              className="bg-card border-border rounded-xl shadow-none"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs text-gray-500">{card.label}</p>
                  <div className={`${card.bg} p-2 rounded-lg`}>
                    <Icon className={`size-4 ${card.color}`} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {card.value}
                </h3>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Popular Books */}
      {popular && popular.length > 0 && (
        <Card className="bg-card border-border rounded-xl shadow-none">
          <div className="p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              {t("dashboard.popularBooks")}
            </h3>
            <div className="space-y-3">
              {popular.slice(0, 5).map((book) => (
                <div
                  key={book.book_id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {book.title}
                  </span>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1">
                      <Heart className="size-3" /> {book.favorites_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="size-3" /> {book.completions_count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Progress Chart */}
      {progress && progress.length > 0 && (
        <Card className="bg-white dark:bg-sidebar border border-gray-200 dark:border-sidebar-border rounded-xl shadow-none">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-5">
              {t("dashboard.progressOverTime")}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={progress}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                barCategoryGap="20%"
              >
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#9ca3af" }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Bar
                  dataKey="count"
                  radius={[4, 4, 0, 0]}
                  fill="#8b8cf8"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </section>
  );
}
