"use client";

import { useAdminMerchants, useReviewMerchant } from "@/hooks/use-admin";

export default function useMerchantApprovals() {
  const { data: merchants = [], isLoading: loading } = useAdminMerchants({
    status: "pending",
  });
  const reviewMutation = useReviewMerchant();

  const handleAction = async (merchantId, action) => {
    const status = action === "approve" ? "approved" : "rejected";
    return reviewMutation.mutateAsync({ merchantId, status });
  };

  return {
    merchants,
    loading,
    handleAction,
  };
}
