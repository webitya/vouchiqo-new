"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmptyState from "@/components/shared/feedback/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMerchantNotifications } from "@/hooks/use-merchant-notifications";
import { useMerchantProfile } from "@/hooks/use-merchant";

function formatNotificationType(type) {
  if (!type) return "System Notice";
  const map = {
    merchant_approved: "Account Approved",
    application_status_changed: "Status Updated",
    application_submitted: "Profile Submitted",
    coupon_approved: "Offer Approved",
    coupon_rejected: "Offer Rejected",
    coupon_expiring: "Expiring Soon",
    coupon_claimed: "Offer Claimed",
    coupon_redeemed: "Offer Redeemed",
    campaign_submitted: "Campaign Submitted",
    campaign_approved: "Campaign Approved",
    campaign_status_changed: "Campaign Update",
    billing_confirmed: "Billing Invoice",
    payout_processed: "Payout Settled",
  };
  if (map[type]) return map[type];
  return type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getNotificationIcon(type, category) {
  const t = String(type || "").toLowerCase();
  const c = String(category || "").toLowerCase();

  if (
    t.includes("approved") ||
    t.includes("success") ||
    t.includes("live") ||
    t === "merchant_approved"
  ) {
    return {
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
    };
  }
  if (
    t.includes("rejected") ||
    t.includes("declined") ||
    t.includes("failed") ||
    t === "merchant_rejected"
  ) {
    return {
      icon: XCircle,
      color: "text-rose-600 bg-rose-50 border-rose-200/80",
    };
  }
  if (t.includes("expir") || t.includes("warning")) {
    return {
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200/80",
    };
  }
  if (
    c === "billing" ||
    t.includes("invoice") ||
    t.includes("payout") ||
    t.includes("payment")
  ) {
    return {
      icon: CreditCard,
      color: "text-purple-600 bg-purple-50 border-purple-200/80",
    };
  }
  if (t.includes("redeem") || t.includes("claim") || t.includes("milestone")) {
    return {
      icon: Trophy,
      color: "text-amber-600 bg-amber-50 border-amber-200/80",
    };
  }
  if (t.includes("action") || t.includes("alert")) {
    return {
      icon: AlertTriangle,
      color: "text-rose-600 bg-rose-50 border-rose-200/80",
    };
  }
  if (c === "campaign" || t.includes("campaign")) {
    return {
      icon: Zap,
      color: "text-[#F72853] bg-rose-50 border-rose-200/80",
    };
  }
  return {
    icon: Bell,
    color: "text-[#F72853] bg-rose-50 border-rose-200/80",
  };
}

function formatRelativeTime(dateInput) {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24)
    return `${diffHours} ${diffHours === 1 ? "hr" : "hrs"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

export default function MerchantNotifications() {
  const [activeTab, setActiveTab] = useState("all");

  // Fetch live merchant profile from DB
  const { data: merchant } = useMerchantProfile();

  // Use real-time socket + DB notifications hook
  const {
    notifications: dbNotifications,
    unreadCount,
    isLoading,
    markItemRead,
    markAllRead,
    isMarkingRead,
    isConnected,
  } = useMerchantNotifications(merchant?.authId);

  // Normalize DB notification items
  const notifications = useMemo(() => {
    return dbNotifications.map((item) => {
      const { icon, color } = getNotificationIcon(item.type, item.category);
      return {
        id: item._id || item.id,
        title: item.title,
        message: item.message,
        type: item.type || "Notification",
        typeFormatted: formatNotificationType(item.type),
        category: item.category || "system",
        icon,
        iconColor: color,
        time: formatRelativeTime(item.createdAt),
        read: Boolean(item.isRead || item.read),
      };
    });
  }, [dbNotifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (activeTab === "all") return true;
      if (activeTab === "unread") return !n.read;
      if (activeTab === "system")
        return n.category === "system" || n.category === "verification";
      if (activeTab === "campaign")
        return n.category === "campaign" || n.category === "offer";
      if (activeTab === "billing") return n.category === "billing";
      return true;
    });
  }, [notifications, activeTab]);

  return (
    <DashboardLayout
      title="Notifications & Alerts"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-3 text-left font-sans w-full max-w-4xl pb-8">
        {/* COMPACT FILTER TABS WITH ACTIONS */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-2.5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <TabsList className="bg-slate-100/90 p-1 rounded-xl border border-slate-200/90 flex flex-wrap gap-1 justify-start h-auto w-fit">
              <TabsTrigger
                value="all"
                className="text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer transition-all text-slate-600 hover:text-[#F72853] hover:bg-rose-50/50 data-[state=active]:!bg-[#F72853] data-[state=active]:!text-white data-[state=active]:shadow-xs"
              >
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer transition-all text-slate-600 hover:text-[#F72853] hover:bg-rose-50/50 data-[state=active]:!bg-[#F72853] data-[state=active]:!text-white data-[state=active]:shadow-xs"
              >
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer transition-all text-slate-600 hover:text-[#F72853] hover:bg-rose-50/50 data-[state=active]:!bg-[#F72853] data-[state=active]:!text-white data-[state=active]:shadow-xs"
              >
                Account &amp; Status
              </TabsTrigger>
              <TabsTrigger
                value="campaign"
                className="text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer transition-all text-slate-600 hover:text-[#F72853] hover:bg-rose-50/50 data-[state=active]:!bg-[#F72853] data-[state=active]:!text-white data-[state=active]:shadow-xs"
              >
                Offers &amp; Campaigns
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer transition-all text-slate-600 hover:text-[#F72853] hover:bg-rose-50/50 data-[state=active]:!bg-[#F72853] data-[state=active]:!text-white data-[state=active]:shadow-xs"
              >
                Billing
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead()}
              disabled={unreadCount === 0 || isMarkingRead}
              className="text-xs h-8 font-medium rounded-xl border-slate-200 hover:border-slate-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 text-slate-700 hover:text-[#F72853] hover:bg-rose-50/40 transition-colors shadow-2xs shrink-0 self-end sm:self-auto"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              <span>Mark All Read</span>
            </Button>
          </div>

          {/* NOTIFICATION FEED LIST */}
          <div className="pt-2">
            <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden divide-y divide-slate-100">
              {isLoading
                ? <div className="p-8 flex items-center justify-center text-slate-500 text-xs font-normal gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#F72853]" />
                    <span>Loading live notifications from database...</span>
                  </div>
                : filteredNotifications.length > 0
                  ? filteredNotifications.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (!item.read) markItemRead(item.id);
                          }}
                          className={`p-3 sm:p-3.5 flex items-start gap-3 transition-all cursor-pointer select-none group ${
                            !item.read
                              ? "bg-rose-50/20 hover:bg-rose-50/40"
                              : "bg-white hover:bg-slate-50/70"
                          }`}
                        >
                          {/* Compact Icon */}
                          <div
                            className={`w-8 h-8 rounded-xl border shrink-0 flex items-center justify-center ${item.iconColor}`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-xs font-semibold text-slate-800 truncate">
                                  {item.title}
                                </span>
                                {!item.read && (
                                  <span
                                    className="w-2 h-2 rounded-full bg-[#F72853] shrink-0"
                                    title="Unread"
                                  />
                                )}
                              </div>
                              <span className="text-[10px] font-normal text-slate-400 shrink-0">
                                {item.time}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                              {item.message}
                            </p>

                            <div className="pt-0.5 flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="text-[10px] font-medium border-slate-200/80 text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md shadow-none"
                              >
                                {item.typeFormatted}
                              </Badge>

                              {!item.read && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markItemRead(item.id);
                                  }}
                                  className="text-[10px] font-medium text-[#F72853] hover:underline opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0 bg-transparent"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  : <div className="p-8">
                      <EmptyState
                        icon={Bell}
                        title="No Notifications"
                        description={
                          activeTab === "unread"
                            ? "You've read all your notifications! New real-time alerts will appear here."
                            : "No alerts recorded in this category yet. System approvals and redemption updates will appear automatically."
                        }
                        actionLabel={
                          activeTab !== "all"
                            ? "View All Notifications"
                            : undefined
                        }
                        onAction={
                          activeTab !== "all"
                            ? () => setActiveTab("all")
                            : undefined
                        }
                      />
                    </div>}
            </Card>
          </div>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
