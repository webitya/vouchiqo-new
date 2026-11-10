"use client";

import { Lock, Mail, Store } from "lucide-react";
import Link from "next/link";

import { FormInput } from "@/components/shared/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useMerchantRegisterForm } from "../hooks/use-merchant-register-form";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthCard } from "./auth-card";

export function MerchantRegisterForm() {
  const { register, handleSubmit, setValue, watch, errors, isPending } =
    useMerchantRegisterForm();

  const agreedChecked = watch("agreed");

  return (
    <AuthCard title="Merchant Partner Registration">
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {/* Brand Name */}
        <FormInput
          label="Brand Name"
          prefix={Store}
          type="text"
          placeholder="e.g. FabIndia"
          autoFocus
          {...register("name")}
          error={errors.name}
        />

        {/* Business Email */}
        <FormInput
          label="Business Email"
          prefix={Mail}
          type="email"
          placeholder="rahulsharma@gmail.com"
          {...register("email")}
          error={errors.email}
        />

        {/* Password */}
        <FormInput
          label="Password"
          prefix={Lock}
          type="password"
          placeholder="Minimum 8 characters"
          {...register("password")}
          error={errors.password}
        />

        {/* Terms Agreement Checkbox */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2 pt-1.5">
            <Checkbox
              id="terms"
              checked={agreedChecked}
              onCheckedChange={(checked) => setValue("agreed", !!checked)}
              className="w-4 h-4 rounded-sm"
            />
            <label
              htmlFor="terms"
              className="text-xs text-slate-500 font-medium select-none cursor-pointer"
            >
              I agree to the{" "}
              <Link
                href="/terms"
                className="text-brand-blue font-bold hover:underline"
              >
                Merchant Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-brand-blue font-bold hover:underline"
              >
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
          label="Register Merchant Account"
          loadingLabel="Creating account..."
          isPending={isPending}
        />
      </form>

      <p className="text-center text-sm font-medium text-brand-subtext mt-4">
        Already registered?{" "}
        <Link
          href="/merchant-login"
          className="text-brand-blue font-bold hover:underline"
        >
          Log in here
        </Link>
      </p>
    </AuthCard>
  );
}
