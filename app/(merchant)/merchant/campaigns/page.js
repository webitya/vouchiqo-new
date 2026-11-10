"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import DeleteConfirmDialog from "@/components/shared/modals/DeleteConfirmDialog";
import { useMerchantCampaigns, useMerchantProfile } from "@/hooks/use-merchant";
import { useRealtime } from "@/hooks/use-realtime";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { showError, showSuccess } from "@/lib/toast";
import CampaignListGrid from "./components/CampaignListGrid";
import CampaignReportModal from "./components/CampaignReportModal";
import CampaignsHeader from "./components/CampaignsHeader";
import EditCampaignModal from "./components/EditCampaignModal";
import FlashSalePurchaseModal from "./components/FlashSalePurchaseModal";

export default function MerchantCampaigns() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal States
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Flash Sale Purchase Modal State
  const [flashSaleModalOpen, setFlashSaleModalOpen] = useState(false);

  // Fetch merchant profile & real-time merchant campaigns via cached hooks
  const { data: merchant, isLoading: loadingProfile } = useMerchantProfile();
  const { data: dbCampaigns = [], isLoading: loadingCampaigns } = useMerchantCampaigns();

  // Check if free / starter merchant
  const isFreeMerchant = useMemo(() => {
    if (!merchant) return false;
    const p = String(merchant.plan || "starter").toLowerCase();
    return p === "starter" || p.includes("starter") || p.includes("free");
  }, [merchant]);

  const flashSalePurchased = !!merchant?.flashSalePurchased;
  const flashSaleCampaignUsed = !!merchant?.flashSaleCampaignUsed;
  const hasUsedCampaign = flashSaleCampaignUsed || dbCampaigns.length >= 1;

  // Auto-prompt catchy popup modal on first visit for free merchants who haven't availed yet
  useEffect(() => {
    if (
      isFreeMerchant &&
      !flashSalePurchased &&
      !hasUsedCampaign &&
      !loadingProfile
    ) {
      const shownKey = `vouchiqo_fs_popup_shown_${merchant?._id || "free"}`;
      const alreadyShown = sessionStorage.getItem(shownKey);
      if (!alreadyShown) {
        const timer = setTimeout(() => {
          setFlashSaleModalOpen(true);
          sessionStorage.setItem(shownKey, "true");
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [
    isFreeMerchant,
    flashSalePurchased,
    hasUsedCampaign,
    loadingProfile,
    merchant?._id,
  ]);

  // Listen for real-time campaign status changes from admin moderation
  useRealtime(SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, (data) => {
    if (data?.campaignId) {
      queryClient.setQueryData(["merchant-campaigns"], (old) => {
        if (!Array.isArray(old)) return old;
        return old.map((c) =>
          c._id === data.campaignId || c.id === data.campaignId
            ? {
                ...c,
                status: data.status,
                rejectionReason: data.rejectionReason,
              }
            : c,
        );
      });
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
    }
  });

  const handleCreateClick = useCallback(() => {
    if (isFreeMerchant) {
      // If already used their 1 allowed campaign
      if (hasUsedCampaign) {
        toast(
          (t) => (
            <div className="flex flex-col gap-1.5 text-xs text-slate-800 font-sans">
              <span className="font-bold text-slate-900">
                1-Time Campaign Limit Reached
              </span>
              <span className="text-slate-600 leading-relaxed">
                Free merchants can avail 1 Flash Sale campaign. To run
                year-round Festival, Loyalty, and Seasonal campaigns, upgrade to
                Growth Plan!
              </span>
              <button
                type="button"
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push("/merchant/billing");
                }}
                className="mt-1 bg-[#F72853] hover:bg-[#e01e47] text-white px-3 py-1.5 rounded-lg text-xs font-semibold self-start cursor-pointer transition-all"
              >
                Upgrade Plan
              </button>
            </div>
          ),
          { duration: 7000 },
        );
        return;
      }

      // If free merchant hasn't purchased the pass yet
      if (!flashSalePurchased) {
        setFlashSaleModalOpen(true);
        return;
      }
    }

    router.push("/merchant/campaigns/new");
  }, [isFreeMerchant, hasUsedCampaign, flashSalePurchased, router]);

  const handleEditClick = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setEditModalOpen(true);
  }, []);

  const handleDuplicateClick = useCallback(() => {
    handleCreateClick();
  }, [handleCreateClick]);

  const handleReportClick = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setReportModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((campaign) => {
    setSelectedCampaign(campaign);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedCampaign?._id) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/campaigns?id=${selectedCampaign._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete campaign");
      showSuccess("Campaign deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
      setDeleteModalOpen(false);
    } catch (err) {
      showError(err.message || "Failed to delete campaign");
    } finally {
      setDeleting(false);
    }
  }, [selectedCampaign, queryClient]);

  const isPro = useMemo(
    () => merchant?.plan === "pro" || merchant?.plan === "enterprise",
    [merchant],
  );

  if (loadingProfile || loadingCampaigns) {
    return (
      <DashboardLayout title="Campaign Manager" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Campaign Manager"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-4 text-left font-sans">
        <CampaignsHeader
          campaignsCount={dbCampaigns.length}
          isPro={isPro}
          isFreeMerchant={isFreeMerchant}
          flashSalePurchased={flashSalePurchased}
          flashSaleCampaignUsed={flashSaleCampaignUsed}
          planName={merchant?.plan}
          onCreateClick={handleCreateClick}
          onOpenPurchaseModal={() => setFlashSaleModalOpen(true)}
        />

        <div data-tour="campaigns-list">
          <CampaignListGrid
            campaigns={dbCampaigns}
            onCreateClick={handleCreateClick}
            onEdit={handleEditClick}
            onDuplicate={handleDuplicateClick}
            onReport={handleReportClick}
            onDelete={handleDeleteClick}
          />
        </div>
      </div>

      {/* Catchy 1-Time Flash Sale Campaign Purchase Modal */}
      <FlashSalePurchaseModal
        isOpen={flashSaleModalOpen}
        onClose={() => setFlashSaleModalOpen(false)}
        onPurchasedSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
          queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
        }}
      />

      {/* Edit Campaign Modal */}
      <EditCampaignModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        campaign={selectedCampaign}
        onSaveSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["merchant-campaigns"] });
        }}
      />

      {/* Campaign Analytics Report Modal */}
      <CampaignReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        campaign={selectedCampaign}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${selectedCampaign?.name}"? This action cannot be undone.`}
        isPending={deleting}
      />
    </DashboardLayout>
  );
}
