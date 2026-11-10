import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";

const INITIAL_CAMPAIGN_DATA = {
  name: "",
  type: "flash",
  objective: "",
  description: "",
  couponIds: [],
  settings: {
    homepageSlot: false,
    pushNotification: false,
    newsletter: false,
  },
  startDate: "",
  endDate: "",
};

export default function useCampaignManager() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  // Wizard state
  const [campaignData, setCampaignData] = useState(INITIAL_CAMPAIGN_DATA);

  // Fetch merchant profile (shared hook)
  const { data: merchant, isLoading: loadingProfile } = useMerchantProfile();

  // Fetch campaigns
  const { data: campaigns = [], isLoading: loadingCampaigns } = useQuery({
    queryKey: qk.merchant.campaigns(),
    queryFn: async () => {
      const json = await apiFetch("/api/campaigns");
      return json.data || [];
    },
    enabled: merchant?.plan !== "starter",
  });

  // Fetch merchant's coupons to attach
  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: qk.merchant.couponsForCampaign(),
    queryFn: async () => {
      const json = await apiFetch("/api/coupons?limit=50");
      const list = json.data?.coupons || [];
      return list.filter(
        (c) =>
          c.merchantId?._id === merchant._id || c.merchantId === merchant._id,
      );
    },
    enabled: !!merchant && merchant?.plan !== "starter" && isCreating,
  });

  const mutation = useMutation({
    mutationFn: async (payload) =>
      apiFetch("/api/campaigns", { method: "POST", body: payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.merchant.campaigns() });
      toast.success("Campaign created and launched!");
      setIsCreating(false);
      setWizardStep(1);
      setCampaignData(INITIAL_CAMPAIGN_DATA);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong.");
    },
  });

  const handleNext = () => setWizardStep((prev) => Math.min(prev + 1, 4));
  const handleBack = () => setWizardStep((prev) => Math.max(prev - 1, 1));

  const toggleCouponAttachment = (couponId) => {
    setCampaignData((prev) => {
      const exists = prev.couponIds.includes(couponId);
      const update = exists
        ? prev.couponIds.filter((id) => id !== couponId)
        : [...prev.couponIds, couponId];
      return { ...prev, couponIds: update };
    });
  };

  const updateField = (field, value) => {
    setCampaignData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateSubmit = (status = "live") => {
    if (!campaignData.name) {
      toast.error("Campaign name is required");
      return;
    }
    mutation.mutate({ ...campaignData, status });
  };

  return {
    merchant,
    campaigns,
    coupons,
    loadingProfile,
    loadingCampaigns,
    loadingCoupons,
    isCreating,
    setIsCreating,
    wizardStep,
    setWizardStep,
    campaignData,
    updateField,
    startOpen,
    setStartOpen,
    endOpen,
    setEndOpen,
    handleBack,
    handleNext,
    handleCreateSubmit,
    isPending: mutation.isPending,
  };
}
