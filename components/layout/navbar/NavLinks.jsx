"use client";

import { Flame, LayoutGrid, MapPin, Store } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LocationSelector from "../LocationSelector";

const ALL_NAV_LINKS = [
  { href: "/brands", icon: Store, label: "Brands", shortLabel: "Brands" },
  { href: "/categories", icon: LayoutGrid, label: "Categories", shortLabel: "Categories" },
  { href: "/campaigns", icon: Flame, label: "Trending", shortLabel: "Trending" },
  { href: "/nearby-offers", icon: MapPin, label: "Nearby Map", shortLabel: "Nearby" },
];

const NavLink = ({ href, icon: Icon, label, shortLabel, isActive }) => (
  <Link
    href={href}
    prefetch={true}
    className={`flex items-center gap-1 xl:gap-1.5 text-[12.5px] xl:text-[14px] transition-colors whitespace-nowrap py-1 px-1.5 xl:px-2.5 rounded-md font-sans ${
      isActive
        ? "text-[#FF2E63] font-semibold"
        : "text-[#35104A]/80 hover:text-[#FF2E63] font-medium"
    }`}
  >
    <Icon
      className={`h-4 w-4 xl:h-[18px] xl:w-[18px] shrink-0 transition-transform ${
        isActive
          ? "stroke-[2.2] text-[#FF2E63]"
          : "stroke-[1.7] text-[#35104A]/60 group-hover:text-[#FF2E63]"
      }`}
    />
    <span className="hidden xl:inline">{label}</span>
    <span className="inline xl:hidden">{shortLabel || label}</span>
  </Link>
);

export const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 xl:gap-3">
      {ALL_NAV_LINKS.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <NavLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            shortLabel={link.shortLabel}
            isActive={isActive}
          />
        );
      })}
      <LocationSelector />
    </nav>
  );
};

export default NavLinks;
