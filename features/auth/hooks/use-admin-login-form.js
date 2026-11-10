"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/use-user";
import { useZodForm } from "@/hooks/use-zod-form";
import { signIn, signOut } from "@/lib/auth-client";
import { adminLoginSchema } from "../schemas/auth-schemas";

/**
 * Custom hook isolating the form state and mutation logic for AdminLoginForm.
 */
export function useAdminLoginForm() {
  const { user, role, isLoaded } = useUser();
  const router = useRouter();

  const form = useZodForm({
    schema: adminLoginSchema,
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (isLoaded && user && role === "admin") {
      router.replace("/admin/dashboard");
    }
  }, [user, role, isLoaded, router]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => signIn.email({ email, password }),
    onSuccess: async ({ data, error }) => {
      if (error) {
        toast.error(error.message ?? "Invalid credentials");
        return;
      }
      const role = data?.user?.role ?? "customer";
      if (role !== "admin") {
        toast.error("Access denied. Only administrators can log in here.");
        await signOut();
        return;
      }
      toast.success("Access granted. Welcome, Admin!");
      window.location.href = "/admin/dashboard";
    },
    onError: (err) => {
      toast.error(err?.message ?? "Something went wrong. Try again.");
    },
  });

  const onSubmit = (data) => {
    const trimmed = data.username.trim();
    const loginEmail = trimmed.includes("@")
      ? trimmed
      : `${trimmed}@vouchiqo.com`;
    loginMutation.mutate({ email: loginEmail, password: data.password });
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
    isPending: loginMutation.isPending,
  };
}
