import { MerchantResetPasswordForm } from "@/features/auth";

export const metadata = {
  title: "Merchant Reset Password | Vouchiqo",
  description: "Set a new password for your Vouchiqo Merchant Partner account.",
};

// Token is passed via query param: /merchant-reset-password?token=xxx
export default async function MerchantResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;
  return <MerchantResetPasswordForm token={token ?? ""} />;
}
