import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { TFormSchema } from "../-type";
import { api } from "../../../../axios";
import { toast } from "sonner";
import { extractApiError } from "../../../../utils/error";

export const useLogin = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationKey: ["auth/login"],
    mutationFn: (body: TFormSchema) => {
      return api.post("/auth/admin/login", {
        email: body.email,
        password: body.password,
      });
    },
    onSuccess: (res) => {
      const data = res.data?.data ?? res.data;
      const { token } = data;
      if (token) {
        localStorage.setItem("token", token);
        navigate({ to: "/", replace: true });
        toast.success("Logged in successfully!");
      } else {
        toast.error("Invalid response from server");
      }
    },

    onError: (error) => {
      toast.error(extractApiError(error, "Failed to log in."));
    },
  });
};
