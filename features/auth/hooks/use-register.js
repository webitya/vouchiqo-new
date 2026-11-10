"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { signUp } from "@/lib/auth-client";

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, name, role, phoneNumber }) => {
      const res = await signUp.email({
        email,
        password,
        name,
        data: {
          role,
          phoneNumber,
        },
      });

      if (res?.error) {
        throw new Error(res.error.message || "Registration failed");
      }
      return res;
    },

    onSuccess: async (res, variables) => {
      if (res?.error) {
        toast.error(res.error.message ?? "Registration failed");
        return;
      }
      toast.success("Account created! Welcome to Vouchiqo 🎉");

      // Invalidate session so dashboards read fresh data
      await queryClient.invalidateQueries({ queryKey: ["session"] });

      if (variables.role === "merchant" && typeof window !== "undefined") {
        sessionStorage.setItem("vouchiqo_is_merchant", "true");
      }

      const dest =
        variables.role === "merchant" ? "/merchant/application-status" : "/";

      router.replace(dest);
    },

    onError: (err) =>
      toast.error(err?.message ?? "Registration failed. Try again."),
  });
}
