import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "./ui/sidebar";
import { NavMain } from "./nav-main";
import type { TRoute } from "../types";
import { useRouterState } from "@tanstack/react-router";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Loading from "./base/loading";
import IconLogo from "./base/icon-logo";
import {
  LayoutDashboard,
  BookOpen,
  Headphones,
  Users,
  Settings,
  Shield,
  Layers,
} from "lucide-react";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const {
    location: { pathname },
  } = useRouterState();

  const { open } = useSidebar();
  const { data: user, isLoading } = useCurrentUser();

  const isActiveLink = React.useCallback(
    (items: string[]) =>
      items.some((item) =>
        item === "/" ? pathname === "/" : pathname.startsWith(item)
      ),
    [pathname]
  );

  if (isLoading || !user) {
    return <Loading />;
  }

  const routes: TRoute[] = [
    {
      name: t("nav.dashboard"),
      url: "/",
      icon: LayoutDashboard,
      isActive: isActiveLink(["/"]),
      isVisible: true,
    },
    {
      name: t("nav.categories"),
      url: "/categories",
      icon: Layers,
      isActive: isActiveLink(["/categories"]),
      isVisible: true,
    },
    {
      name: t("nav.books"),
      url: "/books",
      icon: BookOpen,
      isActive: isActiveLink(["/books"]),
      isVisible: true,
    },
    {
      name: t("nav.soundEffects"),
      url: "/sound-effects",
      icon: Headphones,
      isActive: isActiveLink(["/sound-effects"]),
      isVisible: true,
    },
    {
      name: t("nav.appUsers"),
      url: "/app-users",
      icon: Users,
      isActive: isActiveLink(["/app-users"]),
      isVisible: true,
    },
    {
      name: t("nav.settings"),
      url: "/settings",
      icon: Settings,
      isActive: isActiveLink(["/settings"]),
      isVisible: true,
    },
    {
      name: t("nav.staff"),
      url: "/staff",
      icon: Shield,
      isActive: isActiveLink(["/staff"]),
      isVisible: true,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex justify-between items-center px-2 py-3">
          {open ? (
            <IconLogo monochrome="white" />
          ) : (
            <IconLogo monochrome="white" withWordmark={false} className="mx-auto" />
          )}
          {open && (
            <SidebarTrigger className="rounded-md text-white/60 hover:text-white hover:bg-white/10" />
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <NavMain routes={routes.filter((r) => r.isVisible)} />
      </SidebarContent>

      <SidebarRail />

      {open && (
        <SidebarFooter>
          <p className="text-[12px] text-white/60 px-2 pb-3">
            ©{" "}
            <span className="font-semibold">{t("brand.name")}</span>.{" "}
            {t("brand.rights")}
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
