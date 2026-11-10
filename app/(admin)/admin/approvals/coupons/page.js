import DashboardLayout from "@/components/layout/DashboardLayout";
import CouponModerationClient from "./components/CouponModerationClient";

export const metadata = {
  title: "Offer Listing Moderation | Vouchiqo Admin",
  description: "Review and approve merchant coupon submissions in real-time.",
};

export default function CouponModerationPage() {
  return (
    <DashboardLayout>
      <CouponModerationClient />
    </DashboardLayout>
  );
}
