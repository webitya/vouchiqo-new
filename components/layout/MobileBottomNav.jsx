"use client";

import { LayoutDashboard, Layers, PlusCircle, Megaphone, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import { useMerchantLock } from "@/components/shared/MerchantLockProvider";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isLocked, openModal } = useMerchantLock();

  // Only render on merchant routes
  if (!pathname.startsWith("/merchant")) {
    return null;
  }

  const handleTabClick = (e, url) => {
    if (
      isLocked &&
      !url.startsWith("/merchant/profile") &&
      !url.startsWith("/merchant/application-status")
    ) {
      e.preventDefault();
      e.stopPropagation();
      openModal();
    }
  };

  const tabs = [
    {
      label: "Dashboard",
      url: "/merchant/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "My Listings",
      url: "/merchant/coupons",
      icon: Layers,
    },
    {
      label: "Post New",
      url: "/merchant/coupons/new",
      icon: PlusCircle,
      isCta: true,
    },
    {
      label: "Campaigns",
      url: "/merchant/campaigns",
      icon: Megaphone,
    },
    {
      label: "Settings",
      url: "/merchant/profile",
      icon: Settings,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A3C5E] border-t border-slate-700/60 shadow-2xl px-2 py-1.5 flex items-center justify-around">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = pathname === t.url || (t.url !== "/merchant/dashboard" && pathname.startsWith(t.url));

        if (t.isCta) {
          return (
            <Link
              key={t.label}
              href={t.url}
              onClick={(e) => handleTabClick(e, t.url)}
              className="flex flex-col items-center justify-center p-1.5 rounded-xl bg-[#e85d04] text-white shadow-md active:scale-95 transition-all -mt-3"
            >
              <Icon className="w-5 h-5 stroke-[2.5]" />
              <span className="text-[10px] font-black tracking-tight">{t.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={t.label}
            href={t.url}
            onClick={(e) => handleTabClick(e, t.url)}
            className={`flex flex-col items-center justify-center p-1 rounded-lg transition-all ${
              isActive ? "text-orange-400 font-bold" : "text-slate-300 hover:text-white"
            }`}
          >
            <Icon className="w-4.5 h-4.5" />
            <span className="text-[10px] font-semibold mt-0.5">{t.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

