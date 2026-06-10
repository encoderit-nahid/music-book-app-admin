import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { TFormSchema } from "../-type";
import { api } from "../../../../axios";
import { toast } from "sonner";
import { extractApiError } from "../../../../utils/error";

export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["auth/reset-password"],
    mutationFn: (body: TFormSchema) => {
      return api.post("/auth/reset-password", {
        token: body.token,
        email: body.email,
        password: body.password,
        password_confirmation: body.password_confirmation,
      });
    },
    onSuccess: () => {
      toast.success("Password reset successfully! Please login with your new password.");
      navigate({ to: "/login", replace: true });
    },
    onError: (error) => {
      toast.error(extractApiError(error, "Failed to reset password."));
    },
  });
};
