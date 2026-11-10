"use client";

import { Lock, Mail, Phone, User } from "lucide-react";
import Link from "next/link";

import { FormInput } from "@/components/shared/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useRegisterForm } from "../hooks/use-register-form";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthCard } from "./auth-card";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function RegisterForm() {
  const { register, handleSubmit, setValue, watch, errors, isPending } =
    useRegisterForm();

  const agreedChecked = watch("agreed");

  return (
    <AuthCard title="Create your free account" maxWidth="max-w-5xl">
      <form
        onSubmit={handleSubmit}
        className="space-y-3.5"
        noValidate
      >
        {/* Full Name */}
        <FormInput
          label="Full Name"
          prefix={User}
          type="text"
          placeholder="Aarav Sharma"
          autoFocus
          {...register("name")}
          error={errors.name}
        />

        {/* Email Address */}
        <FormInput
          label="Email Address"
          prefix={Mail}
          type="email"
          placeholder="aaravsharma@gmail.com"
          {...register("email")}
          error={errors.email}
        />

        {/* Mobile Number */}
        <FormInput
          label="Mobile Number"
          prefix={Phone}
          type="tel"
          placeholder="e.g. 9876543210"
          {...register("phoneNumber")}
          error={errors.phoneNumber}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <FormInput
            label="Password"
            prefix={Lock}
            type="password"
            placeholder="Min. 8 characters"
            {...register("password")}
            error={errors.password}
          />

          {/* Confirm Password */}
          <FormInput
            label="Confirm Password"
            prefix={Lock}
            type="password"
            placeholder="Re-enter your password"
            {...register("confirmPassword")}
            error={errors.confirmPassword}
          />
        </div>

        {/* Agreement Checkbox */}
        <div className="space-y-1">
          <div className="flex items-start gap-2.5 py-0.5">
            <Checkbox
              id="agree"
              checked={agreedChecked}
              onCheckedChange={(checked) => setValue("agreed", !!checked)}
              className="mt-0.5 border-slate-350 dark:border-zinc-700 rounded-sm w-3.5 h-3.5 cursor-pointer"
            />
            <label
              htmlFor="agree"
              className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-snug cursor-pointer select-none text-left font-normal"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-brand-blue font-semibold">
                Terms
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="text-brand-blue font-semibold">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreed && (
            <p className="text-xs text-red-500 font-medium pl-1">
              {errors.agreed.message}
            </p>
          )}
        </div>

        {/* Reusable Auth Submit Button */}
        <AuthSubmitButton
          label="Create Account"
          loadingLabel="Creating Account..."
          isPending={isPending}
        />
      </form>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <Separator className="bg-slate-100 dark:bg-zinc-900" />
        <span className="absolute bg-white dark:bg-zinc-950 px-2.5 text-[9px] font-normal text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          Or continue with
        </span>
      </div>

      {/* Reusable Google Login Button */}
      <GoogleLoginButton />

      <p className="text-center text-xs font-normal text-slate-400 dark:text-slate-500 mt-4">
        Have an account?{" "}
        <Link
          href="/login"
          className="text-brand-blue hover:text-blue-700 font-semibold transition-colors ml-0.5"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
