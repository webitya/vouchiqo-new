import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";

export const metadata = {
  title: "Verify Email | Vouchiqo",
  description: "Verify your email address to activate your Vouchiqo account.",
};

export default function VerifyOTPPage() {
  return <VerifyOtpForm />;
}
