"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { resetPassword } from "@/lib/auth-client";

export function useResetPassword({ loginHref = "/login" } = {}) {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ password, token }) => {
      const res = await resetPassword({ newPassword: password, token });
      if (res?.error) {
        throw new Error(
          res.error.message ??
            "Failed to reset password. Link may have expired.",
        );
      }
      return res?.data;
    },

    onSuccess: () => {
      toast.success("Password updated! Please sign in.");
      router.push(loginHref);
    },

    onError: (err) =>
      toast.error(err?.message ?? "Something went wrong. Try again."),
  });
}
