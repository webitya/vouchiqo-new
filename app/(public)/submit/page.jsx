import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import SubmitClient from "./submit-client";

export const metadata = {
  title: "Submit Offers & Merchant Deals | Vouchiqo Community",
  description:
    "Share verified discount coupons, promo codes, and merchant deals with the Vouchiqo community and earn contributor points.",
  openGraph: {
    title: "Submit Offers & Merchant Deals | Vouchiqo Community",
    description:
      "Share verified discount coupons, promo codes, and merchant deals with the Vouchiqo community.",
    type: "website",
  },
};

export default function SubmitCouponPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      <main className="flex-1 py-8">
        <SubmitClient />
      </main>
      <Footer />
    </div>
  );
}
