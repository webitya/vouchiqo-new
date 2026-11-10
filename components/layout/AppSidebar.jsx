"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart2,
  Bell,
  Bookmark,
  Building2,
  Calendar,
  CheckSquare,
  Clock,
  CreditCard,
  Eye,
  HelpCircle,
  History,
  Home,
  IndianRupee,
  Layers,
  LayoutDashboard,
  Link as LinkIcon,
  Mail,
  MapPin,
  Megaphone,
  Percent,
  PlusCircle,
  Settings,
  ShieldCheck,
  Sliders,
  Store,
  Tag,
  Ticket,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavMain } from "@/components/layout/NavMain";
import { NavUser } from "@/components/layout/NavUser";
import SafeImage from "@/components/shared/SafeImage";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAdminAnalytics } from "@/hooks/use-admin";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { useRealtime } from "@/hooks/use-realtime";
import { useUser } from "@/hooks/use-user";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import { SOCKET_EVENTS } from "@/lib/socket/events";

// Map DB plan slug → display label shown in the sidebar badge
const PLAN_LABELS = {
  starter: "STARTER",
  growth: "GROWTH PARTNER",
  pro: "PRO PARTNER",
  enterprise: "ENTERPRISE",
};

export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const { user: authUser } = useUser();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [merchantPlan, setMerchantPlan] = useState(null);

  const userRole = authUser?.role;
  const isAdmin = userRole === "admin" || pathname.startsWith("/admin");
  const isMerchant =
    !isAdmin && (userRole === "merchant" || pathname.startsWith("/merchant"));
  const role = isAdmin
    ? "admin"
    : isMerchant
      ? "merchant"
      : userRole || "customer";

  const { data: merchantProfile } = useMerchantProfile({ enabled: isMerchant });

  // Cached live merchant sidebar badges (prevents state flicker on tab navigation)
  const { data: merchantBadgesData } = useQuery({
    queryKey: ["merchant-badges"],
    queryFn: async () => {
      if (!isMerchant) return null;
      const json = await apiFetch("/api/merchant/badges");
      return json?.data || null;
    },
    enabled: isMerchant,
    staleTime: 15000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const merchantLogo =
    merchantProfile?.logo ||
    merchantProfile?.logoUrl ||
    merchantBadgesData?.logo ||
    authUser?.image ||
    authUser?.logo ||
    authUser?.logoUrl ||
    null;

  const merchantName =
    merchantProfile?.businessName ||
    merchantBadgesData?.businessName ||
    authUser?.businessName ||
    authUser?.name ||
    "Merchant Partner";

  const merchantBadges = useMemo(
    () => ({
      status: merchantBadgesData?.status || "pending",
      totalCoupons: merchantBadgesData?.totalCoupons || 0,
      activeCoupons: merchantBadgesData?.activeCoupons || 0,
      expiredCoupons: merchantBadgesData?.expiredCoupons || 0,
      totalCampaigns: merchantBadgesData?.totalCampaigns || 0,
      unreadNotifications: merchantBadgesData?.unreadNotifications || 0,
    }),
    [merchantBadgesData],
  );

  useEffect(() => {
    const plan = merchantBadgesData?.plan || merchantProfile?.plan;
    if (plan) {
      setMerchantPlan(plan);
    }
  }, [merchantBadgesData?.plan, merchantProfile?.plan]);

  // Activity Seen tracking state (stored in localStorage)
  const [seenState, setSeenState] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem("vouchiqo_sidebar_seen");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Live admin pending action badge counts via TanStack Query (only enabled for admin users)
  const { data: adminAnalytics } = useAdminAnalytics({ enabled: isAdmin });
  const adminBadges = useMemo(
    () => ({
      pendingMerchants: adminAnalytics?.badges?.pendingMerchants || 0,
      pendingCoupons: adminAnalytics?.badges?.pendingCoupons || 0,
      pendingCampaigns: adminAnalytics?.badges?.pendingCampaigns || 0,
    }),
    [adminAnalytics],
  );

  const queryClient = useQueryClient();

  // Real-time instant updates for sidebar badges on all platform WebSocket events
  const handleRealtimeBadgeUpdate = useCallback(() => {
    if (isAdmin) {
      queryClient.invalidateQueries({ queryKey: qk.admin.analytics() });
    }
    if (isMerchant) {
      queryClient.invalidateQueries({ queryKey: ["merchant-badges"] });
    }
  }, [isAdmin, isMerchant, queryClient]);

  useRealtime(SOCKET_EVENTS.APPLICATION_NEW, handleRealtimeBadgeUpdate);
  useRealtime(
    SOCKET_EVENTS.APPLICATION_STATUS_CHANGED,
    handleRealtimeBadgeUpdate,
  );
  useRealtime(SOCKET_EVENTS.COUPON_SUBMITTED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.CAMPAIGN_SUBMITTED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.NOTIFICATION_NEW, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.COUPON_CLAIMED, handleRealtimeBadgeUpdate);
  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, handleRealtimeBadgeUpdate);

  // Automatically mark items as seen when user visits/views the target page in real time
  useEffect(() => {
    if (typeof window === "undefined") return;

    setSeenState((prev) => {
      const updated = { ...prev };
      let changed = false;

      // Initialize baseline on first load if undefined
      if (
        updated.seenCoupons === undefined &&
        merchantBadges.totalCoupons > 0
      ) {
        updated.seenCoupons = merchantBadges.totalCoupons;
        changed = true;
      }
      if (
        updated.seenCampaigns === undefined &&
        merchantBadges.totalCampaigns > 0
      ) {
        updated.seenCampaigns = merchantBadges.totalCampaigns;
        changed = true;
      }
      if (
        updated.seenAdminMerchants === undefined &&
        adminBadges.pendingMerchants > 0
      ) {
        updated.seenAdminMerchants = adminBadges.pendingMerchants;
        changed = true;
      }
      if (
        updated.seenAdminCoupons === undefined &&
        adminBadges.pendingCoupons > 0
      ) {
        updated.seenAdminCoupons = adminBadges.pendingCoupons;
        changed = true;
      }
      if (
        updated.seenAdminCampaigns === undefined &&
        adminBadges.pendingCampaigns > 0
      ) {
        updated.seenAdminCampaigns = adminBadges.pendingCampaigns;
        changed = true;
      }

      // Merchant visits Coupons / Listings
      if (pathname.startsWith("/merchant/coupons")) {
        if (updated.seenCoupons !== merchantBadges.totalCoupons) {
          updated.seenCoupons = merchantBadges.totalCoupons;
          changed = true;
        }
      }

      // Merchant visits Campaigns
      if (pathname.startsWith("/merchant/campaigns")) {
        if (updated.seenCampaigns !== merchantBadges.totalCampaigns) {
          updated.seenCampaigns = merchantBadges.totalCampaigns;
          changed = true;
        }
      }

      // Merchant visits Notifications
      if (pathname.startsWith("/merchant/notifications")) {
        if (updated.seenNotifications !== merchantBadges.unreadNotifications) {
          updated.seenNotifications = merchantBadges.unreadNotifications;
          changed = true;
        }
      }

      // Admin visits Merchant Approvals / Directory
      if (
        pathname.startsWith("/admin/approvals/merchants") ||
        pathname.startsWith("/admin/merchants")
      ) {
        if (updated.seenAdminMerchants !== adminBadges.pendingMerchants) {
          updated.seenAdminMerchants = adminBadges.pendingMerchants;
          changed = true;
        }
      }

      // Admin visits Coupon Moderation
      if (
        pathname.startsWith("/admin/approvals/coupons") ||
        pathname.startsWith("/admin/offers")
      ) {
        if (updated.seenAdminCoupons !== adminBadges.pendingCoupons) {
          updated.seenAdminCoupons = adminBadges.pendingCoupons;
          changed = true;
        }
      }

      // Admin visits Campaign Queue
      if (pathname.startsWith("/admin/campaigns")) {
        if (updated.seenAdminCampaigns !== adminBadges.pendingCampaigns) {
          updated.seenAdminCampaigns = adminBadges.pendingCampaigns;
          changed = true;
        }
      }

      if (changed) {
        try {
          localStorage.setItem(
            "vouchiqo_sidebar_seen",
            JSON.stringify(updated),
          );
        } catch {}
        return updated;
      }
      return prev;
    });
  }, [pathname, merchantBadges, adminBadges]);

  const user = authUser
    ? {
        name: isMerchant
          ? merchantName
          : authUser.businessName || authUser.name,
        email: authUser.email,
        avatar:
          (isMerchant ? merchantLogo : null) ||
          authUser.image ||
          authUser.logo ||
          authUser.logoUrl ||
          `/avatars/${role}.jpg`,
        image:
          (isMerchant ? merchantLogo : null) ||
          authUser.image ||
          authUser.logo ||
          authUser.logoUrl ||
          null,
        logo: merchantLogo || null,
      }
    : {
        name: isMerchant ? merchantName : "Super Admin",
        email: isMerchant ? "merchant@vouchiqo.com" : "admin@vouchiqo.com",
        avatar: (isMerchant ? merchantLogo : null) || `/avatars/${role}.jpg`,
        image: merchantLogo || null,
        logo: merchantLogo || null,
      };

  const getNavGroups = () => {
    // Unseen Activity Counts for Merchant
    const unseenCoupons =
      seenState.seenCoupons !== undefined
        ? Math.max(0, merchantBadges.totalCoupons - seenState.seenCoupons)
        : 0;

    const unseenCampaigns =
      seenState.seenCampaigns !== undefined
        ? Math.max(0, merchantBadges.totalCampaigns - seenState.seenCampaigns)
        : 0;

    const unseenNotifications =
      seenState.seenNotifications === merchantBadges.unreadNotifications
        ? 0
        : merchantBadges.unreadNotifications;

    // Unseen Activity Counts for Admin
    const unseenAdminMerchants =
      seenState.seenAdminMerchants === adminBadges.pendingMerchants
        ? 0
        : adminBadges.pendingMerchants;

    const unseenAdminCoupons =
      seenState.seenAdminCoupons === adminBadges.pendingCoupons
        ? 0
        : adminBadges.pendingCoupons;

    const unseenAdminCampaigns =
      seenState.seenAdminCampaigns === adminBadges.pendingCampaigns
        ? 0
        : adminBadges.pendingCampaigns;

    const totalUnseenAdminApprovals = unseenAdminMerchants + unseenAdminCoupons;

    switch (role) {
      case "admin": {
        return [
          {
            title: "OVERVIEW",
            items: [
              {
                title: "Dashboard",
                url: "/admin/dashboard",
                icon: LayoutDashboard,
              },
            ],
          },
          {
            title: "PENDING & APPROVALS",
            items: [
              {
                title: "Pending Approvals",
                url: "/admin/approvals/merchants",
                icon: ShieldCheck,
                defaultOpen: true,
                badge:
                  totalUnseenAdminApprovals > 0
                    ? String(totalUnseenAdminApprovals)
                    : null,
                badgeColor:
                  "bg-red-500 text-white font-medium shadow-sm shadow-red-500/30",
                subItems: [
                  {
                    title: "Merchant Approvals",
                    url: "/admin/approvals/merchants",
                    icon: ShieldCheck,
                    badge:
                      unseenAdminMerchants > 0
                        ? String(unseenAdminMerchants)
                        : null,
                    badgeColor: "bg-red-500 text-white font-medium",
                  },
                  {
                    title: "Offer Moderation",
                    url: "/admin/approvals/coupons",
                    icon: Tag,
                    badge:
                      unseenAdminCoupons > 0
                        ? String(unseenAdminCoupons)
                        : null,
                    badgeColor: "bg-red-500 text-white font-medium",
                  },
                  {
                    title: "Offer Verification",
                    url: "/admin/offers",
                    icon: CheckSquare,
                  },
                ],
              },
              {
                title: "User Management",
                url: "/admin/users",
                icon: Users,
              },
              {
                title: "Merchant Directory",
                url: "/admin/merchants",
                icon: Store,
                badge:
                  unseenAdminMerchants > 0
                    ? String(unseenAdminMerchants)
                    : null,
                badgeColor: "bg-red-500 text-white font-medium",
              },
            ],
          },
          {
            title: "CAMPAIGN MANAGEMENT",
            items: [
              {
                title: "Campaign Hub",
                url: "/admin/campaigns/queue",
                icon: Megaphone,
                badge:
                  unseenAdminCampaigns > 0
                    ? String(unseenAdminCampaigns)
                    : null,
                subItems: [
                  {
                    title: "Campaign Queue",
                    url: "/admin/campaigns/queue",
                    icon: Megaphone,
                    badge:
                      unseenAdminCampaigns > 0
                        ? String(unseenAdminCampaigns)
                        : null,
                    badgeColor: "bg-red-500 text-white font-medium",
                  },
                  {
                    title: "Live Monitoring",
                    url: "/admin/campaigns/live",
                    icon: TrendingUp,
                  },
                  {
                    title: "Campaign Calendar",
                    url: "/admin/campaigns/calendar",
                    icon: Clock,
                  },
                  {
                    title: "Campaign Analytics",
                    url: "/admin/campaigns/analytics",
                    icon: BarChart2,
                  },
                ],
              },
            ],
          },
          {
            title: "CONTENT & MARKETING",
            items: [
              {
                title: "Banners & Highlights",
                url: "/admin/banners",
                icon: Sliders,
                subItems: [
                  {
                    title: "Homepage Banners",
                    url: "/admin/banners",
                    icon: Sliders,
                  },
                  {
                    title: "Featured Deals",
                    url: "/admin/featured",
                    icon: Tag,
                  },
                ],
              },
              {
                title: "Terms & Policies",
                url: "/admin/content/policies",
                icon: ShieldCheck,
              },
              {
                title: "Marketing Tools",
                url: "/admin/campaigns/festival-wizard",
                icon: Megaphone,
                subItems: [
                  {
                    title: "Festival Wizard",
                    url: "/admin/campaigns/festival-wizard",
                    icon: Calendar,
                  },
                  {
                    title: "Email Blast Builder",
                    url: "/admin/campaigns/email-blast-builder",
                    icon: Mail,
                  },
                  {
                    title: "Push Notifications",
                    url: "/admin/push-notifications",
                    icon: Bell,
                  },
                ],
              },
              {
                title: "Demand & Revivals",
                url: "/admin/merchant-demand",
                icon: Building2,
                subItems: [
                  {
                    title: "Merchant Demand",
                    url: "/admin/merchant-demand",
                    icon: Building2,
                  },
                  {
                    title: "Master Revivals",
                    url: "/admin/revivals",
                    icon: AlertCircle,
                  },
                ],
              },
            ],
          },
          {
            title: "FINANCIALS",
            items: [
              {
                title: "Revenue & Earnings",
                url: "/admin/revenue",
                icon: Wallet,
                subItems: [
                  {
                    title: "Platform Revenue",
                    url: "/admin/revenue",
                    icon: Wallet,
                  },
                  {
                    title: "Campaign Revenue",
                    url: "/admin/campaigns/revenue",
                    icon: CreditCard,
                  },
                ],
              },
              {
                title: "Commission Rates",
                url: "/admin/commission-rates",
                icon: Percent,
              },
              {
                title: "Merchant Plans & Pricing",
                url: "/admin/plans",
                icon: CreditCard,
              },
            ],
          },
        ];
      }
      case "merchant":
        return [
          {
            title: "",
            items: [
              {
                title: "Dashboard Overview",
                url: "/merchant/dashboard",
                icon: Home,
              },
              {
                title: "My Listings",
                url: "/merchant/coupons",
                icon: Layers,
                tourId: "tour-my-listings",
                badge: unseenCoupons > 0 ? String(unseenCoupons) : null,
                badgeColor:
                  "bg-red-500 text-white font-medium shadow-sm shadow-red-500/30",
              },
              {
                title: "Post New Listing",
                url: "/merchant/coupons/new",
                icon: PlusCircle,
                isCta: true,
              },
              {
                title: "Analytics",
                url: "/merchant/analytics",
                icon: BarChart2,
              },
              {
                title: "Campaigns",
                url: "/merchant/campaigns",
                icon: Megaphone,
                badge: unseenCampaigns > 0 ? String(unseenCampaigns) : null,
                badgeColor:
                  "bg-red-500 text-white font-medium shadow-sm shadow-red-500/30",
              },
              {
                title: "Notifications",
                url: "/merchant/notifications",
                icon: Bell,
                badge:
                  unseenNotifications > 0 ? String(unseenNotifications) : null,
                badgeColor:
                  "bg-red-500 text-white font-medium shadow-sm shadow-red-500/40 animate-pulse",
              },
              {
                title: "Subscription & Billing",
                url: "/merchant/billing",
                icon: CreditCard,
              },
              {
                title: "Affiliate & Commission",
                url: "/merchant/affiliates",
                icon: LinkIcon,
              },
              {
                title: "Business Profile & KYC",
                url: "/merchant/profile",
                icon: Store,
              },
              {
                title: "Application Tracking",
                url: "/merchant/application-status",
                icon: ShieldCheck,
                badge: merchantBadges.status
                  ? merchantBadges.status.toUpperCase()
                  : "UNDER AUDIT",
                badgeColor:
                  merchantBadges.status === "approved"
                    ? "bg-emerald-600 text-white font-medium"
                    : merchantBadges.status === "rejected"
                      ? "bg-red-600 text-white font-medium"
                      : "bg-amber-500 text-slate-950 font-medium",
              },
              {
                title: "Account Settings",
                url: "/merchant/settings",
                icon: Settings,
              },
              { title: "Help & Support", url: "/faq", icon: HelpCircle },
            ],
          },
        ];
      default:
        return [
          {
            title: "MAIN",
            items: [
              {
                title: "Dashboard",
                url: "/customer/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "My Savings",
                url: "/profile?tab=savings",
                icon: IndianRupee,
              },
              {
                title: "Saved Deals",
                url: "/profile?tab=saved",
                icon: Bookmark,
              },
              {
                title: "Cashback Wallet",
                url: "/profile?tab=wallet",
                icon: Wallet,
              },
            ],
          },
          {
            title: "ACTIVITY & DISCOVERY",
            items: [
              {
                title: "My Activity",
                url: "/profile?tab=activity",
                icon: History,
              },
              {
                title: "Nearby Offers",
                url: "/profile?tab=nearby",
                icon: MapPin,
              },
              { title: "My Offers", url: "/customer/claimed", icon: Ticket },
              {
                title: "Settings",
                url: "/profile?tab=settings",
                icon: Settings,
              },
              { title: "Homepage", url: "/", icon: Home },
            ],
          },
        ];
    }
  };

  const groups = getNavGroups();

  return (
    <Sidebar
      collapsible="icon"
      side="left"
      className="bg-white text-slate-900 border-r border-slate-200 shadow-sm font-sans"
      {...props}
    >
      <SidebarHeader className="!flex-row !gap-0 h-14 sm:h-[60px] flex items-center justify-between border-b border-rose-100/90 bg-rose-50/70 px-3.5 py-0 shrink-0">
        <div
          className={`flex items-center gap-2.5 flex-1 min-w-0 ${isCollapsed ? "justify-center" : ""}`}
        >
          {/* Logo & Identity in Left */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-rose-200/80 bg-white overflow-hidden shadow-2xs">
            {role === "admin" ? (
              <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center rounded-[7px]">
                <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
            ) : role === "merchant" ? (
              merchantLogo ? (
                <SafeImage
                  src={merchantLogo}
                  alt={merchantName || "Merchant Logo"}
                  width={36}
                  height={36}
                  className="w-full h-full object-contain p-0.5 bg-white"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#F72853] to-rose-600 flex items-center justify-center rounded-[7px]">
                  <Store className="w-4.5 h-4.5 text-white stroke-[2]" />
                </div>
              )
            ) : (
              <div className="w-full h-full bg-rose-50 border border-rose-200/80 flex items-center justify-center rounded-[7px]">
                <Image
                  src="/favicon.ico"
                  alt="Vouchiqo Logo"
                  width={22}
                  height={22}
                  className="w-5.5 h-5.5 object-contain"
                />
              </div>
            )}
          </div>

          {/* User Name & Role Badge in Middle */}
          {!isCollapsed && (
            <div className="flex flex-col text-left leading-tight min-w-0 flex-1">
              <span className="text-[13px] font-medium tracking-tight truncate text-slate-900">
                {role === "admin" ? "Super Admin" : merchantName}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                {role === "admin" ? (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200/80 text-[8.5px] font-medium px-1.5 py-0.5 rounded-[7px] inline-flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-purple-600" />{" "}
                    PLATFORM ADMIN
                  </span>
                ) : role === "merchant" ? (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="bg-white/95 text-[#F72853] border border-rose-200/90 text-[8.5px] font-medium px-1.5 py-0.5 rounded-[7px] inline-flex items-center gap-1 tracking-wider shadow-2xs">
                      <Store className="w-2.5 h-2.5 text-[#F72853]" />{" "}
                      {merchantPlan
                        ? (PLAN_LABELS[merchantPlan] ??
                          merchantPlan.toUpperCase())
                        : "STARTER"}
                    </span>
                    {(merchantProfile?.slug || merchantBadgesData?.slug) && (
                      <a
                        href={`/brand/${merchantProfile?.slug || merchantBadgesData?.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[8.5px] font-medium text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5 bg-blue-50 px-1 py-0.5 rounded border border-blue-200/70"
                        title="Preview Public Storefront"
                      >
                        <Eye className="w-2 h-2" />
                        <span>Preview ↗</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[8.5px] font-normal px-1.5 py-0.5 rounded-[7px] inline-block">
                    MEMBER
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Close Button in Right */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpenMobile(false)}
            className="w-8 h-8 rounded-lg text-slate-500 hover:text-[#F72853] hover:bg-rose-50/80 transition-colors shrink-0 cursor-pointer border border-slate-200/80 shadow-2xs ml-1.5"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent
        data-lenis-prevent
        className="px-2 py-3 bg-white text-slate-900 overflow-y-auto overflow-x-hidden overscroll-contain custom-scrollbar"
      >
        <NavMain groups={groups} isMerchant={isMerchant} />
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 bg-white shrink-0">
        <NavUser user={user} role={role} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
