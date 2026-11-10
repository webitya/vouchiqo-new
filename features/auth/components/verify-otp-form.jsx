"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useResendOtp,
  useVerifyOtp,
} from "@/features/auth/hooks/use-verify-otp";
import { authClient } from "@/lib/auth-client";
import { AuthCard } from "./auth-card";

const SLOT_CLASS =
  "w-12 h-12 text-lg border border-brand-border bg-brand-surface rounded-lg";

export function VerifyOtpForm() {
  const [otp, setOtp] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const { data: session } = authClient.useSession();

  const { mutate: verifyOtp, isPending } = useVerifyOtp(() => {
    setIsSuccess(true);
    const role = session?.user?.role ?? "customer";
    const dest =
      role === "admin"
        ? "/admin/dashboard"
        : role === "merchant"
          ? "/merchant/dashboard"
          : "/customer/dashboard";
    setTimeout(() => {
      router.push(dest);
    }, 1500);
  });

  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length < 6) return;
    verifyOtp({ otp });
  };

  return (
    <AuthCard title="Enter Verification Code">
      {isSuccess ? (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto w-12 h-12 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center border border-brand-success/20">
            <CheckCircle2 className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading text-base font-bold text-brand-text">
              Verified!
            </h3>
            <p className="text-xs text-brand-subtext">
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerify} className="space-y-6">
          <p className="text-xs text-brand-subtext text-center font-medium">
            Enter the 6-digit code we sent to your email.
          </p>

          <div className="flex flex-col items-center space-y-3">
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={0} className={SLOT_CLASS} />
                <InputOTPSlot index={1} className={SLOT_CLASS} />
                <InputOTPSlot index={2} className={SLOT_CLASS} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-1.5 text-brand-subtext" />
              <InputOTPGroup className="gap-2">
                <InputOTPSlot index={3} className={SLOT_CLASS} />
                <InputOTPSlot index={4} className={SLOT_CLASS} />
                <InputOTPSlot index={5} className={SLOT_CLASS} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <div className="flex justify-between items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => resendOtp()}
              disabled={isResending}
              className="text-brand-blue hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw
                className={`w-3 h-3 ${isResending ? "animate-spin" : ""}`}
              />
              <span>{isResending ? "Resending..." : "Resend Code"}</span>
            </button>
          </div>

          <Button
            type="submit"
            disabled={isPending || otp.length < 6}
            className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-1 border-0 h-auto cursor-pointer shadow-none"
          >
            <span>{isPending ? "Verifying..." : "Verify & Continue"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          <Link
            href="/login"
            className="flex items-center justify-center gap-1 text-xs font-bold text-brand-blue hover:underline py-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </form>
      )}
    </AuthCard>
  );
}
