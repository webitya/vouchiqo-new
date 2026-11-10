"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/use-user";
import { useZodForm } from "@/hooks/use-zod-form";
import { signIn, signOut } from "@/lib/auth-client";
import { merchantLoginSchema } from "../schemas/auth-schemas";

/**
 * Custom hook isolating the form state and query logic for MerchantLoginForm.
 */
export function useMerchantLoginForm() {
  const { user, role, isLoaded } = useUser();
  const router = useRouter();

  const form = useZodForm({
    schema: merchantLoginSchema,
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!isLoaded) return;
    const isMerchantFlag =
      typeof window !== "undefined" &&
      sessionStorage.getItem("vouchiqo_is_merchant") === "true";

    if (user && (role === "merchant" || isMerchantFlag)) {
      fetch("/api/merchants/me", { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const merchant = data?.data?.merchant || data?.data;
          const status = merchant?.status;
          if (status === "approved") {
            router.replace("/merchant/dashboard");
          } else if (merchant && (merchant._id || merchant.status || merchant.businessName)) {
            router.replace("/merchant/application-status");
          } else {
            router.replace("/merchant/dashboard");
          }
        })
        .catch(() => {
          router.replace("/merchant/dashboard");
        });
    }
  }, [user, role, isLoaded, router]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => signIn.email({ email, password }),
    onSuccess: async ({ data, error }) => {
      if (error) {
        toast.error(error.message ?? "Invalid credentials");
        return;
      }
      let effectiveRole = data?.user?.role;
      if (effectiveRole !== "merchant") {
        const checkRes = await fetch("/api/merchants/me", {
          credentials: "include",
        }).catch(() => null);
        if (checkRes?.ok) {
          effectiveRole = "merchant";
        }
      }

      if (effectiveRole !== "merchant") {
        toast.error("Access denied. This login page is for merchants only.");
        await signOut();
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("vouchiqo_is_merchant", "true");
      }
      toast.success("Welcome back, Merchant Partner!");

      // Redirect based on merchant profile status
      try {
        const meRes = await fetch("/api/merchants/me", {
          credentials: "include",
        });
        if (meRes.ok) {
          const meJson = await meRes.json();
          const merchantProfile = meJson?.data;
          if (merchantProfile?.status === "approved") {
            window.location.href = "/merchant/dashboard";
          } else if (merchantProfile && (merchantProfile._id || merchantProfile.businessName)) {
            window.location.href = "/merchant/application-status";
          } else {
            window.location.href = "/merchant/dashboard";
          }
        } else {
          window.location.href = "/merchant/dashboard";
        }
      } catch {
        window.location.href = "/merchant/dashboard";
      }
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong. Try again.");
    },
  });

  const onSubmit = (data) => {
    const cleanEmail = data.email ? data.email.trim().toLowerCase() : "";
    loginMutation.mutate({ email: cleanEmail, password: data.password });
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isPending: loginMutation.isPending,
  };
}
