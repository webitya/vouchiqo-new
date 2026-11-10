"use client";

import {
  AlertCircle,
  BarChart2,
  Bell,
  Bookmark,
  Building2,
  CheckSquare,
  ChevronRight,
  Clock,
  CreditCard,
  History,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  Mail,
  Megaphone,
  Percent,
  PlusCircle,
  Settings,
  Sliders,
  Store,
  Tag,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function Sidebar({ role = "customer" }) {
  const pathname = usePathname();
  const router = useRouter();

  const getLinks = () => {
    switch (role) {
      case "admin":
        return [
          { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
          { name: "Merchant Management", href: "/admin/merchants", icon: Store },
          { name: "Commission Rates", href: "/admin/commission-rates", icon: Percent },
          { name: "Merchant Plans & Pricing", href: "/admin/plans", icon: CreditCard },
          { name: "Offer Verification Queue", href: "/admin/offers", icon: CheckSquare },
          { name: "Campaign Review Queue", href: "/admin/campaigns/queue", icon: Megaphone },
          { name: "Campaign Calendar", href: "/admin/campaigns/calendar", icon: Clock },
          { name: "Live Campaign Monitoring", href: "/admin/campaigns/live", icon: TrendingUp },
          { name: "Campaign Analytics", href: "/admin/campaigns/analytics", icon: BarChart2 },
          { name: "Campaign Revenue", href: "/admin/campaigns/revenue", icon: CreditCard },
          { name: "Festival Package Wizard", href: "/admin/campaigns/festival-wizard", icon: Zap },
          { name: "Email Blast Builder", href: "/admin/campaigns/email-blast-builder", icon: Mail },
          { name: "Push Notification Builder", href: "/admin/campaigns/push-builder", icon: Bell },
          { name: "Merchant Demand Report", href: "/admin/merchant-demand", icon: Building2 },
          { name: "Master Revival Queue", href: "/admin/revivals", icon: AlertCircle },
          { name: "User Management", href: "/admin/users", icon: Users },
          { name: "Featured Deals", href: "/admin/featured", icon: Tag },
          { name: "Homepage Banners", href: "/admin/banners", icon: Sliders },
          { name: "Platform Revenue", href: "/admin/revenue", icon: CreditCard },
        ];
      case "merchant":
        return [
          { name: "Dashboard", href: "/merchant/dashboard", icon: LayoutDashboard },
          { name: "My Listings", href: "/merchant/coupons", icon: Tag },
          { name: "Post New Listing", href: "/merchant/coupons/new", icon: PlusCircle },
          { name: "Campaigns", href: "/merchant/campaigns", icon: Megaphone },
          { name: "Create Campaign", href: "/merchant/campaigns/new", icon: PlusCircle },
          { name: "Revival Queue", href: "/merchant/revivals", icon: AlertCircle },
          { name: "Analytics", href: "/merchant/analytics", icon: TrendingUp },
          { name: "Business Profile", href: "/merchant/profile", icon: Store },
          { name: "Billing & Plans", href: "/merchant/billing", icon: CreditCard },
          { name: "Affiliates", href: "/merchant/affiliates", icon: LinkIcon },
          { name: "Notifications", href: "/merchant/notifications", icon: Bell },
          { name: "Account Settings", href: "/merchant/settings", icon: Settings },
        ];
      default:
        return [
          {
            name: "Dashboard",
            href: "/customer/dashboard",
            icon: LayoutDashboard,
          },
          {
            name: "Savings Dashboard",
            href: "/customer/savings",
            icon: TrendingUp,
          },
          { name: "Saved Offers", href: "/customer/saved", icon: Bookmark },
          { name: "Claimed Offers", href: "/customer/claimed", icon: History },
          { name: "Followed Brands", href: "/customer/brands", icon: Store },
          { name: "Settings", href: "/profile/settings", icon: Settings },
        ];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-brand-navy text-slate-300 min-h-screen flex flex-col border-r border-white/10 hidden md:flex flex-shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex flex-col">
          <span className="text-xl font-bold font-heading text-white tracking-tight flex items-center gap-1.5">
            <span className="text-brand-gradient">Vouchiqo</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            {role.toUpperCase()} CONSOLE
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                isActive
                  ? "bg-[#e85d04] text-white shadow-xs"
                  : "text-slate-300 hover:bg-white/10 hover:text-white font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}
                />
                <span>{link.name}</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 opacity-0 transition-opacity ${isActive ? "opacity-100" : "group-hover:opacity-50"}`}
              />
            </Link>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="p-4 border-t border-white/10">
        <Button
          onClick={async () => {
            try {
              if (typeof window !== "undefined") {
                sessionStorage.removeItem("vouchiqo_is_merchant");
              }
              await signOut();
            } catch (e) {
              console.error("Sign out error:", e);
            }
            router.replace("/");
          }}
          variant="ghost"
          className="flex items-center justify-start gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer h-auto border-0 bg-transparent shadow-none"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
