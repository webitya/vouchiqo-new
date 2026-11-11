"use client";

import { LayoutGrid, MapPin, Store, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LocationSelector from "../LocationSelector";

const ALL_NAV_LINKS = [
  { href: "/brands", icon: Store, label: "Brands", shortLabel: "Brands" },
  {
    href: "/categories",
    icon: LayoutGrid,
    label: "Categories",
    shortLabel: "Categories",
  },
  {
    href: "/trending",
    icon: TrendingUp,
    label: "Trending",
    shortLabel: "Trending",
  },
  {
    href: "/nearby-offers",
    icon: MapPin,
    label: "Nearby Map",
    shortLabel: "Nearby",
  },
];

const NavLink = ({ href, icon: Icon, label, shortLabel, isActive }) => (
  <Link
    href={href}
    prefetch={true}
    className={`flex items-center gap-1 xl:gap-1.5 text-[12.5px] xl:text-[14px] transition-all whitespace-nowrap py-1 px-2 xl:px-2.5 rounded-lg font-sans ${
      isActive
        ? "text-[#FFD166] font-semibold bg-white/10 shadow-2xs border border-[#FFD166]/30"
        : "text-[#FFF8EF]/90 hover:text-[#FFD166] hover:bg-white/10 font-medium"
    }`}
  >
    <Icon
      className={`h-4 w-4 xl:h-[18px] xl:w-[18px] shrink-0 transition-transform ${
        isActive
          ? "stroke-[1.8] text-[#FFD166]"
          : "stroke-[1.6] text-[#FFF8EF]/75 group-hover:text-[#FFD166]"
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
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

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
