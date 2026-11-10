"use client";

import { Loader2 } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

/**
 * Full-page loading spinner wrapped in the shared DashboardLayout chrome.
 *
 * Replaces the 6 inline copies of this block across merchant & admin pages:
 *   if (isLoading) { return (<DashboardLayout title="..."><div className="flex items-center justify-center py-20"><Loader2 .../></div></DashboardLayout>); }
 *
 * @param {string} title - page title passed to DashboardLayout
 * @param {string} role - "merchant" | "admin" | "customer" (default "merchant")
 * @param {string} name - optional user name for the layout
 */
export default function LoadingState({ title, role = "merchant", name }) {
  return (
    <DashboardLayout title={title} user={{ role, ...(name ? { name } : {}) }}>
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-subtext" />
      </div>
    </DashboardLayout>
  );
}
