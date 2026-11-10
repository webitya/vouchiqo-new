"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { authClient } from "@/lib/auth-client";

/**
 * Hook to verify email verification OTP.
 */
export function useVerifyOtp(onSuccessCallback) {
  return useMutation({
    mutationFn: ({ otp }) => authClient.emailOtp.verifyEmail({ otp }),

    onSuccess: ({ error }) => {
      if (error) {
        toast.error(error.message ?? "Code is incorrect or expired.");
        return;
      }
      toast.success("Email verified!");
      if (onSuccessCallback) onSuccessCallback();
    },

    onError: (err) =>
      toast.error(err?.message ?? "Something went wrong. Try again."),
  });
}

/**
 * Hook to resend email verification OTP.
 */
export function useResendOtp() {
  return useMutation({
    mutationFn: () =>
      authClient.emailOtp.sendVerificationOtp({
        type: "email-verification",
      }),

    onSuccess: ({ error }) => {
      if (error) {
        toast.error(error.message ?? "Failed to resend. Try again.");
        return;
      }
      toast.success("New code sent to your email.");
    },

    onError: (err) =>
      toast.error(err?.message ?? "Something went wrong. Try again."),
  });
}
