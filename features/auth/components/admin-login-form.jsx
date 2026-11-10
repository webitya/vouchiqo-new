"use client";

import { Lock, User } from "lucide-react";
import { FormInput } from "@/components/shared/form";
import { useAdminLoginForm } from "../hooks/use-admin-login-form";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthCard } from "./auth-card";

export function AdminLoginForm() {
  const { register, handleSubmit, errors, isPending } = useAdminLoginForm();

  return (
    <AuthCard title="Admin Log In">
      <form
        onSubmit={handleSubmit}
        method="post"
        className="space-y-3.5"
        noValidate
      >
        {/* Username/Email */}
        <FormInput
          prefix={User}
          type="text"
          placeholder="Admin Username or Email"
          autoFocus
          {...register("username")}
          error={errors.username}
        />

        {/* Password */}
        <FormInput
          prefix={Lock}
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password}
        />

        {/* Reusable Auth Submit Button */}
        <AuthSubmitButton
          label="Admin Log In"
          loadingLabel="Authenticating..."
          isPending={isPending}
        />
      </form>
    </AuthCard>
  );
}
