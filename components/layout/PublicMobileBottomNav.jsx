"use client";

import { Flame, Home, LayoutGrid, MapPin, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicMobileBottomNav() {
  const pathname = usePathname();

  // Hide on admin and merchant backoffice routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/merchant")) {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Brands",
      href: "/brands",
      icon: Store,
    },
    {
      label: "Nearby",
      href: "/nearby-offers",
      icon: MapPin,
      isCenter: true,
    },
    {
      label: "Trending",
      href: "/trending",
      icon: Flame,
    },
    {
      label: "Categories",
      href: "/categories",
      icon: LayoutGrid,
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#EADBCE] shadow-[0_-4px_20px_rgba(53,16,74,0.06)] px-2 py-1.5 flex items-center justify-around select-none font-sans"
      aria-label="Mobile Bottom Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            prefetch={true}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors focus:outline-none active:scale-95 ${
              isActive
                ? "text-[#FF2E63] font-semibold"
                : "text-[#35104A]/60 hover:text-[#35104A] font-medium"
            }`}
          >
            <div className="flex items-center justify-center w-7 h-7">
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive
                    ? "stroke-[2.2] text-[#FF2E63] scale-105"
                    : "stroke-[1.6] text-[#35104A]/60"
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight mt-0.5 ${
                isActive
                  ? "font-semibold text-[#FF2E63]"
                  : "font-medium text-[#35104A]/60"
              }`}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
