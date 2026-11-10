import { Lock } from "lucide-react";
import Link from "next/link";

export default function UpgradeGate() {
  return (
    <div className="bg-white border border-brand-border rounded-[16px] p-8 text-center max-w-2xl mx-auto py-16">
      <div className="w-14 h-14 rounded-full bg-brand-navy text-white flex items-center justify-center shadow-md mb-4 border border-white/20 mx-auto">
        <Lock className="w-6 h-6" />
      </div>
      <h3 className="font-heading text-lg font-black text-brand-navy">
        Unlock Campaign Manager
      </h3>
      <p className="text-xs text-brand-subtext max-w-sm mt-2 leading-relaxed font-semibold mx-auto">
        Create marketing campaigns, broadcast notifications to users who follow
        your brand, and unlock featured placements in the Weekly Newsletter
        digest.
      </p>
      <Link
        href="/merchant/billing"
        className="btn-primary text-xs py-2.5 px-6 rounded-xl font-bold mt-5 shadow-none border-0 h-auto cursor-pointer flex items-center gap-1.5 inline-flex"
      >
        <span>Upgrade to Growth Plan</span>
      </Link>
    </div>
  );
}
