"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Bookmark,
  CheckCircle2,
  Gift,
  History,
  IndianRupee,
  RefreshCw,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";

const ROLE_HOME = {
  admin: "/admin/dashboard",
  merchant: "/merchant/dashboard",
  customer: "/", // customers land on the homepage
};

/**
 * Central user hook — use this anywhere in the app instead of useSession.
 *
 * Returns:
 *  - user        → the current user object (null if not logged in)
 *  - role        → "customer" | "merchant" | "admin"
 *  - isLoaded    → true once session has been resolved
 *  - isLoggedIn  → shorthand for !!user
 *  - logout()    → signs out and redirects to /auth/login
 *  - homeRoute   → the right dashboard route for this user's role
 */
export function useUser() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const user = session?.user ?? null;
  const role = user?.role ?? "customer";

  async function logout() {
    try {
      // Clear any merchant session flags so redirect guards don't fire after logout
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("vouchiqo_is_merchant");
        sessionStorage.removeItem("vouchiqo_is_not_merchant");
      }
      await signOut();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    router.push("/");
  }

  return {
    user,
    role,
    isLoaded: !isPending,
    isLoggedIn: !!user,
    logout,
    homeRoute: ROLE_HOME[role] ?? "/",
  };
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";

/**
 * Fetch customer redemptions history with caching.
 */
export function useUserRedemptions() {
  return useQuery({
    queryKey: qk.user.redemptions(),
    queryFn: async () => {
      const json = await apiFetch("/api/redemptions");
      return json?.data?.redemptions || [];
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch customer aggregated savings data.
 */
export function useUserSavings() {
  return useQuery({
    queryKey: qk.user.savings(),
    queryFn: async () => {
      const json = await apiFetch("/api/users/savings");
      return json?.data || null;
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch customer claims (e.g. status: "active").
 */
export function useUserClaims(status = "active", options = {}) {
  return useQuery({
    queryKey: qk.user.claims(status),
    queryFn: async () => {
      try {
        const json = await apiFetch(`/api/claims?status=${status}`);
        return json?.data?.claims || [];
      } catch {
        return [];
      }
    },
    staleTime: 30_000,
    ...options,
  });
}

/**
 * Fetch customer revival stats.
 */
export function useCustomerRevivalStats() {
  return useQuery({
    queryKey: qk.user.revivals(),
    queryFn: async () => {
      const json = await apiFetch("/api/revivals/customer");
      return json?.data || null;
    },
    staleTime: 30_000,
  });
}

/**
 * Fetch customer profile and preferences.
 */
export function useUserProfile() {
  return useQuery({
    queryKey: qk.user.profile(),
    queryFn: async () => {
      const json = await apiFetch("/api/users");
      return json?.data || null;
    },
    staleTime: 60_000,
  });
}

/**
 * Update customer profile and preferences.
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      return apiFetch("/api/users", {
        method: "PUT",
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.user.profile() });
      toast.success("Profile saved!");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update profile.");
    },
  });
}

/**
 * Delete a saved claim (bookmark).
 */
export function useDeleteClaim() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (claimId) => {
      return apiFetch(`/api/claims/${claimId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.user.claims("active") });
      toast.success("Bookmark removed.");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove bookmark.");
    },
  });
}

/**
 * Format timestamp into readable relative time ("2m ago", "1 day ago", "Oct 12")
 */
export function formatRelativeTime(dateInput) {
  if (!dateInput) return "Recently";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay === 1) return "1 day ago";
  if (diffDay < 30) return `${diffDay} days ago`;
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Comprehensive customer activity hook.
 * Combines claims, redemptions, savings milestones, revival votes, and account events.
 */
export function useUserActivities() {
  const { user: authUser } = useUser();
  const { data: claimsData = [], isLoading: loadingClaims } = useUserClaims("all");
  const { data: redemptionsData = [], isLoading: loadingRedemptions } = useUserRedemptions();
  const { data: savingsData, isLoading: loadingSavings } = useUserSavings();
  const { data: revivalsData, isLoading: loadingRevivals } = useCustomerRevivalStats();

  const activities = useMemo(() => {
    const list = [];
    const seenRedemptionIds = new Set();

    // 1. Redemptions from Redemption collection
    if (Array.isArray(redemptionsData)) {
      for (const red of redemptionsData) {
        const coupon = red.couponId || {};
        const merchant = red.merchantId || coupon.merchantId || {};
        const brandName =
          (typeof merchant === "object" ? merchant.businessName || merchant.name : null) ||
          coupon.brand ||
          "Partner Store";

        seenRedemptionIds.add(String(red._id));
        if (coupon._id) seenRedemptionIds.add(String(coupon._id));

        list.push({
          id: `red-${red._id}`,
          type: "redemption",
          category: "redemption",
          title: `Redeemed ${brandName} offer`,
          description: `Saved ₹${red.savingsAmount || 0} on ${coupon.title || "verified offer"}${red.couponCode ? ` using code ${red.couponCode}` : ""}.`,
          time: formatRelativeTime(red.createdAt),
          timestamp: red.createdAt ? new Date(red.createdAt).getTime() : Date.now(),
          icon: CheckCircle2,
          badgeColor: "bg-[#007F79]",
          couponId: coupon._id,
        });
      }
    }

    // 2. Redemptions from savings analytics
    if (savingsData?.recentTransactions && Array.isArray(savingsData.recentTransactions)) {
      for (const tx of savingsData.recentTransactions) {
        const txId = String(tx._id || tx.id || "");
        if (txId && seenRedemptionIds.has(txId)) continue;
        list.push({
          id: `tx-${txId || Math.random()}`,
          type: "redemption",
          category: "redemption",
          title: `Redeemed at ${tx.brand}`,
          description: `Saved ${tx.amountSaved} on ${tx.category || "Dining"}${tx.code ? ` using code ${tx.code}` : ""}.`,
          time: tx.date || "Recently",
          timestamp: tx.createdAt ? new Date(tx.createdAt).getTime() : Date.now(),
          icon: IndianRupee,
          badgeColor: "bg-[#007F79]",
        });
      }
    }

    // 3. Claims from user claims
    if (Array.isArray(claimsData)) {
      for (const claim of claimsData) {
        const coupon = claim.couponId || {};
        const merchant = coupon.merchantId || {};
        const brandName =
          (typeof merchant === "object" ? merchant.businessName || merchant.name : null) ||
          coupon.brand ||
          "Partner Brand";
        const discountText =
          coupon.discountType === "percentage"
            ? `${coupon.discountValue}% OFF`
            : coupon.discountValue
              ? `₹${coupon.discountValue} OFF`
              : "Special Offer";

        const isRedeemed = claim.status === "redeemed";
        if (isRedeemed && (seenRedemptionIds.has(String(claim._id)) || seenRedemptionIds.has(String(coupon._id)))) {
          continue;
        }

        list.push({
          id: `claim-${claim._id}`,
          type: isRedeemed ? "redemption" : "claim",
          category: isRedeemed ? "redemption" : "claim",
          title: isRedeemed
            ? `Redeemed ${brandName} offer`
            : `Claimed ${brandName} voucher`,
          description: coupon.title
            ? `${discountText} - ${coupon.title}`
            : `Saved exclusive ${discountText} coupon code for store redemption.`,
          time: formatRelativeTime(claim.createdAt || claim.updatedAt),
          timestamp: claim.createdAt
            ? new Date(claim.createdAt).getTime()
            : Date.now(),
          icon: isRedeemed ? CheckCircle2 : Ticket,
          badgeColor: isRedeemed ? "bg-[#007F79]" : "bg-[#35104A]",
          claimId: claim._id,
          couponId: coupon._id,
        });
      }
    }

    // 4. Revival requests / votes
    if (revivalsData?.requests && Array.isArray(revivalsData.requests)) {
      for (const r of revivalsData.requests) {
        list.push({
          id: `revival-${r._id}`,
          type: "revival",
          category: "revival",
          title: `Voted to revive ${r.brandName || "brand"} offer`,
          description: `Requested revival for ${r.discountValue ? `${r.discountValue}%` : "expired"} coupon at ${r.brandName || "store"}.`,
          time: formatRelativeTime(r.createdAt),
          timestamp: r.createdAt ? new Date(r.createdAt).getTime() : Date.now(),
          icon: RefreshCw,
          badgeColor: "bg-[#FF8C05]",
        });
      }
    }

    // 5. Milestone savings achieved
    if (savingsData?.milestones && Array.isArray(savingsData.milestones)) {
      for (const m of savingsData.milestones) {
        if (m.achieved && m.achievedAt) {
          list.push({
            id: `milestone-${m.id}`,
            type: "milestone",
            category: "milestone",
            title: `Savings Milestone: ${m.title}`,
            description: `Unlocked ${m.title} in total verified coupon redemptions.`,
            time: formatRelativeTime(m.achievedAt),
            timestamp: new Date(m.achievedAt).getTime(),
            icon: Gift,
            badgeColor: "bg-[#007F79]",
          });
        }
      }
    }

    // 6. Account creation activity
    if (authUser?.createdAt) {
      list.push({
        id: "account-created",
        type: "account",
        category: "account",
        title: "Joined Vouchiqo Community",
        description: "Registered account to track savings, claim verified coupons, and access exclusive partner discounts.",
        time: formatRelativeTime(authUser.createdAt),
        timestamp: new Date(authUser.createdAt).getTime(),
        icon: ShieldCheck,
        badgeColor: "bg-[#35104A]",
      });
    }

    // Sort by timestamp descending
    list.sort((a, b) => b.timestamp - a.timestamp);

    // If still empty (new account with 0 activities yet):
    if (list.length === 0) {
      const name = authUser?.name ? authUser.name.split(" ")[0] : "Member";
      return [
        {
          id: "welcome-init",
          type: "account",
          category: "account",
          title: `Welcome to Vouchiqo, ${name}!`,
          description: "Your personalized savings hub is ready. Start exploring coupons and claim your first deal.",
          time: "Just now",
          timestamp: Date.now(),
          icon: ShieldCheck,
          badgeColor: "bg-[#007F79]",
        },
        {
          id: "preferences-init",
          type: "account",
          category: "account",
          title: "Profile Preferences Active",
          description: "Shopping categories and local deal notifications are configured for your account.",
          time: "Recently",
          timestamp: Date.now() - 3600000,
          icon: Bookmark,
          badgeColor: "bg-[#35104A]",
        },
      ];
    }

    return list;
  }, [claimsData, redemptionsData, savingsData, revivalsData, authUser]);

  return {
    activities,
    isLoading: loadingClaims || loadingRedemptions || loadingSavings || loadingRevivals,
  };
}

