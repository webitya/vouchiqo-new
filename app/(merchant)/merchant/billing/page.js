"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardSkeleton from "@/components/shared/feedback/DashboardSkeleton";
import { useMerchantProfile } from "@/hooks/use-merchant";
import { apiFetch } from "@/lib/fetcher";
import BillingHistoryTable from "./components/BillingHistoryTable";
import CheckoutModal from "./components/CheckoutModal";
import CurrentPlanCard from "./components/CurrentPlanCard";
import PlanComparisonGrid from "./components/PlanComparisonGrid";

export default function MerchantSubscription() {
  const queryClient = useQueryClient();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedAddOn, setSelectedAddOn] = useState(null);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [gstin, setGstin] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay_upi");
  const [isRazorpayLoading, setIsRazorpayLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 1. Fetch live merchant profile from DB
  const {
    data: merchant,
    isLoading: isLoadingMerchant,
    refetch: refetchMerchant,
  } = useMerchantProfile({ staleTime: 0, refetchOnWindowFocus: true });

  // 2. Fetch live coupons from DB to calculate active listings count
  const { data: coupons = [] } = useQuery({
    queryKey: ["merchant-coupons-count"],
    queryFn: async () => {
      const json = await apiFetch("/api/coupons?merchant=me");
      return json.data?.coupons || (Array.isArray(json.data) ? json.data : []);
    },
  });

  // 3. Fetch live campaigns from DB to calculate campaigns used count
  const { data: campaigns = [] } = useQuery({
    queryKey: ["merchant-campaigns-count"],
    queryFn: async () => {
      const json = await apiFetch("/api/campaigns");
      return Array.isArray(json.data) ? json.data : [];
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (payload) =>
      apiFetch("/api/merchants/me/upgrade", {
        method: "POST",
        body: payload,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchant-profile"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-coupons-count"] });
      queryClient.invalidateQueries({ queryKey: ["merchant-campaigns-count"] });
      toast.success(
        selectedPlan
          ? `Upgraded to ${selectedPlan.name} successfully!`
          : "Add-on purchased successfully!",
      );
      setCheckoutStep(3);
    },
    onError: (err) => {
      toast.error(err.message || "Payment simulation failed.");
    },
  });

  // 4. Fetch live settings from DB for merchant plans
  const { data: plansData, isLoading: isLoadingPlans } = useQuery({
    queryKey: ["public-plans"],
    queryFn: async () => {
      const json = await apiFetch("/api/plans");
      return json?.data?.plans || json?.plans || null;
    },
  });

  const plans = useMemo(() => {
    if (Array.isArray(plansData) && plansData.length > 0) {
      return plansData
        .filter((p) => p.active !== false)
        .map((p) => {
          const numPrice =
            typeof p.priceMonthly === "number"
              ? p.priceMonthly
              : Number(p.priceText?.replace(/[^0-9]/g, "")) || 0;
          const numYearly =
            typeof p.priceYearly === "number" ? p.priceYearly : numPrice * 10;
          return {
            id: p.id,
            name: p.name,
            badge: p.badge || "",
            priceMonthly: numPrice,
            priceYearly: numYearly,
            priceText:
              p.priceText ||
              (numPrice === 0 ? "₹0" : `₹${numPrice.toLocaleString("en-IN")}`),
            originalPrice: p.originalPrice || "",
            priceSuffix: p.priceSuffix || "/ month",
            buttonText: p.buttonText || "Select Plan",
            footerNote: p.footerNote || "",
            theme: p.theme || "blue",
            popular:
              p.badge?.toLowerCase().includes("popular") || p.theme === "amber",
            bestValue:
              p.badge?.toLowerCase().includes("best") || p.theme === "indigo",
            desc: p.subCaption || p.desc || "",
            features: p.features || [],
          };
        });
    }

    return [];
  }, [plansData]);

  const currentPlanId = merchant?.plan || "starter";
  const planExpiry = merchant?.planExpiry;
  const revivalCredits = merchant?.revivalCredits || 0;

  // Live calculated metrics from DB documents
  const activeListingsCount = useMemo(() => {
    if (coupons.length > 0) {
      return coupons.filter((c) => c.status === "active").length;
    }
    return merchant?.totalCoupons || 0;
  }, [coupons, merchant]);

  const campaignsUsedCount = useMemo(() => {
    return campaigns.length;
  }, [campaigns]);

  const planListingsLimit =
    currentPlanId === "starter" ? 3 : currentPlanId === "growth" ? 15 : 999;
  const planCampaignsLimit =
    currentPlanId === "starter" ? 0 : currentPlanId === "growth" ? 1 : 4;

  // 5. Fetch live payment history from /api/payments
  const { data: paymentHistoryData, refetch: refetchPaymentHistory } = useQuery(
    {
      queryKey: ["merchant-payment-history"],
      queryFn: async () => {
        const json = await apiFetch("/api/payments");
        return json.data;
      },
      staleTime: 0,
      refetchOnWindowFocus: true,
    },
  );

  // Live real-time invoice history fetched directly from MongoDB via /api/payments
  const invoices = useMemo(() => {
    if (
      !paymentHistoryData?.payments ||
      paymentHistoryData.payments.length === 0
    ) {
      return [];
    }

    return paymentHistoryData.payments.map((p, idx) => {
      const d = new Date(p.createdAt || p.paidAt || Date.now());
      const monthStr = d.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
      const invId = p.gatewayOrderId
        ? `INV-${p.gatewayOrderId.slice(-8).toUpperCase()}`
        : `INV-${1000 + idx}`;
      const totalRupees = Math.round(p.amount / 100);
      const baseRupees = Math.round(totalRupees / 1.18);
      const gstRupees = totalRupees - baseRupees;

      const invoiceGstin = p.metadata?.gstin || merchant?.gstin;
      const gstInvoiceCode = invoiceGstin
        ? `GSTIN-${invoiceGstin}-${invId}`
        : "N/A (B2C Receipt)";

      return {
        id: invId,
        date: d.toISOString().split("T")[0],
        period: monthStr,
        plan: p.description || p.type || "Growth Partner Plan",
        basePrice: `₹${baseRupees.toLocaleString("en-IN")}.00`,
        gstBreakdown: `₹${gstRupees.toLocaleString("en-IN")}.00 (18% GST)`,
        amount: `₹${totalRupees.toLocaleString("en-IN")}.00`,
        status: p.status === "CAPTURED" ? "Paid" : p.status,
        gstInvoice: gstInvoiceCode,
      };
    });
  }, [merchant, paymentHistoryData]);

  const handleOpenUpgrade = (plan) => {
    setSelectedPlan(plan);
    setSelectedAddOn(null);
    setIsCheckoutOpen(true);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: autoPay initialization on mount
  useEffect(() => {
    if (typeof window === "undefined" || !plans || plans.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    if (
      urlParams.get("autoPay") === "true" ||
      urlParams.get("payNow") === "true"
    ) {
      const targetPlan = plans.find((p) => p.id === "growth") || plans[1];
      if (targetPlan) {
        handleOpenUpgrade(targetPlan);
      }
    }
  }, [plans]);

  if (isLoadingMerchant) {
    return (
      <DashboardLayout title="Billing & Plans" user={{ role: "merchant" }}>
        <DashboardSkeleton mode="dashboard" />
      </DashboardLayout>
    );
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const triggerRazorpayDirect = async (planToPay, addOnToPay) => {
    const planObj = planToPay || selectedPlan;
    const addOnObj = addOnToPay || selectedAddOn;

    if (!planObj && !addOnObj) return;

    const basePrice = planObj
      ? billingCycle === "yearly"
        ? planObj.priceYearly
        : planObj.priceMonthly
      : addOnObj?.price || 0;

    const gst = parseFloat((basePrice * 0.18).toFixed(2));
    const totalPrice = Math.round(basePrice + gst);

    setIsRazorpayLoading(true);
    toast.loading("Creating secure Razorpay order...", { id: "rzp-direct" });

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error(
          "Razorpay SDK script failed to load. Please check your internet connection.",
        );
      }

      // 1. Create Razorpay order via backend API
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPrice,
          plan: planObj?.id,
          cycle: billingCycle,
          type: planObj ? "subscription" : "addon",
          addOnId: addOnObj?.id,
          gstin: gstin?.trim()?.toUpperCase() || "",
        }),
      });

      const orderJson = await res.json();
      toast.dismiss("rzp-direct");

      if (!res.ok || !orderJson.data?.orderId) {
        throw new Error(
          orderJson.message || "Failed to create Razorpay Order ID.",
        );
      }

      const { orderId, amount, currency, keyId } = orderJson.data;

      // Close modal before launching native Razorpay popup
      setIsCheckoutOpen(false);

      // 2. Open official Razorpay Native Popup window
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: amount || totalPrice * 100,
        currency: currency || "INR",
        name: "Vouchiqo Merchant Portal",
        description: planObj
          ? `${planObj.name} (${billingCycle})`
          : addOnObj?.name || "Add-on Purchase",
        order_id: orderId,
        prefill: {
          name: merchant?.businessName || "Merchant Partner",
          email: merchant?.contactEmail || "",
          contact: merchant?.contactPhone || "",
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response) => {
          setIsRazorpayLoading(true);
          toast.loading("Verifying Razorpay transaction...", {
            id: "rzp-verify",
          });
          try {
            const verifyRes = await fetch("/api/payments/verify-signature", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planObj?.id,
                cycle: billingCycle,
                type: planObj ? "subscription" : "addon",
                addOnId: addOnObj?.id,
              }),
            });

            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(
                verifyJson.message || "Payment verification failed.",
              );
            }

            await queryClient.invalidateQueries({
              queryKey: ["merchant-profile"],
            });
            queryClient.invalidateQueries({
              queryKey: ["merchant-coupons-count"],
            });
            queryClient.invalidateQueries({
              queryKey: ["merchant-campaigns-count"],
            });
            await queryClient.invalidateQueries({
              queryKey: ["merchant-payment-history"],
            });
            await refetchMerchant();
            await refetchPaymentHistory();

            toast.success(
              verifyJson.message ||
                "Payment verified! Plan activated successfully.",
              {
                id: "rzp-verify",
                duration: 5000,
              },
            );
          } catch (err) {
            toast.error(err.message || "Payment verification failed.", {
              id: "rzp-verify",
            });
          } finally {
            setIsRazorpayLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsRazorpayLoading(false);
            toast.error("Razorpay payment cancelled.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.dismiss("rzp-direct");
      toast.error(err.message || "Razorpay checkout error");
      setIsRazorpayLoading(false);
    }
  };

  const basePrice = selectedPlan
    ? billingCycle === "yearly"
      ? selectedPlan.priceYearly
      : selectedPlan.priceMonthly
    : selectedAddOn?.price || 0;

  const gst = parseFloat((basePrice * 0.18).toFixed(2));
  const totalPrice = Math.round(basePrice + gst);

  return (
    <DashboardLayout
      title="Subscription & Billing"
      user={{
        name: merchant?.businessName || "Merchant Partner",
        role: "merchant",
      }}
    >
      <div className="space-y-4 text-left font-sans w-full pb-8">
        <div data-tour="billing-plan">
          <CurrentPlanCard
            merchant={merchant}
            currentPlanId={currentPlanId}
            plans={plans}
            billingCycle={billingCycle}
            planExpiry={planExpiry}
            revivalCredits={revivalCredits}
            activeListingsCount={activeListingsCount}
            planListingsLimit={planListingsLimit}
            campaignsUsedCount={campaignsUsedCount}
            planCampaignsLimit={planCampaignsLimit}
            onOpenUpgrade={handleOpenUpgrade}
          />
        </div>

        <PlanComparisonGrid
          plans={plans}
          currentPlanId={currentPlanId}
          billingCycle={billingCycle}
          setBillingCycle={setBillingCycle}
          onOpenUpgrade={handleOpenUpgrade}
          isPaymentCompleted={
            merchant?.paymentStatus === "completed" ||
            merchant?.subscriptionStatus === "active" ||
            (merchant?.planExpiry &&
              new Date(merchant.planExpiry).getTime() > Date.now())
          }
          isLoading={isLoadingPlans || !plansData}
        />

        <BillingHistoryTable invoices={invoices} />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          selectedPlan={selectedPlan}
          selectedAddOn={selectedAddOn}
          billingCycle={billingCycle}
          basePrice={basePrice}
          gst={gst}
          totalPrice={totalPrice}
          gstin={gstin}
          setGstin={setGstin}
          onPayWithRazorpay={() =>
            triggerRazorpayDirect(selectedPlan, selectedAddOn)
          }
          isPending={isRazorpayLoading}
        />
      </div>
    </DashboardLayout>
  );
}
