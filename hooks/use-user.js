"use client";

import { useRouter } from "next/navigation";
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

