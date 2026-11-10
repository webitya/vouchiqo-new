import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminOffersClient from "./components/AdminOffersClient";

export const metadata = {
  title: "Offer Desk & Moderation | Vouchiqo Admin",
  description:
    "Manage platform deals, verify listing parameters, and control featuring flags.",
};

export default function AdminOffersPage() {
  return (
    <DashboardLayout>
      <AdminOffersClient />
    </DashboardLayout>
  );
}
