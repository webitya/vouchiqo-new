import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";

export const metadata = {
  title: "Reset Password | Vouchiqo",
  description: "Set a new password for your Vouchiqo account.",
};

// Token is passed via query param: /reset-password?token=xxx
// Next.js passes searchParams as a prop to server components
export default async function ResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={token ?? ""} />;
}
