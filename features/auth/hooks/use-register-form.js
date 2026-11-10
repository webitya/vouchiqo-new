"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useZodForm } from "@/hooks/use-zod-form";
import { registerSchema } from "../schemas/auth-schemas";
import { useRegister } from "./use-register";

/**
 * Custom React hook managing state, mobile sanitization, and form submission for RegisterForm.
 */
export function useRegisterForm() {
  const { mutate: registerUser, isPending } = useRegister();
  const { user, role, isLoaded } = useUser();
  const router = useRouter();

  const form = useZodForm({
    schema: registerSchema,
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreed: false,
    },
  });

  useEffect(() => {
    if (isLoaded && user) {
      if (role === "admin") router.replace("/admin/dashboard");
      else if (role === "merchant") router.replace("/merchant/dashboard");
      else router.replace("/");
    }
  }, [user, role, isLoaded, router]);

  const onSubmit = (data) => {
    const cleanPhone = data.phoneNumber.replace(/[\s-()]/g, "");
    registerUser({
      email: data.email,
      password: data.password,
      name: data.name,
      phoneNumber: cleanPhone,
      role: "customer",
    });
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
