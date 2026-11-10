"use client";

import { Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LocationSelector from "../LocationSelector";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import NotificationBell from "./NotificationBell";
import PromoBanner from "./PromoBanner";
import SearchBar from "./SearchBar";
import UserMenu from "./UserMenu";

const NOTIFICATION_COUNT = 2;

export const Navbar = () => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const pathname = usePathname();

  // Automatically close mobile search when navigating to a new route
  useEffect(() => {
    if (pathname) {
      setIsMobileSearchOpen(false);
    }
  }, [pathname]);

  return (
    <header className="w-full bg-white font-sans border-b border-slate-200/90 shadow-xs sticky top-0 z-50">
      <PromoBanner />
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <Logo />
        </div>

        {/* Middle: Search (Desktop & Tablet: >=768px) */}
        <div className="hidden md:block flex-1 min-w-[200px] lg:min-w-[240px] xl:min-w-[280px] max-w-[360px] xl:max-w-[420px] mx-1 lg:mx-2">
          <SearchBar />
        </div>

        {/* Right Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 xl:gap-4 shrink-0">
          {/* Tablet-only Location Selector (md to lg: 768px-1023px) */}
          <div className="hidden md:block lg:hidden">
            <LocationSelector />
          </div>

          {/* Desktop Nav Links + Location (lg+: >=1024px) */}
          <div className="hidden lg:block">
            <NavLinks />
          </div>

          {/* Divider (Desktop lg+ only) */}
          <div className="h-5 w-px bg-gray-200 hidden lg:block" />

          {/* Action icons: Mobile Search Trigger + Notification + UserMenu + Drawer Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
            {/* Mobile Search Icon Button (<768px only) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen((prev) => !prev)}
              className={`p-1.5 rounded-full transition-colors cursor-pointer border-0 flex items-center justify-center md:hidden ${
                isMobileSearchOpen
                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  : "text-slate-600 hover:text-blue-600 hover:bg-slate-100 bg-transparent"
              }`}
              aria-label={isMobileSearchOpen ? "Close search" : "Open search"}
              aria-expanded={isMobileSearchOpen}
            >
              {isMobileSearchOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </button>

            <NotificationBell count={NOTIFICATION_COUNT} />
            <UserMenu />
            {/* Mobile & Tablet Drawer Trigger (hidden on lg+: >=1024px) */}
            <MobileMenu />
          </div>
        </div>
      </div>

      {/* Mobile Search Row (Shown ONLY when user clicks the search icon on mobile) */}
      {isMobileSearchOpen && (
        <div className="block md:hidden px-3 sm:px-4 py-2 border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-xs animate-in fade-in slide-in-from-top-1 duration-150 max-w-[1440px] mx-auto w-full">
          <div className="w-full">
            <SearchBar
              autoFocus={true}
              onSelect={() => setIsMobileSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
