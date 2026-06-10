import type { LucideIcon } from "lucide-react";
import { router } from "../App";
export type TPtah = keyof typeof router.routesByPath;
export type TRoute = {
  name: string;
  url: TPtah;
  icon: LucideIcon | React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
  isVisible: boolean;
  children?: TRoute[];
};
