import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminMerchantsClient from "./components/AdminMerchantsClient";

export const metadata = {
  title: "Merchants Management | Vouchiqo Admin",
  description:
    "Manage merchant accounts, approvals, subscription tiers, and partner status.",
};

export default function AdminMerchantsPage() {
  return (
    <DashboardLayout>
      <AdminMerchantsClient />
    </DashboardLayout>
  );
}
