"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMerchantLock } from "@/components/shared/MerchantLockProvider";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavMain({ groups, isMerchant = false }) {
  const pathname = usePathname();
  const [currentSearch, setCurrentSearch] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.search;
    }
    return "";
  });
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { isLocked, openModal } = useMerchantLock();

  useEffect(() => {
    const updateSearch = () => {
      if (typeof window !== "undefined") {
        setCurrentSearch(window.location.search);
      }
    };
    updateSearch();
    window.addEventListener("popstate", updateSearch);
    window.addEventListener("vouchiqo_nav_change", updateSearch);
    const interval = setInterval(updateSearch, 150);
    return () => {
      window.removeEventListener("popstate", updateSearch);
      window.removeEventListener("vouchiqo_nav_change", updateSearch);
      clearInterval(interval);
    };
  }, []);

  const [openSubMenus, setOpenSubMenus] = useState({});

  const toggleSubMenu = (title) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleNavClick = (e, url) => {
    if (isMerchant && isLocked) {
      if (
        !url ||
        (!url.startsWith("/merchant/profile") &&
          !url.startsWith("/merchant/application-status"))
      ) {
        e.preventDefault();
        e.stopPropagation();
        openModal();
        return;
      }
    }
    // Automatically close mobile drawer when navigating
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <div className="space-y-1.5 font-sans text-left">
      {groups.map((group, groupIdx) => (
        <SidebarGroup key={group.title || `group-${groupIdx}`} className="p-0">
          {!isCollapsed &&
            group.title &&
            group.title.trim().toLowerCase() !== "navigation" && (
              <SidebarGroupLabel className="px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-wider block h-auto text-slate-400">
                {group.title}
              </SidebarGroupLabel>
            )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {group.items.map((item) => {
                const [itemPath, itemQuery] = (item.url || "").split("?");
                const normalizedPath = pathname.replace(/\/$/, "");
                const normalizedItemPath = itemPath.replace(/\/$/, "");
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const searchParamsObj = new URLSearchParams(currentSearch);

                let isParentActive = false;
                if (hasSubItems) {
                  isParentActive = item.subItems.some((sub) => {
                    const [subPath, subQuery] = sub.url.split("?");
                    const normalizedSubPath = subPath.replace(/\/$/, "");
                    if (normalizedPath !== normalizedSubPath) return false;
                    if (!subQuery) return true;
                    const subParams = new URLSearchParams(subQuery);
                    for (const [k, v] of subParams.entries()) {
                      if (searchParamsObj.get(k) !== v) return false;
                    }
                    return true;
                  });
                } else if (normalizedItemPath) {
                  if (normalizedPath === normalizedItemPath) {
                    if (itemQuery) {
                      const itemParams = new URLSearchParams(itemQuery);
                      isParentActive = true;
                      for (const [k, v] of itemParams.entries()) {
                        if (searchParamsObj.get(k) !== v) {
                          isParentActive = false;
                          break;
                        }
                      }
                    } else {
                      isParentActive =
                        !searchParamsObj.get("tab") ||
                        normalizedItemPath === "/customer/dashboard";
                    }
                  } else if (
                    normalizedItemPath !== "" &&
                    normalizedItemPath !== "/merchant/dashboard" &&
                    normalizedItemPath !== "/admin/dashboard" &&
                    normalizedItemPath !== "/customer/dashboard" &&
                    normalizedPath.startsWith(`${normalizedItemPath}/`)
                  ) {
                    isParentActive = true;
                  }
                }

                const isSubOpen =
                  openSubMenus[item.title] !== undefined
                    ? openSubMenus[item.title]
                    : isParentActive || item.defaultOpen === true;

                const Icon = item.icon;

                // CTA item (e.g. Post New Listing)
                if (item.isCta) {
                  const ctaClass = isParentActive
                    ? "bg-[#F72853] text-white shadow-sm shadow-[#F72853]/25 font-medium rounded-xl"
                    : "border border-rose-200 text-[#F72853] hover:bg-[#F72853] hover:text-white font-medium bg-rose-50/60 shadow-2xs rounded-xl";

                  const ctaIconClass = isParentActive
                    ? "text-white"
                    : "text-[#F72853]";

                  return (
                    <SidebarMenuItem
                      key={item.title}
                      className="my-0.5"
                      data-tour="tour-post-new"
                    >
                      <Link
                        href={item.url}
                        onClick={(e) => handleNavClick(e, item.url)}
                        className={`flex w-full items-center gap-2.5 px-2.5 py-1.5 text-xs transition-all ${ctaClass} ${
                          isCollapsed ? "justify-center px-2" : "justify-start"
                        }`}
                      >
                        {Icon && (
                          <Icon
                            className={`h-4 w-4 shrink-0 transition-colors ${ctaIconClass}`}
                          />
                        )}
                        {!isCollapsed && (
                          <span className="text-xs font-medium">
                            {item.title}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuItem>
                  );
                }

                // Expandable sub-items menu (e.g. My Listings, Merchants)
                if (hasSubItems) {
                  const parentBtnClass = isParentActive
                    ? "!bg-[#F72853] !text-white font-medium shadow-sm shadow-[#F72853]/25 hover:!bg-[#e01e47] rounded-xl"
                    : "bg-transparent hover:bg-rose-50/70 text-slate-700 hover:text-[#F72853] font-normal border border-transparent hover:border-rose-200/60 rounded-xl transition-all";

                  const parentIconClass = isParentActive
                    ? "text-white"
                    : "text-inherit";

                  const parentTextClass = isParentActive
                    ? "text-white font-medium"
                    : "text-inherit font-normal";

                  const chevronClass = isParentActive
                    ? "text-white"
                    : "text-inherit";

                  return (
                    <SidebarMenuItem
                      key={item.title}
                      data-tour={item.tourId}
                      className="my-0.5"
                    >
                      <SidebarMenuButton
                        onClick={(e) => {
                          if (isMerchant && isLocked) {
                            handleNavClick(e, item.url);
                          }
                          toggleSubMenu(item.title);
                        }}
                        isActive={false}
                        tooltip={isCollapsed ? item.title : undefined}
                        className={`w-full justify-between h-8.5 py-1 px-2.5 text-xs transition-all cursor-pointer ${parentBtnClass}`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${parentIconClass}`}
                            />
                          )}
                          <span className={`text-xs ${parentTextClass}`}>
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && !isCollapsed && (
                            <span
                              className={`flex h-4.5 min-w-4.5 items-center justify-center rounded-full text-[9px] font-medium px-1.5 shrink-0 shadow-2xs ${
                                item.badgeColor || "bg-[#F72853] text-white"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                          {!isCollapsed && (
                            <ChevronDown
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${chevronClass} ${
                                isSubOpen ? "rotate-180" : ""
                              }`}
                            />
                          )}
                        </div>
                      </SidebarMenuButton>

                      {!isCollapsed && isSubOpen && (
                        <SidebarMenuSub className="mt-1 space-y-1 pl-2.5 border-l border-rose-200">
                          {item.subItems.map((sub) => {
                            const isSubActive = (() => {
                              const [subPath, subQuery] = sub.url.split("?");
                              const normalizedSubPath = subPath.replace(
                                /\/$/,
                                "",
                              );
                              const normalizedCurrentPath = pathname.replace(
                                /\/$/,
                                "",
                              );

                              if (normalizedCurrentPath !== normalizedSubPath)
                                return false;

                              if (!subQuery) {
                                return (
                                  !searchParamsObj.get("type") &&
                                  !searchParamsObj.get("status")
                                );
                              }

                              const subParams = new URLSearchParams(subQuery);
                              for (const [key, value] of subParams.entries()) {
                                if (searchParamsObj.get(key) !== value)
                                  return false;
                              }
                              return true;
                            })();

                            const SubIcon = sub.icon;

                            const subBtnClass = isSubActive
                              ? "!bg-[#F72853] !text-white font-medium shadow-xs rounded-lg"
                              : "bg-transparent hover:bg-rose-50/70 text-slate-600 hover:text-[#F72853] font-normal border border-transparent hover:border-rose-200/50 rounded-lg transition-all";

                            const subIconClass = isSubActive
                              ? "!text-white"
                              : "text-inherit";

                            const subTextClass = isSubActive
                              ? "!text-white font-medium"
                              : "text-inherit font-normal";

                            return (
                              <SidebarMenuSubItem key={sub.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={false}
                                  className={`h-7 py-0.5 px-2 text-xs transition-all ${subBtnClass}`}
                                >
                                  <Link
                                    href={sub.url}
                                    onClick={(e) => handleNavClick(e, sub.url)}
                                    className="flex items-center gap-2 w-full min-w-0"
                                  >
                                    {SubIcon && (
                                      <SubIcon
                                        className={`h-3.5 w-3.5 shrink-0 transition-colors ${subIconClass}`}
                                      />
                                    )}
                                    <span className={`text-xs ${subTextClass}`}>
                                      {sub.title}
                                    </span>
                                    {sub.badge && !isCollapsed && (
                                      <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F72853] text-[9px] font-medium text-white px-1.5 shrink-0 shadow-2xs">
                                        {sub.badge}
                                      </span>
                                    )}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }

                // Normal sidebar navigation item
                const singleBtnClass = isParentActive
                  ? "!bg-[#F72853] !text-white font-medium shadow-sm shadow-[#F72853]/25 hover:!bg-[#e01e47] rounded-xl"
                  : "bg-transparent hover:bg-rose-50/70 text-slate-700 hover:text-[#F72853] font-normal border border-transparent hover:border-rose-200/60 rounded-xl transition-all";

                const singleIconClass = isParentActive
                  ? "!text-white"
                  : "text-inherit";

                const singleTextClass = isParentActive
                  ? "!text-white font-medium"
                  : "text-inherit font-normal";

                const URL_TOUR_MAP = {
                  "/merchant/dashboard": "tour-dashboard-overview",
                  "/merchant/coupons": "tour-my-listings",
                  "/merchant/coupons/new": "tour-post-new",
                  "/merchant/analytics": "tour-analytics",
                  "/merchant/campaigns": "tour-campaigns",
                  "/merchant/notifications": "tour-notifications",
                  "/merchant/billing": "tour-billing",
                  "/merchant/profile": "tour-business-profile",
                  "/merchant/application-status": "tour-app-tracking",
                  "/merchant/settings": "tour-settings",
                  "/faq": "sidebar-help",
                };

                const tourId = item.tourId || URL_TOUR_MAP[item.url];

                return (
                  <SidebarMenuItem
                    key={item.title}
                    data-tour={tourId}
                    className="my-0.5 relative"
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={false}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={`h-8.5 py-1 px-2.5 text-xs transition-all cursor-pointer ${singleBtnClass}`}
                    >
                      <Link
                        href={item.url}
                        onClick={(e) => handleNavClick(e, item.url)}
                        className="flex items-center justify-between w-full relative"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {Icon && (
                            <Icon
                              className={`h-4 w-4 shrink-0 transition-colors ${singleIconClass}`}
                            />
                          )}
                          {!isCollapsed && (
                            <span
                              className={`text-xs truncate ${singleTextClass}`}
                            >
                              {item.title}
                            </span>
                          )}
                        </div>
                        {item.badge && !isCollapsed && (
                          <span
                            className={`flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] px-2 shrink-0 ${
                              item.badgeColor ||
                              "bg-[#F72853] text-white font-medium shadow-xs shadow-[#F72853]/40 animate-pulse"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.badge && isCollapsed && (
                          <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-[#F72853] border-2 border-white animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </div>
  );
}
