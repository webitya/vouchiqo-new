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
              className="border-slate-300 dark:border-zinc-700 rounded-sm w-3.5 h-3.5 cursor-pointer"
            />
            <Label
              htmlFor="remember"
              className="text-xs md:text-sm font-normal text-slate-500 dark:text-slate-400 cursor-pointer select-none"
            >
              Remember me
            </Label>
          </div>
          <Link
            href="/forgot-password"
            className="text-xs md:text-sm text-brand-blue font-normal transition-colors"
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
        <Separator className="bg-slate-100 dark:bg-zinc-900" />
        <span className="absolute bg-white dark:bg-zinc-955 px-2.5 text-[9px] font-normal text-slate-400 dark:text-slate-500 tracking-wider uppercase">
          Or Continue With
        </span>
      </div>

      {/* Reusable Google Sign In Button */}
      <GoogleLoginButton />

      <p className="text-center text-xs font-normal text-slate-400 dark:text-slate-500 mt-4">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-brand-blue hover:text-blue-700 font-semibold transition-colors ml-0.5"
        >
          Sign up
        </Link>
      </p>
    </AuthCard>
  );
}
