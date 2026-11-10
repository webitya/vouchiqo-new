"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signIn } from "@/lib/auth-client";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }) => signIn.email({ email, password }),

    onSuccess: async ({ data, error }) => {
      if (error) {
        toast.error(error.message ?? "Invalid credentials");
        return;
      }

      toast.success("Welcome back!");
      const role = data?.user?.role ?? "customer";

      // Invalidate session cache so dashboard reads fresh data
      await queryClient.invalidateQueries({ queryKey: ["session"] });

      // Check for callbackUrl in window location
      let callbackUrl = null;
      if (typeof window !== "undefined") {
        callbackUrl = new URLSearchParams(window.location.search).get(
          "callbackUrl",
        );
      }

      let targetUrl = "/";
      if (callbackUrl?.startsWith("/")) {
        targetUrl = callbackUrl;
      } else if (role === "admin") {
        targetUrl = "/admin/dashboard";
      } else if (role === "merchant") {
        targetUrl = "/merchant/dashboard";
      } else {
        targetUrl = "/";
      }

      if (typeof window !== "undefined") {
        window.location.href = targetUrl;
      } else {
        router.replace(targetUrl);
      }
    },

    onError: (err) =>
      toast.error(err?.message ?? "Something went wrong. Try again."),
  });
}
