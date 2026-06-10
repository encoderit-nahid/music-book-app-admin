import { createFileRoute } from "@tanstack/react-router";
import { FormForgotPassword } from "./-component";
import { Card } from "@/components/ui/card";
import IconLogo from "@/components/base/icon-logo";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/forgot-password/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card className="w-full bg-[#1a1a1a] border border-[#2d2d2d] rounded-2xl px-8 py-8 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-sm text-gray-400">Enter your email to reset password</p>
        </div>
        <IconLogo className="h-9 w-auto" monochrome="white" withWordmark={false} />
      </div>
      <FormForgotPassword />
      <div className="mt-4 text-center">
        <Link to="/login" className="text-sm text-gray-400 hover:text-white">
          Back to Login
        </Link>
      </div>
    </Card>
  );
}
