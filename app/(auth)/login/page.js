import { LoginForm } from "@/features/auth";

export const metadata = {
  title: "Sign In | Vouchiqo",
  description:
    "Sign in to your Vouchiqo account to access verified deals and savings.",
};

export default function LoginPage() {
  return <LoginForm />;
}
