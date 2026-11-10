import { AdminLoginForm } from "@/features/auth";

export const metadata = {
  title: "Admin Portal | Vouchiqo",
  description: "Secure login portal for Vouchiqo administration panel.",
};

export default function AdminLoginPage() {
  return <AdminLoginForm />;
}
