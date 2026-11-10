"use client";

import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { FormInput } from "@/components/shared/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLoginForm } from "../hooks/use-login-form";
import { AuthSubmitButton } from "./AuthSubmitButton";
import { AuthCard } from "./auth-card";
import { GoogleLoginButton } from "./GoogleLoginButton";

export function LoginForm() {
  const { register, handleSubmit, setValue, watch, errors, isPending } =
    useLoginForm();

  const rememberChecked = watch("remember");

  return (
    <AuthCard title="Log In">
      <form
        onSubmit={handleSubmit}
        method="post"
        className="space-y-3.5"
        noValidate
      >
        {/* Email Field */}
        <FormInput
          prefix={Mail}
          type="email"
          placeholder="aaravsharma@gmail.com"
          autoFocus
          {...register("email")}
          error={errors.email}
        />

        {/* Password Field */}
        <FormInput
          prefix={Lock}
          type="password"
          placeholder="••••••••"
          {...register("password")}
          error={errors.password}
        />

        {/* Remember me & Forgot Password */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberChecked}
              onCheckedChange={(checked) => setValue("remember", checked)}
              className="border-[#EADBCE] data-[state=checked]:bg-[#007F79] data-[state=checked]:border-[#007F79] rounded w-4 h-4 cursor-pointer"
            />
            <Label
              htmlFor="remember"
              className="text-xs font-sans font-medium text-[#6B4C82] cursor-pointer select-none"
            >
              Remember me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-xs text-[#007F79] hover:text-[#35104A] font-heading font-semibold transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Reusable Auth Submit Button */}
        <AuthSubmitButton
          label="Sign In"
          loadingLabel="Signing In..."
          isPending={isPending}
        />
      </form>

      {/* Divider */}
      <div className="relative my-4 flex items-center justify-center">
        <Separator className="bg-[#EADBCE]" />
        <span className="absolute bg-white px-2.5 text-[9.5px] font-heading font-bold text-[#6B4C82] tracking-wider uppercase">
          Or Continue With
        </span>
      </div>

      {/* Reusable Google Sign In Button */}
      <GoogleLoginButton />

      <p className="text-center text-xs font-sans font-medium text-[#6B4C82] mt-4">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-[#007F79] hover:text-[#35104A] font-heading font-bold transition-colors ml-0.5"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
