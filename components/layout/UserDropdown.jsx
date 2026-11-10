"use client";

import {
  Bookmark,
  Home,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  MapPin,
  Settings,
  ShieldCheck,
  Store,
  Tag,
  TrendingUp,
  User,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useMerchantLock } from "@/components/shared/MerchantLockProvider";
import SafeImage from "@/components/shared/SafeImage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { useUser } from "@/hooks/use-user";

export default function UserDropdown({
  user,
  isMobile = false,
  onMobileClose = null,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState("");
  const { user: authUser, logout } = useUser();
  const { isLocked, openModal, merchant } = useMerchantLock();

  useEffect(() => {
    const updateSearch = () => {
      if (typeof window !== "undefined") {
        setCurrentSearch(window.location.search);
      }
    };
    updateSearch();
    window.addEventListener("popstate", updateSearch);
    const interval = setInterval(updateSearch, 200);
    return () => {
      window.removeEventListener("popstate", updateSearch);
      clearInterval(interval);
    };
  }, []);

  const { data: merchantProfile } = useMerchantProfile({
    enabled: !!(user || authUser),
  });

  const effectiveRole = useMemo(() => {
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/merchant")) return "merchant";
    if (
      user?.role === "merchant" ||
      authUser?.role === "merchant" ||
      merchantProfile
    ) {
      return "merchant";
    }
    if (user?.role === "admin" || authUser?.role === "admin") return "admin";
    return user?.role || authUser?.role || "customer";
  }, [pathname, user?.role, authUser?.role, merchantProfile]);

  const merchantLogo =
    merchant?.logo ||
    merchant?.logoUrl ||
    merchantProfile?.logo ||
    merchantProfile?.logoUrl ||
    null;
  const merchantName =
    merchant?.businessName || merchantProfile?.businessName || null;

  if (!user && !authUser) return null;

  const handleLogoutAction = async () => {
    if (onMobileClose) onMobileClose();
    await logout();
  };

  const handleMerchantNavClick = (e, url) => {
    if (effectiveRole === "merchant" && isLocked) {
      if (
        !url ||
        (!url.startsWith("/merchant/profile") &&
          !url.startsWith("/merchant/application-status"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        if (onMobileClose) onMobileClose();
        openModal();
      }
    }
  };

  const isLinkActive = (url) => {
    const [targetPath, targetQuery] = url.split("?");
    const normalizedTarget = targetPath.replace(/\/$/, "");
    const normalizedCurrent = pathname.replace(/\/$/, "");

    if (normalizedCurrent !== normalizedTarget) return false;
    const searchParams = new URLSearchParams(currentSearch);

    if (!targetQuery) {
      return (
        !searchParams.get("tab") || normalizedTarget === "/customer/dashboard"
      );
    }

    const params = new URLSearchParams(targetQuery);
    for (const [k, v] of params.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  };

  const currentName =
    effectiveRole === "merchant"
      ? merchantName || user?.name || authUser?.name || "Merchant Partner"
      : user?.name || authUser?.name || "User";

  const currentEmail = user?.email || authUser?.email || "";
  const currentImage =
    (effectiveRole === "merchant" ? merchantLogo : null) ||
    user?.image ||
    user?.logo ||
    user?.logoUrl ||
    merchantLogo ||
    authUser?.image ||
    authUser?.logo ||
    authUser?.logoUrl ||
    null;

  const initials = currentName
    ? currentName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  // Per-role avatar styles
  const roleAvatarStyle =
    effectiveRole === "admin"
      ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white border-purple-300"
      : effectiveRole === "merchant"
        ? "bg-gradient-to-br from-[#F72853] to-rose-600 text-white border-rose-300"
        : "bg-slate-100 text-slate-800 border-slate-200";

  const renderAvatarFallback = () => {
    if (effectiveRole === "admin") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center rounded-[7px]">
          <ShieldCheck className="w-4 h-4 text-white stroke-[2.2]" />
        </div>
      );
    }
    if (effectiveRole === "merchant") {
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#F72853] to-rose-600 text-white font-medium text-xs flex items-center justify-center rounded-[7px]">
          <Store className="w-4 h-4 text-white stroke-[2]" />
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-slate-100 text-slate-800 font-medium text-xs border border-slate-200 uppercase flex items-center justify-center rounded-[7px]">
        {initials}
      </div>
    );
  };

  const customerLinks = [
    { title: "Dashboard", url: "/customer/dashboard", icon: LayoutDashboard },
    { title: "Savings Hub", url: "/profile?tab=savings", icon: IndianRupee },
    { title: "Saved Offers", url: "/profile?tab=saved", icon: Bookmark },
    { title: "Cashback Wallet", url: "/profile?tab=wallet", icon: Wallet },
    { title: "Nearby Offers", url: "/profile?tab=nearby", icon: MapPin },
    { title: "Profile Settings", url: "/profile?tab=settings", icon: Settings },
  ];

  if (isMobile) {
    return (
      <div className="space-y-3 font-sans text-left">
        <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
          <div className="h-9 w-9 rounded-[7px] border border-slate-200 shrink-0 overflow-hidden bg-white flex items-center justify-center shadow-2xs">
            {currentImage ? (
              <SafeImage
                src={currentImage}
                alt={currentName}
                width={36}
                height={36}
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              renderAvatarFallback()
            )}
          </div>
          <div className="text-left min-w-0 flex-1">
            <h4 className="text-xs font-semibold text-slate-800 truncate">
              {effectiveRole === "admin" ? "Super Admin" : currentName}
            </h4>
            <p className="text-[10px] text-slate-400 truncate">
              {currentEmail || `${effectiveRole}@vouchiqo.com`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogoutAction}
          className="flex items-center gap-2 text-xs font-normal text-rose-600 hover:text-rose-700 transition-colors border-0 bg-transparent p-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span>Sign Out</span>
        </button>
      </div>
    );
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="User menu"
          className="flex items-center justify-center focus:outline-none cursor-pointer select-none rounded-[7px] transition-transform hover:scale-105 active:scale-95 border-0 bg-transparent outline-none"
        >
          <div
            className={`h-8 w-8 rounded-[7px] border shrink-0 shadow-2xs transition-all overflow-hidden flex items-center justify-center bg-white ${
              effectiveRole === "admin"
                ? "border-purple-300 hover:border-purple-400"
                : effectiveRole === "merchant"
                  ? "border-slate-200/90 hover:border-rose-300"
                  : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {currentImage ? (
              <SafeImage
                src={currentImage}
                alt={currentName}
                width={32}
                height={32}
                className="w-full h-full object-contain p-0.5"
              />
            ) : (
              renderAvatarFallback()
            )}
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        collisionPadding={12}
        className="w-60 bg-white text-slate-800 border border-slate-200/90 shadow-xl rounded-2xl p-1.5 font-sans animate-in fade-in zoom-in-95 duration-100 z-50"
      >
        {/* User Card Header */}
        <DropdownMenuLabel className="p-2 font-normal select-none">
          <div className="flex items-center gap-2.5 text-left">
            <div className="h-9 w-9 rounded-[7px] border border-slate-200 shrink-0 overflow-hidden bg-white flex items-center justify-center shadow-2xs">
              {currentImage ? (
                <SafeImage
                  src={currentImage}
                  alt={currentName}
                  width={36}
                  height={36}
                  className="w-full h-full object-contain p-0.5"
                />
              ) : (
                renderAvatarFallback()
              )}
            </div>
            <div className="flex flex-col text-left min-w-0 flex-1 leading-tight">
              <span className="text-xs font-semibold text-slate-900 truncate">
                {effectiveRole === "admin" ? "Super Admin" : currentName}
              </span>
              {currentEmail ? (
                <span className="text-[10px] text-slate-400 truncate mt-0.5">
                  {currentEmail}
                </span>
              ) : null}
              <div className="mt-1">
                {effectiveRole === "admin" ? (
                  <span className="bg-purple-50 text-purple-700 border border-purple-200/80 text-[8.5px] font-semibold px-1.5 py-0.5 rounded-[7px] inline-flex items-center gap-1">
                    <ShieldCheck className="w-2.5 h-2.5 text-purple-600" />{" "}
                    SUPER ADMIN
                  </span>
                ) : effectiveRole === "merchant" ? (
                  <span className="bg-rose-50 text-[#F72853] border border-rose-200/90 text-[8.5px] font-semibold px-1.5 py-0.5 rounded-[7px] inline-flex items-center gap-1 tracking-wider shadow-2xs">
                    <Store className="w-2.5 h-2.5 text-[#F72853]" /> MERCHANT
                    PARTNER
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[8.5px] font-normal px-1.5 py-0.5 rounded-[7px] inline-flex items-center gap-1">
                    <User className="w-2.5 h-2.5 text-slate-500" /> MEMBER
                  </span>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        {/* Customer view */}
        {(!effectiveRole || effectiveRole === "customer") && (
          <DropdownMenuGroup className="space-y-0.5">
            {customerLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.url);
              return (
                <DropdownMenuItem key={item.title} asChild>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-2.5 cursor-pointer w-full text-xs rounded-xl px-2.5 py-1.5 group transition-all ${
                      active
                        ? "bg-rose-50 text-[#F72853] font-medium border border-rose-200/70 shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-colors shrink-0 ${
                        active
                          ? "text-[#F72853]"
                          : "text-slate-400 group-hover:text-[#F72853]"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}

        {/* Merchant view */}
        {effectiveRole === "merchant" && (
          <DropdownMenuGroup className="space-y-0.5">
            {[
              {
                title: "Merchant Dashboard",
                url: "/merchant/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "Business Profile",
                url: "/merchant/profile",
                icon: User,
              },
              {
                title: "Post New Listing",
                url: "/merchant/coupons/new",
                icon: Tag,
              },
              {
                title: "Analytics",
                url: "/merchant/analytics",
                icon: TrendingUp,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.url);
              return (
                <DropdownMenuItem key={item.title} asChild>
                  <Link
                    href={item.url}
                    onClick={(e) => handleMerchantNavClick(e, item.url)}
                    className={`flex items-center gap-2.5 cursor-pointer w-full text-xs rounded-xl px-2.5 py-1.5 group transition-all ${
                      active
                        ? "bg-rose-50 text-[#F72853] font-medium border border-rose-200/70 shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-colors shrink-0 ${
                        active
                          ? "text-[#F72853]"
                          : "text-slate-400 group-hover:text-[#F72853]"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}

        {/* Admin view */}
        {effectiveRole === "admin" && (
          <DropdownMenuGroup className="space-y-0.5">
            {[
              {
                title: "Admin Dashboard",
                url: "/admin/dashboard",
                icon: LayoutDashboard,
              },
              {
                title: "Merchant Approvals",
                url: "/admin/approvals/merchants",
                icon: ShieldCheck,
              },
              {
                title: "Manage Users",
                url: "/admin/users",
                icon: Users,
              },
            ].map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.url);
              return (
                <DropdownMenuItem key={item.title} asChild>
                  <Link
                    href={item.url}
                    className={`flex items-center gap-2.5 cursor-pointer w-full text-xs rounded-xl px-2.5 py-1.5 group transition-all ${
                      active
                        ? "bg-rose-50 text-[#F72853] font-medium border border-rose-200/70 shadow-2xs"
                        : "text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`h-3.5 w-3.5 transition-colors shrink-0 ${
                        active
                          ? "text-[#F72853]"
                          : "text-slate-400 group-hover:text-[#F72853]"
                      }`}
                    />
                    <span>{item.title}</span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        <DropdownMenuItem asChild>
          <Link
            href="/"
            className={`flex items-center gap-2.5 cursor-pointer w-full text-xs rounded-xl px-2.5 py-1.5 group transition-all ${
              pathname === "/"
                ? "bg-rose-50 text-[#F72853] font-medium border border-rose-200/70 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-normal border border-transparent"
            }`}
          >
            <Home className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            <span>Homepage</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-100 my-1" />

        <DropdownMenuItem
          onClick={handleLogoutAction}
          className="flex items-center gap-2.5 cursor-pointer text-xs font-normal text-rose-600 focus:text-rose-700 focus:bg-rose-50 rounded-xl px-2.5 py-1.5 group transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" />
          <span>Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
