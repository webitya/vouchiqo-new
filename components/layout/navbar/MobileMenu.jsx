"use client";

import {
  ChevronRight,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Store,
  Ticket,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import SafeImage from "@/components/shared/SafeImage";
import { useLenis } from "@/components/shared/SmoothScrollProvider";
import { signOut, useSession } from "@/lib/auth-client";
import LocationSelector from "../LocationSelector";
import Logo from "./Logo";

const MOBILE_NAV_LINKS = [
  { href: "/brands", icon: Store, label: "Brands" },
  { href: "/categories", icon: LayoutGrid, label: "Categories" },
  { href: "/trending", icon: TrendingUp, label: "Trending" },
  { href: "/nearby-offers", icon: MapPin, label: "Nearby Map" },
];

export const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Robust background scroll lock and Lenis stop/start when drawer is open
  useEffect(() => {
    if (isOpen) {
      lenis?.stop();
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      lenis?.start();
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    }
    return () => {
      lenis?.start();
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      }
    };
  }, [isOpen, lenis]);

  const handleSignOut = async () => {
    setIsOpen(false);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vouchiqo_is_merchant");
      }
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.replace("/");
            router.refresh();
          },
        },
      });
    } catch (err) {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const drawerContent = (
    <>
      {/* Backdrop Blur Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[99990] animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Full-Width Mobile Drawer Portaled to Body */}
      {isOpen && (
        <div
          data-lenis-prevent="true"
          className="fixed inset-0 w-full h-[100dvh] bg-[#FFFDF9] shadow-2xl z-[99999] flex flex-col animate-slide-in-right overflow-y-auto isolate max-w-[340px] sm:max-w-[360px] ml-auto border-l border-[#EADBCE] font-sans search-dropdown-scroll"
        >
          {/* Header in Brand Royal Plum with Logo */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#EADBCE] bg-[#35104A] text-[#FFF8EF] sticky top-0 z-20">
            <Logo />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-[#FFF8EF]/80 hover:text-[#FFD166] hover:bg-white/10 rounded-full transition-colors cursor-pointer bg-transparent border-0"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Location Selector (Fetched and selected inline) */}
          <div className="bg-white border-b border-[#EADBCE]">
            <LocationSelector
              inDrawer={true}
              onMobileSelect={() => setIsOpen(false)}
            />
          </div>

          {/* Navigation Links with Brand Tiles & Visual Indicators */}
          <div className="flex-1 py-3 flex flex-col bg-[#FFFDF9] font-sans">
            <div className="px-4 pb-1.5 text-[10.5px] font-heading font-semibold text-[#6B4C82] tracking-wider uppercase">
              Explore & Discover
            </div>
            {MOBILE_NAV_LINKS.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  prefetch={true}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-2.5 text-[13px] font-heading font-semibold transition-all border-b border-[#EADBCE]/40 group ${
                    isActive
                      ? "bg-[#007F79]/10 text-[#007F79] border-l-4 border-l-[#007F79]"
                      : "text-[#35104A] hover:bg-[#FFF8EF] hover:text-[#007F79]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border transition-all ${
                        isActive
                          ? "bg-[#007F79] text-white border-[#007F79] shadow-2xs"
                          : "bg-white text-[#007F79] border-[#EADBCE] group-hover:bg-[#FFF8EF] group-hover:border-[#007F79]/50"
                      }`}
                    >
                      <Icon className="h-4 w-4 stroke-[2]" />
                    </div>
                    <span>{label}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-all ${
                      isActive
                        ? "text-[#007F79]"
                        : "text-slate-300 group-hover:text-[#007F79] group-hover:translate-x-0.5"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* User Sign In / Profile Section */}
          <div className="p-4 border-t border-[#EADBCE] bg-white mt-auto font-sans">
            {session ? (
              <div className="space-y-3">
                {/* Profile menu links for mobile */}
                <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-[#EADBCE]/60">
                  <Link
                    href={
                      session.user.role === "merchant"
                        ? "/merchant/profile"
                        : "/profile"
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 text-[12px] font-heading font-semibold text-[#007F79] bg-[#007F79]/10 border border-[#007F79]/20 rounded-lg hover:bg-[#007F79]/20 transition-all"
                  >
                    <User className="h-3.5 w-3.5 text-[#007F79] shrink-0" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href={
                      session.user.role === "merchant"
                        ? "/merchant/coupons"
                        : "/customer/claimed"
                    }
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 text-[12px] font-heading font-semibold text-[#FF8C05] bg-[#FF8C05]/10 border border-[#FF8C05]/20 rounded-lg hover:bg-[#FF8C05]/20 transition-all"
                  >
                    <Ticket className="h-3.5 w-3.5 text-[#FF8C05] shrink-0" />
                    <span>My Offers</span>
                  </Link>
                </div>

                <div className="flex items-center gap-3 px-1">
                  {session.user.image ? (
                    <div className="w-9 h-9 rounded-full border-2 border-[#FFD166] p-0.5 shrink-0 shadow-2xs">
                      <SafeImage
                        src={session.user.image}
                        alt={session.user.name}
                        width={32}
                        height={32}
                        className="h-full w-full rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full border-2 border-[#FFD166] p-0.5 shrink-0 shadow-2xs flex items-center justify-center">
                      <div className="h-full w-full rounded-full bg-[#35104A] text-[#FFD166] font-heading font-bold text-xs flex items-center justify-center uppercase">
                        {session.user.name?.slice(0, 2).toUpperCase() || "U"}
                      </div>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-heading font-semibold text-[#35104A] truncate leading-tight">
                      {session.user.name}
                    </p>
                    <p className="text-[10px] text-[#6B4C82] truncate mt-0.5 font-normal">
                      {session.user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 text-[11.5px] font-heading font-semibold rounded-lg transition-colors border border-red-200/60 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#007F79] text-white hover:bg-[#006661] text-[13px] font-heading font-semibold rounded-lg transition-all shadow-xs"
              >
                <User className="h-4 w-4" />
                <span>Sign In / Join</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="lg:hidden relative shrink-0">
      {/* Burger Toggle Button: visible below lg (<1024px) */}
      <button
        onClick={() => setIsOpen(true)}
        className="p-1 sm:p-1.5 text-[#FFF8EF] hover:text-[#FFD166] transition cursor-pointer bg-transparent border-0 rounded-lg hover:bg-white/10 flex items-center justify-center"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
      </button>

      {/* Render drawer via Portal to escape all local stacking contexts */}
      {mounted && typeof document !== "undefined"
        ? createPortal(drawerContent, document.body)
        : null}
    </div>
  );
};

export default MobileMenu;
