import DashboardLayout from "@/components/layout/DashboardLayout";
import MerchantApprovalsClient from "./components/MerchantApprovalsClient";

export const metadata = {
  title: "Merchant Applications Queue | Vouchiqo Admin",
  description:
    "Review submitted merchant account applications, verify business credentials, and approve or decline partner access.",
};

export default function MerchantApprovalsPage() {
  return (
    <DashboardLayout>
      <MerchantApprovalsClient />
    </DashboardLayout>
  );
}
