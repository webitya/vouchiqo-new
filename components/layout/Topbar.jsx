"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useRealtime } from "@/hooks/use-realtime";
import { useUser } from "@/hooks/use-user";
import { apiFetch } from "@/lib/fetcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import UserDropdown from "./UserDropdown";

export default function Topbar({ title = "Dashboard", user: propUser = null }) {
  const { user: authUser } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  // Push notification toggle inside the notification dropdown
  const {
    isSupported: pushSupported,
    permission: pushPermission,
    isSubscribed: pushSubscribed,
    loading: pushLoading,
    requestPermission: enablePush,
    unsubscribe: disablePush,
  } = usePushNotifications({ userId: authUser?.id });

  const queryClient = useQueryClient();
  const { data: rawNotifs = [], isLoading: loadingNotifs } = useQuery({
    queryKey: ["notifications", authUser?.id],
    enabled: !!authUser,
    queryFn: async () => {
      const json = await apiFetch("/api/notifications");
      return (
        json.data?.notifications || (Array.isArray(json.data) ? json.data : [])
      );
    },
    staleTime: 30_000,
  });

  const notifications = useMemo(() => {
    const formatted = rawNotifs.map((item) => ({
      id: item._id || item.id,
      message: item.message || item.title,
      time: item.createdAt
        ? new Date(item.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          })
        : "Recently",
      read: Boolean(item.isRead || item.read),
      timestamp: item.createdAt
        ? new Date(item.createdAt).getTime()
        : Date.now(),
    }));
    return [...formatted].sort((a, b) => b.timestamp - a.timestamp);
  }, [rawNotifs]);

  const invalidateNotifs = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["notifications", authUser?.id],
    });
  }, [queryClient, authUser?.id]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Real-time Socket.IO Listeners for Topbar Bell Badge Updates
  useRealtime(SOCKET_EVENTS.NOTIFICATION_NEW, invalidateNotifs);
  useRealtime(SOCKET_EVENTS.COUPON_STATUS_CHANGED, invalidateNotifs);
  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, invalidateNotifs);
  useRealtime(SOCKET_EVENTS.COUPON_REDEEMED, invalidateNotifs);

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && searchVal.trim()) {
      router.push(`/brands?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const handleSearchClick = () => {
    if (searchVal.trim()) {
      router.push(`/brands?search=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications", {
        method: "POST",
        body: {},
      });
      invalidateNotifs();
    } catch {
      // Ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const displayRole = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/merchant")
      ? "merchant"
      : authUser?.role || propUser?.role || "customer";

  const isMerchant = displayRole === "merchant";
  const { data: merchantProfile } = useMerchantProfile({ enabled: isMerchant });
  const merchantLogo =
    merchantProfile?.logo ||
    merchantProfile?.logoUrl ||
    authUser?.image ||
    authUser?.logo ||
    authUser?.logoUrl ||
    null;
  const merchantName =
    merchantProfile?.businessName || authUser?.businessName || authUser?.name;

  const user =
    mounted && authUser
      ? {
          ...authUser,
          name: isMerchant ? merchantName || authUser.name : authUser.name,
          email: authUser.email,
          role: displayRole,
          image: isMerchant ? merchantLogo || authUser.image : authUser.image,
          logo: merchantLogo,
        }
      : propUser
        ? {
            ...propUser,
            name: isMerchant ? merchantName || propUser.name : propUser.name,
            email: propUser.email || authUser?.email,
            role: displayRole,
            image: isMerchant ? merchantLogo || propUser.image : propUser.image,
            logo: merchantLogo,
          }
        : {
            name: isMerchant ? merchantName || "Merchant Partner" : "User",
            email: authUser?.email,
            role: displayRole,
            image: merchantLogo || null,
            logo: merchantLogo || null,
          };

  return (
    <header
      className="h-14 sm:h-[60px] w-full bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EADBCE] shadow-2xs flex items-center justify-between px-3 sm:px-6 sticky top-0 z-40 font-sans shrink-0"
      style={{ position: "sticky", top: 0, zIndex: 40 }}
    >
      {/* Left section: Sidebar Trigger (Hamburger) and title */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <SidebarTrigger className="text-[#35104A] hover:text-[#007F79] hover:bg-[#FFF8EF]" />
        <h1 className="text-[13.5px] sm:text-base font-heading font-semibold text-[#35104A] tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right section: Search input & User actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-[#FFF8EF] border border-[#EADBCE] focus-within:border-[#007F79] focus-within:ring-1 focus-within:ring-[#007F79]/30 rounded-xl px-2.5 py-1.5 w-64 h-8 transition-all">
          <Search
            className="w-3.5 h-3.5 text-[#6B4C82] mr-2 cursor-pointer hover:text-[#007F79]"
            onClick={handleSearchClick}
          />
          <Input
            type="text"
            placeholder="Quick search dashboard..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={handleSearchSubmit}
            className="border-0 bg-transparent text-xs w-full p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#6B4C82]/60 text-[#35104A] shadow-none font-sans"
          />
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative text-[#35104A] hover:text-[#007F79] p-1.5 rounded-lg hover:bg-[#FFF8EF] transition-all cursor-pointer h-8 w-8 border-0 bg-transparent shadow-none"
          >
            <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FF2E63] rounded-full animate-pulse"></span>
            )}
          </Button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-[#FFFDF9] border border-[#EADBCE] rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-100 text-left">
                <div className="flex justify-between items-center px-3.5 pb-2 border-b border-[#EADBCE]">
                  <span className="text-[10px] font-heading font-bold text-[#6B4C82] uppercase tracking-wider">
                    Notifications ({unreadCount} unread)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[9px] font-heading font-semibold text-[#FF2E63] hover:underline border-0 bg-transparent cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {/* Push notification toggle */}
                  {pushSupported && (
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-zinc-850 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        {pushSubscribed ? (
                          <Bell className="w-2.5 h-2.5 text-festival-teal" />
                        ) : (
                          <BellOff className="w-2.5 h-2.5" />
                        )}
                        Push alerts
                      </span>
                      {pushPermission === "denied" ? (
                        <span className="text-[9px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          Blocked in browser
                        </span>
                      ) : pushSubscribed ? (
                        <button
                          type="button"
                          onClick={disablePush}
                          disabled={pushLoading}
                          className="text-[9px] font-semibold text-festival-teal bg-warm-ivory hover:bg-festival-teal/20 px-2 py-0.5 rounded transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {pushLoading ? "..." : "Active · Turn off"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={enablePush}
                          disabled={pushLoading}
                          className="text-[9px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {pushLoading ? "..." : "Enable"}
                        </button>
                      )}
                    </div>
                  )}

                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 text-[10px] leading-snug border-b border-slate-50 dark:border-zinc-900/60 last:border-0 hover:bg-slate-50/50 transition-colors ${
                          !notif.read
                            ? "bg-warm-ivory font-semibold text-slate-800 dark:text-zinc-200"
                            : "text-slate-500 font-light"
                        }`}
                      >
                        <p>{notif.message}</p>
                        <span className="block text-[8px] text-slate-400 mt-1">
                          {notif.time}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-[10px] text-slate-400 select-none">
                      No active alerts or notifications.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-5 w-px bg-slate-200"></div>

        {/* Profile Dropdown Container */}
        <UserDropdown user={user} />
      </div>
    </header>
  );
}
