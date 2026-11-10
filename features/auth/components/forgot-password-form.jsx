"use client";

import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import { AuthCard } from "./auth-card";

export function ForgotPasswordForm({
  userRole = "customer",
  title = "Recover your password",
  subtitle = "Enter your email and we'll send a password reset link.",
  loginHref = "/login",
  redirectTo = "/reset-password",
}) {
  const [email, setEmail] = useState("");
  const {
    mutate: sendReset,
    isPending,
    isSuccess,
  } = useForgotPassword({
    redirectTo,
  });

  return (
    <AuthCard title={title}>
      {isSuccess ? (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto w-11 h-11 bg-warm-ivory dark:bg-zinc-900 text-brand-blue rounded-full flex items-center justify-center border border-slate-200 dark:border-zinc-800">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              Check your inbox
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reset link sent to{" "}
              <strong className="text-slate-800 dark:text-white font-semibold">
                {email}
              </strong>
              .
            </p>
          </div>
          <Link
            href={loginHref}
            className="w-full text-center border border-slate-250/70 dark:border-zinc-800 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 text-slate-600 dark:text-slate-350 py-2 rounded-md text-xs font-medium transition-all inline-flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
          </Link>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendReset({ email });
          }}
          className="space-y-4"
        >
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
          <div className="space-y-1.5">
            <InputGroup className="bg-white border border-[#EADBCE] rounded-xl h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:ring-0 has-[[data-slot=input-group-control]:focus-visible]:border-[#007F79]">
              <InputGroupAddon>
                <Mail className="w-4 h-4 text-[#6B4C82]/70" />
              </InputGroupAddon>
              <InputGroupInput
                id="forgot-password-email"
                name="email"
                type="email"
                placeholder={
                  userRole === "merchant"
                    ? "partner@store.com"
                    : "aaravsharma@gmail.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-base md:text-sm placeholder:font-normal placeholder:text-[#6B4C82]/50 h-full font-medium text-[#35104A]"
                required
                autoFocus
              />
            </InputGroup>
          </div>
          <Button
            id="forgot-password-submit"
            type="submit"
            disabled={isPending}
            className="w-full bg-[#007F79] hover:bg-[#35104A] active:scale-[0.98] text-white rounded-xl py-2.5 text-sm font-heading font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border-0 h-auto cursor-pointer shadow-2xs disabled:opacity-50 disabled:pointer-events-none mt-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPending ? "Sending..." : "Send Reset Link"}</span>
          </Button>
          <Link
            href={loginHref}
            className="flex items-center justify-center gap-1.5 text-xs font-heading font-semibold text-[#007F79] hover:text-[#35104A] py-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </form>
      )}
    </AuthCard>
  );
}
