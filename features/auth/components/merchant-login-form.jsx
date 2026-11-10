"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { FormInput } from "@/components/shared/form";
import { useMerchantLoginForm } from "../hooks/use-merchant-login-form";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthCard } from "./auth-card";

export function MerchantLoginForm() {
  const { register, handleSubmit, errors, isPending } = useMerchantLoginForm();

  return (
    <AuthCard title="Merchant Partner Log In">
      <form
        onSubmit={handleSubmit}
        method="post"
        className="space-y-4"
        noValidate
      >
        {/* Email Address */}
        <FormInput
          label="Email Address"
          prefix={Mail}
          type="email"
          placeholder="rahulsharma@gmail.com"
          autoFocus
          {...register("email")}
          error={errors.email}
        />

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </span>
            <Link
              href="/merchant-forgot-password"
              className="text-xs text-brand-blue font-semibold hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <FormInput
            prefix={Lock}
            type="password"
            placeholder="••••••••"
            {...register("password")}
            error={errors.password}
          />
        </div>

        {/* Reusable Auth Submit Button */}
        <AuthSubmitButton
          label="Log In as Merchant"
          loadingLabel="Logging in..."
          isPending={isPending}
        />
      </form>

      <p className="text-center text-sm font-medium text-brand-subtext mt-4">
        Want to sell on Vouchiqo?{" "}
        <Link
          href="/merchant-register"
          className="text-brand-blue font-bold hover:underline"
        >
          Register your brand
        </Link>
      </p>
    </AuthCard>
  );
}
