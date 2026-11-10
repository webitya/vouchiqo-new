import { MerchantLoginForm } from "@/features/auth";

export const metadata = {
  title: "Merchant Login | Vouchiqo",
  description:
    "Log in to your Vouchiqo merchant panel to manage your brand and deals.",
};

export default function MerchantLoginPage() {
  return <MerchantLoginForm />;
}
