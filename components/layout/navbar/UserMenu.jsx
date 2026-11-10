"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Store,
  Ticket,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import LocationPromptModal from "@/components/shared/modals/LocationPromptModal";
import SafeImage from "@/components/shared/SafeImage";
import { OnboardingModal } from "@/features/auth/components/onboarding-modal";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { signOut, useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/fetcher";

export const UserMenu = () => {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: merchantProfile } = useMerchantProfile({
    enabled: !!session?.user,
  });

  const effectiveRole = useMemo(() => {
    if (!session?.user) return null;
    const sessionRole = session.user.role || "customer";
    if (sessionRole === "admin" || sessionRole === "merchant")
      return sessionRole;
    if (merchantProfile) return "merchant";
    return "customer";
  }, [session?.user, merchantProfile]);

  const { data: userData } = useQuery({
    queryKey: ["user-customer-profile", session?.user?.id],
    enabled: !!session?.user && effectiveRole === "customer",
    queryFn: async () => {
      const json = await apiFetch("/api/users");
      return json?.data || null;
    },
    staleTime: 60_000,
  });

  const userProfile = userData?.profile || null;

  useEffect(() => {
    if (!userProfile || !session?.user) return;
    const storageKey = `vouchiqo_onboarded_${session.user.id}`;
    const hasGender = !!userProfile?.gender;
    const hasInterests =
      Array.isArray(userProfile?.interests) &&
      userProfile.interests.length >= 2;
    if (userProfile?.isOnboarded && hasGender && hasInterests) {
      localStorage.setItem(storageKey, "true");
    } else {
      setShowOnboarding(true);
    }
  }, [userProfile, session?.user]);

  useEffect(() => {
    if (!mounted) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mounted]);

  const handleSignOut = async (e) => {
    e.preventDefault();
    setOpen(false);
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vouchiqo_is_merchant");
        sessionStorage.removeItem("vouchiqo_is_not_merchant");
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

  // SSR hydration guard: During SSR and initial client hydration before mount,
  // session data may not be available on the server while available on client (or vice versa).
  // A consistent placeholder prevents React hydration mismatches.
  if (!mounted) {
    return (
      <div
        suppressHydrationWarning
        className="h-9 w-[76px] shrink-0"
        aria-hidden="true"
      />
    );
  }

  // Guest State: If not logged in, render the Login button
  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="h-9 text-[13px] font-semibold bg-[#2563eb] text-white hover:bg-[#1d4ed8] rounded-lg px-4 flex items-center justify-center gap-1.5 whitespace-nowrap transition-all duration-200 hover:shadow-sm shrink-0"
      >
        <User className="h-3.5 w-3.5" />
        Login
      </Link>
    );
  }

  const role = effectiveRole ?? session.user.role ?? "customer";
  const isAdmin = role === "admin";
  const isMerchant = role === "merchant";

  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return [
          {
            icon: LayoutDashboard,
            label: "Admin Dashboard",
            href: "/admin/dashboard",
          },
          { icon: Users, label: "Manage Users", href: "/admin/users" },
          {
            icon: Store,
            label: "Manage Merchants",
            href: "/admin/approvals/merchants",
          },
        ];
      case "merchant":
        return [
          {
            icon: LayoutDashboard,
            label: "Merchant Dashboard",
            href: "/merchant/dashboard",
          },
          {
            icon: Store,
            label: "Application Status",
            href: "/merchant/application-status",
          },
          { icon: Ticket, label: "Manage Offers", href: "/merchant/coupons" },
          { icon: User, label: "My Profile", href: "/merchant/profile" },
        ];
      default:
        return [
          { icon: User, label: "My Profile", href: "/profile" },
          { icon: Ticket, label: "My Offers", href: "/customer/claimed" },
        ];
    }
  };

  const menuItems = getMenuItems();

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const renderNavAvatar = () => {
    if (session.user.image) {
      return (
        <SafeImage
          src={session.user.image}
          alt={session.user.name || "User profile"}
          width={28}
          height={28}
          className="h-7 w-7 rounded-full object-cover shadow-2xs border border-slate-200"
        />
      );
    }
    const initials = getInitials(session.user.name);
    const avatarClass = isAdmin
      ? "bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white border-purple-200"
      : isMerchant
        ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-blue-200"
        : "bg-slate-100 text-slate-800 border-slate-200";
    return (
      <div
        className={`h-7 w-7 rounded-full font-bold text-[11px] flex items-center justify-center uppercase border shadow-2xs ${avatarClass}`}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`rounded-full transition-all focus:outline-none cursor-pointer flex items-center justify-center p-0.5 border-2 ${
          open
            ? "border-[#2563eb] bg-[#eff6ff]"
            : "border-transparent hover:border-gray-200"
        }`}
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {renderNavAvatar()}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 overflow-hidden text-left">
          <div className="px-4 py-2.5 border-b border-slate-100 bg-[#f8fafc]">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-[12px] font-bold text-slate-900 truncate">
                {isAdmin ? "Super Admin" : session.user.name || "Member"}
              </p>
              {isAdmin ? (
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-purple-50 text-purple-700 border border-purple-200/80 inline-flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-purple-600" /> ADMIN
                </span>
              ) : isMerchant ? (
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0 bg-blue-50 text-blue-700 border border-blue-200/80 inline-flex items-center gap-1">
                  <Store className="w-2.5 h-2.5 text-blue-600" /> MERCHANT
                </span>
              ) : (
                <span className="text-[8.5px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                  <User className="w-2.5 h-2.5 text-slate-500" /> MEMBER
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold truncate">
              {session.user.email}
            </p>
          </div>

          {menuItems.map(({ icon: Icon, label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-[#eff6ff] hover:text-[#2563eb] transition-colors"
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}

          <button
            onClick={handleSignOut}
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors border-0 bg-transparent cursor-pointer text-left"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          initialGender={userProfile?.gender || ""}
          initialInterests={userProfile?.interests || []}
          onSaveComplete={() => {
            setShowOnboarding(false);
            if (session?.user?.id) {
              localStorage.setItem(
                `vouchiqo_onboarded_${session.user.id}`,
                "true",
              );
            }
          }}
        />
      )}

      {mounted && <LocationPromptModal />}
    </div>
  );
};

export default UserMenu;
