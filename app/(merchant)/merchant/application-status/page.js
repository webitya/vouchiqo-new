import DashboardLayout from "@/components/layout/DashboardLayout";
import { ApplicationTracker } from "@/components/merchant/application-tracker";

export const metadata = {
  title: "Application Status & Verification | Vouchiqo Merchant",
  description:
    "Track your merchant partnership application status, document review, and onboarding progress.",
};

export default function MerchantApplicationStatusPage() {
  return (
    <DashboardLayout
      title="Application Tracking & Verification"
      user={{ name: "Merchant Partner", role: "merchant" }}
    >
      <ApplicationTracker />
    </DashboardLayout>
  );
}
