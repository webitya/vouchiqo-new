import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata = {
  title: "Forgot Password | Vouchiqo",
  description: "Reset your Vouchiqo password via email.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
