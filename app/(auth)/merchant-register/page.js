import dynamic from "next/dynamic";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

const MerchantOnboardingWizard = dynamic(
  () =>
    import("@/features/auth/components/merchant-onboarding-wizard").then(
      (mod) => mod.MerchantOnboardingWizard,
    ),
  {
    loading: () => (
      <div className="max-w-4xl mx-auto p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-6 my-4">
        <div className="h-7 bg-slate-200 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
        <div className="h-48 bg-slate-50 rounded-xl border border-slate-100" />
      </div>
    ),
  },
);

export const metadata = {
  title: "Merchant Onboarding | Vouchiqo",
  description:
    "Complete 6-section merchant onboarding application for Ranchi and Jharkhand.",
};

export default function MerchantRegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] w-full mx-auto flex flex-col justify-center">
        <MerchantOnboardingWizard />
      </main>
      <Footer />
    </div>
  );
}
