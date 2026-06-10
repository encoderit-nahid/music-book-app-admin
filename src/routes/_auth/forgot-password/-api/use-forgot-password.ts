import { useMutation } from "@tanstack/react-query";
import type { TFormSchema } from "../-type";
import { api } from "../../../../axios";
import { toast } from "sonner";
import { extractApiError } from "../../../../utils/error";

export const useForgotPassword = () => {
  return useMutation({
    mutationKey: ["auth/forgot-password"],
    mutationFn: (body: TFormSchema) => {
      return api.post("/auth/forgot-password", {
        email: body.email,
      });
    },
    onSuccess: () => {
      toast.success("Password reset link sent to your email!");
    },
    onError: (error) => {
      toast.error(extractApiError(error, "Failed to send reset link."));
    },
  });
};
