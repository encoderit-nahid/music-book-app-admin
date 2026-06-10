import { createFileRoute } from "@tanstack/react-router";
import { FormResetPassword } from "./-component";
import { Card } from "@/components/ui/card";
import IconLogo from "@/components/base/icon-logo";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/reset-password/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string || "",
      email: search.email as string || "",
    };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { token, email } = Route.useSearch();

  return (
    <Card className="w-full bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl px-8 py-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-sm text-gray-400">Enter your new password</p>
        </div>
        <IconLogo className="h-9 w-auto" monochrome="white" withWordmark={false} />
      </div>
      <FormResetPassword token={token} email={email} />
      <div className="mt-4 text-center">
        <Link to="/login" className="text-sm text-gray-400 hover:text-white">
          Back to Login
        </Link>
      </div>
    </Card>
  );
}
