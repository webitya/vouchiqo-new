import { MerchantForgotPasswordForm } from "@/features/auth";

export const metadata = {
  title: "Merchant Forgot Password | Vouchiqo",
  description: "Reset your Vouchiqo Merchant Partner password via email.",
};

export default function MerchantForgotPasswordPage() {
  return <MerchantForgotPasswordForm />;
}
