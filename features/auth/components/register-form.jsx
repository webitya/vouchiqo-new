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
              className="mt-0.5 border-[#EADBCE] data-[state=checked]:bg-[#007F79] data-[state=checked]:border-[#007F79] rounded w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="agree"
              className="text-xs text-[#6B4C82] leading-snug cursor-pointer select-none text-left font-sans font-medium"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-[#007F79] hover:text-[#35104A] font-heading font-semibold">
                Terms
              </Link>{" "}
              &amp;{" "}
              <Link href="/privacy" className="text-[#007F79] hover:text-[#35104A] font-heading font-semibold">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreed && (
            <p className="text-xs text-[#FF2E63] font-medium pl-1 font-sans">
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
        <Separator className="bg-[#EADBCE]" />
        <span className="absolute bg-white px-2.5 text-[9.5px] font-heading font-bold text-[#6B4C82] tracking-wider uppercase">
          Or continue with
        </span>
      </div>

      {/* Reusable Google Login Button */}
      <GoogleLoginButton />

      <p className="text-center text-xs font-sans font-medium text-[#6B4C82] mt-4">
        Have an account?{" "}
        <Link
          href="/login"
          className="text-[#007F79] hover:text-[#35104A] font-heading font-bold transition-colors ml-0.5"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
