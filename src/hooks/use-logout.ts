import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function logout() {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    queryClient.setQueryData(["currentUser"], null);
    setIsLoggingOut(false);
    navigate({ to: "/login", replace: true });
    toast.success("Logged out successfully");
  }
  return {
    isLoggingOut,
    logout,
  };
};
