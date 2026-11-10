"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function RedirectToUnifiedNewListing() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/merchant/coupons/new?type=affiliate");
  }, [router]);

  return (
    <DashboardLayout
      title="Create Affiliate Product"
      user={{ role: "merchant" }}
    >
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3 font-sans">
        <Loader2 className="w-6 h-6 animate-spin text-[#F72853]" />
        <p className="text-xs text-slate-600 font-medium">
          Redirecting to unified Post New Listing hub...
        </p>
        <Link
          href="/merchant/coupons/new?type=affiliate"
          className="text-xs text-[#F72853] hover:underline"
        >
          Click here if not redirected automatically
        </Link>
      </div>
    </DashboardLayout>
  );
}
