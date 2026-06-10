

import type { TFormType } from "@/types/form";
// import type { LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { Button } from "./button";


type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type TProps = {
  actions: {
    type: TFormType;
    name: string;
    icon: IconType;
    props: React.ComponentProps<typeof Button>;
  }[];
};

export default function AppActionsDropdown({ actions }: TProps) {
  return (
    <div className="flex gap-1">
      {actions.map(({ name, icon: Icon, props }) => (
        <Button key={name} variant="ghost" size="icon" {...props}>
          <Icon />
        </Button>
      ))}
    </div>
  );
}

