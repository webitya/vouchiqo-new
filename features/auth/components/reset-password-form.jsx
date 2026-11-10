"use client";

import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import { AuthCard } from "./auth-card";

export function ResetPasswordForm({
  token,
  title = "Set a new password",
  loginHref = "/login",
}) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const {
    mutate: reset,
    isPending,
    isSuccess,
  } = useResetPassword({
    loginHref,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords do not match.");
    reset({ password, token });
  };

  return (
    <AuthCard title={title}>
      {isSuccess ? (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto w-12 h-12 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center border border-brand-success/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-brand-text">
              Password updated!
            </h3>
            <p className="text-xs text-brand-subtext">
              You can now sign in with your new password.
            </p>
          </div>
          <Link
            href={loginHref}
            className="bg-[#007F79] hover:bg-[#35104A] text-white font-heading font-bold text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-1.5 w-full border-0 h-auto cursor-pointer shadow-2xs transition-all"
          >
            Go to Sign In <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-heading font-semibold text-[#35104A]">
              New Password
            </Label>
            <InputGroup className="bg-white border border-[#EADBCE] rounded-xl h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:border-[#007F79]">
              <InputGroupAddon>
                <Lock className="w-4 h-4 text-[#6B4C82]/70" />
              </InputGroupAddon>
              <InputGroupInput
                id="reset-password-new"
                name="newPassword"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-xs placeholder-[#6B4C82]/50 text-[#35104A] h-full"
                required
                minLength={8}
                autoFocus
              />
            </InputGroup>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-heading font-semibold text-[#35104A]">
              Confirm Password
            </Label>
            <InputGroup className="bg-white border border-[#EADBCE] rounded-xl h-10 px-2 transition-all has-[[data-slot=input-group-control]:focus-visible]:border-[#007F79]">
              <InputGroupAddon>
                <Lock className="w-4 h-4 text-[#6B4C82]/70" />
              </InputGroupAddon>
              <InputGroupInput
                id="reset-password-confirm"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="text-xs placeholder-[#6B4C82]/50 text-[#35104A] h-full"
                required
                minLength={8}
              />
            </InputGroup>
          </div>
          <Button
            id="reset-password-submit"
            type="submit"
            disabled={isPending}
            className="w-full bg-[#007F79] hover:bg-[#35104A] text-white py-2.5 rounded-xl text-sm font-heading font-bold flex items-center justify-center gap-1.5 border-0 h-auto cursor-pointer shadow-2xs transition-all"
          >
            <span>{isPending ? "Updating..." : "Reset Password"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
