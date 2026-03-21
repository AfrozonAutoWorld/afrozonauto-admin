import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/endpoints";
import { toast } from "sonner";

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) =>
      apiClient.post(API_ROUTES.auth.forgotPassword, { email }),
    onSuccess: () => {
      toast.success("Password reset link sent");
    },
    onError: () => {
      toast.error("Failed to send reset link");
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({
      email,
      token,
      password,
    }: {
      email: string;
      token: string;
      password: string;
    }) => apiClient.post(API_ROUTES.auth.resetPassword, { email, token, password }),
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: () => {
      toast.error("Failed to reset password");
    },
  });
}
