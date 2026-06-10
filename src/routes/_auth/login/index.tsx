import { createFileRoute } from "@tanstack/react-router";
import { FormLogin } from "./-component";
import { Card } from "@/components/ui/card";
import IconLogo from "@/components/base/icon-logo";

export const Route = createFileRoute("/_auth/login/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="w-full bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl px-8 py-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Login</h1>
          <p className="text-sm text-gray-400">to get started</p>
        </div>
        <IconLogo className="w-auto" monochrome="white" withWordmark={true} />
      </div>
      <FormLogin />
    </Card>
  );
}
