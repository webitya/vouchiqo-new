"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  IndianRupee,
  Link as LinkIcon,
  Loader2,
  Lock,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  useMerchantProfile,
  useUpdateMerchantAffiliateProduct,
} from "@/hooks/use-merchant";
import { apiFetch } from "@/lib/fetcher";
import AffiliateProductPreviewCard from "../components/AffiliateProductPreviewCard";

export default function EditAffiliateProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [uploadingImage, setUploadingImage] = useState(false);
  const [merchantCategory, setMerchantCategory] = useState(null);
  const [pricingMode, setPricingMode] = useState("percent");

  const [form, setForm] = useState({
    title: "",
    category: "Fashion & Clothing",
    originalPrice: "",
    discountPrice: "",
    discountPercentage: "",
    discountText: "",
    affiliateUrl: "",
    imageUrl: "",
    description: "",
    status: "active",
  });

  const { data: merchantProfile } = useMerchantProfile();
  useEffect(() => {
    const cat = merchantProfile?.category;
    if (cat) setMerchantCategory(cat);
  }, [merchantProfile]);

  const { data: productData, isLoading: fetching } = useQuery({
    queryKey: ["merchant-affiliate-product", id],
    enabled: !!id,
    queryFn: async () => {
      const json = await apiFetch(`/api/merchant/affiliate-products/${id}`);
      return json?.data || json || null;
    },
  });

  useEffect(() => {
    if (!productData) return;
    const p = productData;
    const orig = Number(p.originalPrice) || 0;
    const disc = Number(p.discountPrice) || 0;
    if (orig > 0 && disc > 0) {
      setPricingMode("exact");
    } else if (disc > 0 && orig === 0) {
      setPricingMode("fixed");
    } else {
      setPricingMode("percent");
    }

    setForm({
      title: p.title || "",
      category: p.category || merchantCategory || "Fashion & Clothing",
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      discountPercentage: p.discountPercentage
        ? String(p.discountPercentage)
        : "",
      discountText: p.discountText || "",
      affiliateUrl: p.affiliateUrl || "",
      imageUrl: p.imageUrl || "",
      description: p.description || "",
      status: p.status || "active",
    });
  }, [productData, merchantCategory]);

  const updateProductMutation = useUpdateMerchantAffiliateProduct();
  const loading = updateProductMutation.isPending;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const resData = await res.json();
        const uploadedUrl = resData.data?.url || resData.url || "";
        if (uploadedUrl) {
          setForm((prev) => ({ ...prev, imageUrl: uploadedUrl }));
          toast.success("Product image uploaded successfully!");
        } else {
          toast.error("Upload response missing URL.");
        }
      } else {
        toast.error("Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error uploading image.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter the product title.");
      return;
    }

    if (pricingMode === "exact") {
      if (!form.originalPrice || !form.discountPrice) {
        toast.error("Please enter both actual price and discount price.");
        return;
      }
      if (Number(form.discountPrice) > Number(form.originalPrice)) {
        toast.error("Discount price cannot exceed actual price.");
        return;
      }
    } else if (pricingMode === "fixed") {
      if (!form.discountPrice && !form.discountText.trim()) {
        toast.error("Please enter deal price (e.g. 200) or deal tagline.");
        return;
      }
    } else {
      if (!form.discountPercentage && !form.discountText.trim()) {
        toast.error(
          "Please enter discount percentage or discount tag text (e.g. 20% OFF).",
        );
        return;
      }
    }

    if (!form.affiliateUrl.trim()) {
      toast.error("Please enter destination affiliate link.");
      return;
    }

    const payload = {
      ...form,
      originalPrice: pricingMode === "exact" ? Number(form.originalPrice) : 0,
      discountPrice:
        pricingMode === "exact" || pricingMode === "fixed"
          ? Number(form.discountPrice)
          : 0,
      discountPercentage: Number(form.discountPercentage) || 0,
      discountText:
        form.discountText ||
        (pricingMode === "fixed" && form.discountPrice
          ? `Get Deal @ ₹${form.discountPrice}`
          : form.discountPercentage
            ? `${form.discountPercentage}% OFF`
            : ""),
    };

    updateProductMutation.mutate(
      { id, ...payload },
      {
        onSuccess: () => {
          router.push("/merchant/affiliate-products");
        },
      },
    );
  };

  if (fetching) {
    return (
      <DashboardLayout
        title="Edit Affiliate Product"
        user={{ role: "merchant" }}
      >
        <div className="py-20 text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#F72853] animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            Loading product details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const activeCategoryDisplay =
    form.category || merchantCategory || "General Offers";

  return (
    <DashboardLayout title="Edit Affiliate Product" user={{ role: "merchant" }}>
      <div className="w-full max-w-full space-y-4 font-sans text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <Link
              href="/merchant/affiliate-products"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900 leading-tight">
                Edit Affiliate Product / Deal
              </h1>
              <p className="text-xs text-slate-500 font-normal">
                Update product pricing, affiliate link, or image with real-time
                preview on the right.
              </p>
            </div>
          </div>
        </div>

        {/* 2-Column Split View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
          {/* Left Form (7 columns) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-2xs"
          >
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-7 space-y-1">
                <label className="text-xs font-medium text-slate-700 block">
                  Product / Deal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Office Space & Meal Deal or Nike Sneakers"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20 focus:bg-white transition-all font-normal placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs font-medium text-slate-700 block flex items-center justify-between">
                  <span>Category *</span>
                  <span className="text-[10px] font-medium text-[#F72853] flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                </label>

                <div className="h-8.5 px-2.5 flex items-center justify-between rounded-lg border border-rose-200/70 bg-rose-50/40 text-slate-800 font-medium text-xs">
                  <span className="truncate">{activeCategoryDisplay}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#F72853] bg-white border border-rose-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                    <Lock className="w-2.5 h-2.5" /> Locked to Profile
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & Offer Mode Tabs (% Off, Deal @ Price, MRP & Sale) */}
            <div className="bg-rose-50/30 border border-rose-100/90 p-3 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-800 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-[#F72853]" />
                  Pricing &amp; Deal Type
                </span>

                {/* Mode Selector Tabs */}
                <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setPricingMode("percent")}
                    className={`px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                      pricingMode === "percent"
                        ? "bg-[#F72853] text-white font-medium shadow-xs"
                        : "text-slate-600 hover:text-slate-900 font-normal"
                    }`}
                  >
                    % Off Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode("fixed")}
                    className={`px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                      pricingMode === "fixed"
                        ? "bg-[#F72853] text-white font-medium shadow-xs"
                        : "text-slate-600 hover:text-slate-900 font-normal"
                    }`}
                  >
                    Deal @ Price
                  </button>
                  <button
                    type="button"
                    onClick={() => setPricingMode("exact")}
                    className={`px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer ${
                      pricingMode === "exact"
                        ? "bg-[#F72853] text-white font-medium shadow-xs"
                        : "text-slate-600 hover:text-slate-900 font-normal"
                    }`}
                  >
                    MRP &amp; Sale Price
                  </button>
                </div>
              </div>

              {pricingMode === "percent"
                ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-xs font-normal text-slate-600 block">
                        Discount Percentage (%) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 20"
                        value={form.discountPercentage || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm({
                            ...form,
                            discountPercentage: val,
                            discountText: val ? `${val}% OFF` : "",
                          });
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-normal text-slate-600 block">
                        Discount Tag Display
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 20% OFF or FLAT ₹500 OFF"
                        value={form.discountText || ""}
                        onChange={(e) =>
                          setForm({ ...form, discountText: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                      />
                    </div>
                  </div>
                : pricingMode === "fixed"
                  ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-normal text-slate-600 block">
                          Offer / Deal Price (₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 200"
                          value={form.discountPrice || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setForm({
                              ...form,
                              discountPrice: val,
                              discountText: val
                                ? `Get Deal @ ₹${val}`
                                : form.discountText,
                            });
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-normal text-slate-600 block">
                          Deal Tagline / Promotion Text
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Office Space + Meal @ ₹200"
                          value={form.discountText || ""}
                          onChange={(e) =>
                            setForm({ ...form, discountText: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                        />
                      </div>
                    </div>
                  : <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-xs font-normal text-slate-600 block">
                          Actual MRP (₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 39999"
                          value={form.originalPrice}
                          onChange={(e) =>
                            setForm({ ...form, originalPrice: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-normal text-slate-600 block">
                          Offer Sale Price (₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 2999"
                          value={form.discountPrice}
                          onChange={(e) =>
                            setForm({ ...form, discountPrice: e.target.value })
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                        />
                      </div>
                    </div>}
            </div>

            {/* Destination URL */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-[#F72853]" />
                Destination Affiliate Link URL *
              </label>
              <input
                type="url"
                placeholder="https://affiliate.example.com/deal..."
                value={form.affiliateUrl}
                onChange={(e) =>
                  setForm({ ...form, affiliateUrl: e.target.value })
                }
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20 focus:bg-white transition-all font-normal placeholder:text-slate-400"
                required
              />
            </div>

            {/* Product Image */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">
                Product / Offer Image
              </label>

              <div className="flex items-center gap-2">
                <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-medium text-xs rounded-lg border border-slate-200 cursor-pointer transition-colors inline-flex items-center gap-1.5 shrink-0">
                  {uploadingImage
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F72853]" />
                    : <UploadCloud className="w-3.5 h-3.5 text-[#F72853]" />}
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>

                <input
                  type="url"
                  placeholder="Or paste direct image URL (https://...)"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
                  }
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20 focus:bg-white font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 block">
                Description / Key Specs (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Key features, service inclusions or offer details..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full bg-slate-50/60 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20 focus:bg-white transition-all font-normal placeholder:text-slate-400"
              />
            </div>

            {/* Status Select */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-medium text-slate-700">
                Product Status
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "active" })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                    form.status === "active"
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, status: "paused" })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                    form.status === "paused"
                      ? "bg-amber-500 border-amber-500 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Paused
                </button>
              </div>
            </div>

            {/* Form Submit */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Link
                href="/merchant/affiliate-products"
                className="px-3.5 py-1.5 text-slate-600 font-medium text-xs rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="px-5 py-2 bg-[#F72853] hover:bg-[#e01e47] text-white font-medium text-xs rounded-lg transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
              >
                {loading
                  ? <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  : <span>Update Affiliate Product</span>}
              </button>
            </div>
          </form>

          {/* Right Live Preview Card Section (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-xl p-4 space-y-3 sticky top-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                <Eye className="w-3.5 h-3.5 text-[#F72853]" /> Live Product
                Preview
              </span>
              <span className="bg-rose-50 text-[#F72853] border border-rose-200/70 text-[10px] font-medium px-2 py-0.5 rounded-full">
                Interactive Preview
              </span>
            </div>

            <AffiliateProductPreviewCard product={form} isPreview={true} />

            <p className="text-[11px] text-slate-400 text-center font-normal bg-slate-50/80 p-2 rounded-lg border border-slate-100 leading-normal">
              Exact preview of how your offer appears on the public site &amp;
              brand pages.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
