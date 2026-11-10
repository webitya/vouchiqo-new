"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/use-user";
import { useZodForm } from "@/hooks/use-zod-form";
import { loginSchema } from "../schemas/auth-schemas";
import { useLogin } from "./use-login";

/**
 * Custom React hook managing state, redirects, and form submission for LoginForm.
 */
export function useLoginForm() {
  const { mutate: login, isPending } = useLogin();
  const { user, role, isLoaded } = useUser();
  const router = useRouter();

  const form = useZodForm({
    schema: loginSchema,
    defaultValues: { email: "", password: "", remember: false },
  });

  // Handle post-auth redirection logic
  useEffect(() => {
    if (isLoaded && user) {
      if (role === "admin") router.replace("/admin/dashboard");
      else if (role === "merchant") router.replace("/merchant/dashboard");
      else router.replace("/");
    }
  }, [user, role, isLoaded, router]);

  const onSubmit = (data) => {
    login(
      {
        email: data.email ? data.email.trim().toLowerCase() : "",
        password: data.password,
      },
      {
        onError: (err) => {
          toast.error(err?.message || "Invalid credentials. Please try again.");
        },
      },
    );
  };

  return {
    register: form.register,
    handleSubmit: form.handleSubmit(onSubmit),
    setValue: form.setValue,
    watch: form.watch,
    errors: form.formState.errors,
    isPending,
  };
}
