"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";

/**
 * Invalidate every cache key touched when a merchant's coupons change.
 * Keeps the previously copy-pasted invalidation trio in one place.
 */
function invalidateCouponCaches(queryClient, id) {
  queryClient.invalidateQueries({ queryKey: qk.coupons.all() });
  // Merchant list key â€” invalidate without the merchantId arg so all variants refresh.
  queryClient.invalidateQueries({ queryKey: ["merchant-coupons"] });
  if (id) {
    queryClient.invalidateQueries({ queryKey: qk.merchant.coupon(id) });
  }
}

/**
 * Fetch the list of coupons belonging to a merchant.
 * @param {string} merchantId - the merchant's _id (query disabled until present)
 */
export function useMerchantCoupons(merchantId) {
  return useQuery({
    queryKey: qk.merchant.coupons(merchantId),
    enabled: !!merchantId,
    queryFn: async () => {
      const json = await apiFetch(
        `/api/coupons?merchantId=${merchantId}&isMerchantSelf=true&allDates=true`,
      );
      return json.data?.coupons || [];
    },
    staleTime: 30_000, // real-time updates handled by socket invalidation
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch a single coupon by id (edit page).
 * @param {string} id
 */
export function useCoupon(id) {
  return useQuery({
    queryKey: qk.merchant.coupon(id),
    enabled: !!id,
    queryFn: async () => {
      const json = await apiFetch(`/api/coupons/${id}`);
      return json.data;
    },
  });
}

/**
 * Create a new coupon. Requires a merchant profile to exist.
 * @param {object} merchant - the current merchant (must have `_id`)
 */
export function useCreateCoupon(merchant) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      if (!merchant?._id) {
        throw new Error("You must have a business profile to list offers.");
      }
      return apiFetch("/api/coupons", { method: "POST", body: payload });
    },
    onSuccess: () => {
      invalidateCouponCaches(queryClient);
      toast.success("Listing created successfully!");
    },
    onError: (err) =>
      toast.error(err.message || "An unexpected error occurred."),
  });
}

/**
 * Update an existing coupon.
 * @param {string} id - the coupon id
 */
export function useUpdateCoupon(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) =>
      apiFetch(`/api/coupons/${id}`, { method: "PUT", body: payload }),
    onSuccess: () => {
      invalidateCouponCaches(queryClient, id);
      toast.success("Offer listing updated successfully!");
    },
    onError: (err) => toast.error(err.message || "Failed to update listing."),
  });
}

/**
 * Delete a coupon.
 */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (couponId) =>
      apiFetch(`/api/coupons/${couponId}`, { method: "DELETE" }),
    onSuccess: () => {
      invalidateCouponCaches(queryClient);
      toast.success("Coupon deleted successfully.");
    },
    onError: (err) => toast.error(err.message || "Failed to delete coupon."),
  });
}

/**
 * Validate a coupon expiry date. Returns true if valid, false (after
 * toasting) if not. Consolidates the duplicated check in coupons/new and
 * coupons/[id].
 * @param {string} expiresAt - ISO date string from the form
 * @returns {boolean}
 */
export function validateExpiryDate(expiresAt) {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) {
    toast.error("Please enter a valid expiry date.");
    return false;
  }
  if (date <= new Date()) {
    toast.error("Expiry date must be in the future.");
    return false;
  }
  return true;
}

/**
 * Fetch public banners with client-side caching.
 */
export function usePublicBanners(initialData = []) {
  return useQuery({
    queryKey: ["public-banners"],
    queryFn: async () => {
      const json = await apiFetch("/api/banners");
      return json?.data || [];
    },
    initialData:
      initialData && initialData.length > 0 ? initialData : undefined,
    initialDataUpdatedAt:
      initialData && initialData.length > 0 ? () => Date.now() : undefined,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
