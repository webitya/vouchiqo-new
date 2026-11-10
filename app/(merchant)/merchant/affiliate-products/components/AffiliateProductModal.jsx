"use client";

import {
  Eye,
  IndianRupee,
  Link as LinkIcon,
  Loader2,
  Lock,
  ShoppingBag,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useMerchantProfile } from "@/hooks/use-merchant";
import AffiliateProductPreviewCard, {
  CATEGORIES,
} from "./AffiliateProductPreviewCard";

export default function AffiliateProductModal({
  isOpen,
  onClose,
  initialData = null,
  onSuccess,
  isAdmin = false,
}) {
  const isEdit = Boolean(initialData?._id);

  const [merchantCategory, setMerchantCategory] = useState(null);
  const [pricingMode, setPricingMode] = useState("percent");

  const [form, setForm] = useState({
    title: initialData?.title || "",
    category: initialData?.category || "Fashion & Clothing",
    originalPrice: initialData?.originalPrice || "",
    discountPrice: initialData?.discountPrice || "",
    discountPercentage: initialData?.discountPercentage || "",
    discountText: initialData?.discountText || "",
    affiliateUrl: initialData?.affiliateUrl || "",
    imageUrl: initialData?.imageUrl || "",
    description: initialData?.description || "",
    status: initialData?.status || "active",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: merchantProfile } = useMerchantProfile({
    enabled: isOpen && !isAdmin,
  });

  useEffect(() => {
    const cat = merchantProfile?.category;
    if (cat) {
      setMerchantCategory(cat);
      if (!isEdit) {
        setForm((prev) => ({ ...prev, category: cat }));
      }
    }
  }, [merchantProfile, isEdit]);

  // Sync pricing mode on initialData change
  useEffect(() => {
    if (initialData?._id) {
      const orig = Number(initialData.originalPrice) || 0;
      const disc = Number(initialData.discountPrice) || 0;
      if (orig > 0 && disc > 0) {
        setPricingMode("exact");
      } else if (disc > 0 && orig === 0) {
        setPricingMode("fixed");
      } else {
        setPricingMode("percent");
      }

      setForm({
        title: initialData.title || "",
        category: initialData.category || "Fashion & Clothing",
        originalPrice: initialData.originalPrice || "",
        discountPrice: initialData.discountPrice || "",
        discountPercentage: initialData.discountPercentage || "",
        discountText: initialData.discountText || "",
        affiliateUrl: initialData.affiliateUrl || "",
        imageUrl: initialData.imageUrl || "",
        description: initialData.description || "",
        status: initialData.status || "active",
      });
    }
  }, [initialData]);

  if (!isOpen) return null;

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
        toast.error("Discount price cannot exceed the actual price.");
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
          "Please enter discount percentage or discount text (e.g. 20% OFF).",
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

    setLoading(true);
    try {
      const baseUrl = isAdmin
        ? "/api/admin/affiliate-products"
        : "/api/merchant/affiliate-products";
      const url = isEdit ? `${baseUrl}/${initialData._id}` : baseUrl;
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isEdit
            ? "Affiliate product updated successfully!"
            : "Affiliate product created successfully!",
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to save product.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex justify-end font-sans">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
        onClick={onClose}
      />

      {/* Right Side Embedded Drawer Panel */}
      <div className="relative w-full max-w-3xl sm:max-w-4xl bg-white border-l border-slate-200/90 shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {isEdit
                  ? "Edit Affiliate Product / Deal"
                  : "Add Affiliate Product / Deal"}
              </h2>
              <p className="text-xs text-slate-500 font-normal">
                Fill details on the left — live preview card updates in
                real-time on the right.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - 2 Column Split Layout */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form (7 columns) */}
            <form
              id="affiliate-form"
              onSubmit={handleSubmit}
              className="lg:col-span-7 space-y-4"
            >
              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Product / Deal Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Office Space & Meal Deal or Nike Sneakers"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-normal"
                    required
                  />
                </div>

                <div className="sm:col-span-5 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block flex items-center justify-between">
                    <span>Category *</span>
                    {merchantCategory && !isAdmin && (
                      <span className="text-[10px] font-bold text-blue-600 flex items-center gap-0.5">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </label>

                  {merchantCategory && !isAdmin ? (
                    <div className="h-9 px-3 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 text-slate-900 font-semibold text-xs shadow-2xs">
                      <span className="truncate">
                        {form.category || merchantCategory}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
                        <Lock className="w-3 h-3 text-blue-600" /> Locked to
                        Profile
                      </span>
                    </div>
                  ) : (
                    <select
                      value={form.category}
                      onChange={(e) =>
                        setForm({ ...form, category: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-normal cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Pricing & Offer Mode Tabs (% Off, Deal @ Price, MRP & Sale) */}
              <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-blue-600" />
                    Pricing & Deal Type
                  </span>

                  {/* Mode Selector Tabs */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setPricingMode("percent")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        pricingMode === "percent"
                          ? "bg-blue-600 text-white font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      % Off Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingMode("fixed")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        pricingMode === "fixed"
                          ? "bg-blue-600 text-white font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Deal @ Price
                    </button>
                    <button
                      type="button"
                      onClick={() => setPricingMode("exact")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                        pricingMode === "exact"
                          ? "bg-blue-600 text-white font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      MRP & Sale Price
                    </button>
                  </div>
                </div>

                {pricingMode === "percent" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 block">
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
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 block">
                        Discount Tag Display
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 20% OFF or FLAT ₹500 OFF"
                        value={form.discountText || ""}
                        onChange={(e) =>
                          setForm({ ...form, discountText: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                ) : pricingMode === "fixed" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 block">
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
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 block">
                        Deal Tagline / Promotion Text
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Office Space + Meal @ ₹200"
                        value={form.discountText || ""}
                        onChange={(e) =>
                          setForm({ ...form, discountText: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 block">
                        Actual MRP (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 39999"
                        value={form.originalPrice}
                        onChange={(e) =>
                          setForm({ ...form, originalPrice: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-600 block">
                        Offer Sale Price (₹) *
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 2999"
                        value={form.discountPrice}
                        onChange={(e) =>
                          setForm({ ...form, discountPrice: e.target.value })
                        }
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Destination URL */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                  Destination Affiliate Link URL *
                </label>
                <input
                  type="url"
                  placeholder="https://webitya.com"
                  value={form.affiliateUrl}
                  onChange={(e) =>
                    setForm({ ...form, affiliateUrl: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-normal"
                  required
                />
              </div>

              {/* Product Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Product / Offer Image
                </label>

                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors inline-flex items-center gap-1.5 shrink-0">
                    {uploadingImage ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                    )}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 font-normal"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Description / Key Specs (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Key features, service inclusions or offer details..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-normal"
                />
              </div>

              {/* Status Select */}
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-slate-700">
                  Product Status
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: "active" })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                      form.status === "active"
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, status: "paused" })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                      form.status === "paused"
                        ? "bg-amber-500 border-amber-500 text-slate-950"
                        : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Paused
                  </button>
                </div>
              </div>
            </form>

            {/* Right Live Preview Section (5 columns) */}
            <div className="lg:col-span-5 bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between space-y-3 sticky top-0">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Eye className="w-4 h-4 text-blue-600" /> Live Product Preview
                </span>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  Interactive Preview
                </span>
              </div>

              <div className="my-auto">
                <AffiliateProductPreviewCard product={form} isPreview={true} />
              </div>

              <p className="text-xs text-slate-500 text-center font-normal bg-white p-2 rounded-xl border border-slate-200/80">
                This is an exact preview of how your offer appears on brand
                pages &amp; homepage.
              </p>
            </div>
          </div>
        </div>

        {/* Drawer Footer Action Bar */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/90 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-semibold text-xs rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="affiliate-form"
            disabled={loading || uploadingImage}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-2 shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>
                {isEdit
                  ? "Update Affiliate Product"
                  : "Publish Affiliate Product"}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
