"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { useZodForm } from "@/hooks/use-zod-form";
import { merchantRegisterSchema } from "../schemas/auth-schemas";
import { useRegister } from "./use-register";

/**
 * Custom hook isolating the form state and query logic for MerchantRegisterForm.
 */
export function useMerchantRegisterForm() {
  const { user, role, isLoaded } = useUser();
  const router = useRouter();
  const { mutate: register, isPending } = useRegister();

  const form = useZodForm({
    schema: merchantRegisterSchema,
    defaultValues: { name: "", email: "", password: "", agreed: false },
  });

  useEffect(() => {
    if (isLoaded && user && role === "merchant") {
      router.replace("/merchant/application-status");
    }
  }, [user, role, isLoaded, router]);

  const onSubmit = (data) => {
    register({
      email: data.email,
      password: data.password,
      name: data.name,
      role: "merchant",
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
