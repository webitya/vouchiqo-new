"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  ShieldCheck,
  Store,
  User as UserIcon,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { useUser } from "@/hooks/use-user";

export function NavUser({ user, role = "admin" }) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { logout } = useUser();
  const isCollapsed = state === "collapsed";
  const isMerchant = role === "merchant";
  const isAdmin = role === "admin";
  const { data: merchantProfile } = useMerchantProfile({
    enabled: isMerchant,
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "VK";

  const profileLink = isMerchant
    ? "/merchant/profile"
    : isAdmin
      ? "/admin/dashboard"
      : "/profile";

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const avatarImg =
    (isMerchant ? merchantProfile?.logo || merchantProfile?.logoUrl : null) ||
    user?.image ||
    user?.logo ||
    user?.logoUrl;

  const renderAvatarFallback = () => {
    if (isAdmin) {
      return (
        <AvatarFallback className="rounded-[7px] bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center">
          <ShieldCheck className="h-4 w-4 text-white stroke-[2.2]" />
        </AvatarFallback>
      );
    }
    if (isMerchant) {
      return (
        <AvatarFallback className="rounded-[7px] bg-gradient-to-br from-[#F72853] to-rose-600 text-white font-medium text-xs flex items-center justify-center">
          <Store className="h-4 w-4 text-white stroke-[2]" />
        </AvatarFallback>
      );
    }
    return (
      <AvatarFallback className="rounded-[7px] font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200 uppercase flex items-center justify-center">
        {initials}
      </AvatarFallback>
    );
  };

  return (
    <SidebarMenu className="font-sans">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full cursor-pointer transition-colors text-slate-800 hover:bg-slate-50 data-[state=open]:bg-slate-100/80 border border-slate-200/80 rounded-[7px] p-2 bg-slate-50/50 shadow-2xs"
            >
              <Avatar className="h-8 w-8 rounded-[7px] shrink-0 border border-slate-200 overflow-hidden bg-white">
                {avatarImg ? (
                  <AvatarImage
                    src={avatarImg}
                    alt={user?.name || "User"}
                    className="object-contain p-0.5"
                  />
                ) : null}
                {renderAvatarFallback()}
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                    <span className="truncate font-medium text-sm text-slate-900 flex items-center gap-1.5">
                      {isAdmin ? "Super Admin" : user?.name || "User"}
                    </span>
                    <span className="truncate text-[11px] text-slate-400 font-normal">
                      {user?.email ||
                        (isAdmin ? "admin@vouchiqo.com" : "user@vouchiqo.com")}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-xl border border-slate-200/90 shadow-xl p-1 bg-white text-slate-800 font-sans animate-in fade-in zoom-in-95 duration-100"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2.5 px-2 py-2 text-left text-xs">
                <Avatar className="h-8 w-8 rounded-[7px] shrink-0 border border-slate-200 overflow-hidden bg-white">
                  {avatarImg ? (
                    <AvatarImage
                      src={avatarImg}
                      alt={user?.name || "User"}
                      className="object-contain p-0.5"
                    />
                  ) : null}
                  {renderAvatarFallback()}
                </Avatar>
                <div className="grid flex-1 text-left text-xs leading-tight min-w-0">
                  <span className="truncate font-semibold text-slate-800">
                    {isAdmin ? "Super Admin" : user?.name || "User"}
                  </span>
                  <span className="truncate text-[11px] text-slate-400 font-normal">
                    {user?.email ||
                      (isAdmin ? "admin@vouchiqo.com" : "user@vouchiqo.com")}
                  </span>
                  <div className="mt-1">
                    {isAdmin ? (
                      <span className="bg-purple-50 text-purple-700 border border-purple-200/80 text-[8.5px] font-semibold px-1.5 py-0.5 rounded-[7px] inline-flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-purple-600" />{" "}
                        SUPER ADMIN
                      </span>
                    ) : isMerchant ? (
                      <span className="bg-rose-50 text-[#F72853] border border-rose-200/90 text-[8.5px] font-semibold px-1.5 py-0.5 rounded-[7px] inline-flex items-center gap-1 tracking-wider shadow-2xs">
                        <Store className="w-2.5 h-2.5 text-[#F72853]" />{" "}
                        MERCHANT PARTNER
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[8.5px] font-normal px-1.5 py-0.5 rounded-[7px] inline-flex items-center gap-1">
                        <UserIcon className="w-2.5 h-2.5 text-slate-500" />{" "}
                        MEMBER
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            {isMerchant && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/merchant/billing"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 text-xs font-normal text-[#F72853] hover:text-[#df1c44] cursor-pointer"
                    >
                      <Zap className="h-4 w-4 text-[#F72853]" />
                      Upgrade Plan
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={profileLink}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 text-xs font-normal text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  <BadgeCheck className="h-4 w-4 text-slate-400" />
                  Account Profile
                </Link>
              </DropdownMenuItem>
              {isMerchant && (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/merchant/billing"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 text-xs font-normal text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      Billing &amp; Subscriptions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/merchant/notifications"
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 text-xs font-normal text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <Bell className="h-4 w-4 text-slate-400" />
                      Notifications
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                if (isMobile) setOpenMobile(false);
                await logout();
              }}
              className="flex items-center gap-2 text-xs text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer font-normal"
            >
              <LogOut className="h-4 w-4 text-rose-600" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
