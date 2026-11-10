"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { requestPasswordReset } from "@/lib/auth-client";

export function useForgotPassword({ redirectTo = "/reset-password" } = {}) {
  return useMutation({
    mutationFn: async ({ email }) => {
      const res = await requestPasswordReset({
        email,
        redirectTo,
      });
      if (res?.error) {
        throw new Error(res.error.message ?? "Failed to send reset link");
      }
      return res?.data;
    },

    onSuccess: () => {
      toast.success("Reset link sent! Check your inbox.");
    },

    onError: (err) =>
      toast.error(err?.message ?? "Something went wrong. Try again."),
  });
}
