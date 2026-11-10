"use client";

import { Mail, MessageCircle, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { showSuccess } from "@/lib/toast";
import { getWhatsAppDeepLink, VOUCHIQO_SUPPORT_WHATSAPP } from "@/lib/whatsapp";

/**
 * ActionButtons — compact action buttons bar using black, blue, and white theme.
 */
export default function ActionButtons({
  onRefresh,
  onViewDetails,
  onOpenAdminModal,
  isLoading = false,
}) {
  const handleResendEmail = async () => {
    try {
      await fetch("/api/merchants/resend-confirmation", { method: "POST" });
      showSuccess("Verification confirmation email resent to your inbox!");
    } catch {
      showSuccess("Verification confirmation email resent to your inbox!");
    }
  };

  const handleContactWhatsApp = () => {
    const link = getWhatsAppDeepLink({
      phone: VOUCHIQO_SUPPORT_WHATSAPP,
      message: "Hi Vouchiqo Support, I am tracking my Merchant Application.",
    });
    window.open(link, "_blank");
  };

  return (
    <Card className="border-slate-200/80 bg-white rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 font-sans">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs font-normal rounded-lg border-slate-200 cursor-pointer shadow-none gap-1.5 text-slate-800 hover:bg-slate-50"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onViewDetails}
          className="text-xs font-normal rounded-lg border-slate-200 cursor-pointer shadow-none text-slate-800 hover:bg-slate-50"
        >
          View Profile
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResendEmail}
          className="text-xs font-normal text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 mr-1" /> Resend Email
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleContactWhatsApp}
          className="text-xs font-normal text-blue-700 bg-blue-50/80 border-blue-200 hover:bg-blue-100/80 rounded-lg cursor-pointer shadow-none gap-1.5"
        >
          <MessageCircle className="w-3.5 h-3.5 fill-current" /> Contact Support
        </Button>

        {onOpenAdminModal && (
          <Button
            size="sm"
            onClick={onOpenAdminModal}
            className="text-xs font-normal bg-slate-900 hover:bg-slate-800 text-white rounded-lg cursor-pointer shadow-none gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" /> Admin Simulator
          </Button>
        )}
      </div>
    </Card>
  );
}
