"use client";

import {
  Eye,
  IndianRupee,
  Link as LinkIcon,
  Loader2,
  Lock,
  ShoppingBag,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AffiliateProductPreviewCard, {
  CATEGORIES,
} from "@/app/(merchant)/merchant/affiliate-products/components/AffiliateProductPreviewCard";

export default function SectionAffiliateProduct({ merchant }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pricingMode, setPricingMode] = useState("percent");

  const [form, setForm] = useState({
    title: "",
    category: merchant?.category || "Fashion & Clothing",
    originalPrice: "",
    discountPrice: "",
    discountPercentage: "",
    discountText: "",
    affiliateUrl: "",
    imageUrl: "",
    description: "",
    status: "active",
  });

  const merchantCategory = merchant?.category || null;

  useEffect(() => {
    if (merchantCategory) {
      setForm((prev) => ({ ...prev, category: merchantCategory }));
    }
  }, [merchantCategory]);

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
      toast.error("Please enter your website product link.");
      return;
    }

    // Auto prepend https:// if missing
    let cleanUrl = form.affiliateUrl.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const payload = {
      ...form,
      affiliateUrl: cleanUrl,
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
      const res = await fetch("/api/merchant/affiliate-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Website product link listing published successfully!");
        router.push("/merchant/coupons?type=affiliate");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to create product listing.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start w-full">
      {/* Left Form (7 cols) */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5.5 space-y-4 shadow-2xs text-left"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#F72853]" />
              Website Product Details
            </h2>
            <p className="text-[11px] text-slate-500">
              Shoppers clicking this deal will be redirected straight to your
              product webpage.
            </p>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Direct Link Deal
          </span>
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-7 space-y-1">
            <label className="text-xs font-medium text-slate-700 block">
              Product / Deal Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Handmade Ceramic Cup or Wireless Earbuds"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20 focus:bg-white transition-all font-normal placeholder:text-slate-400"
              required
            />
          </div>

          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-medium text-slate-700 block flex items-center justify-between">
              <span>Category *</span>
              {merchantCategory && (
                <span className="text-[10px] font-medium text-[#F72853] flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Profile Category
                </span>
              )}
            </label>

            {merchantCategory ? (
              <div className="h-9 px-2.5 flex items-center justify-between rounded-xl border border-rose-200/70 bg-rose-50/40 text-slate-800 font-medium text-xs">
                <span className="truncate">
                  {form.category || merchantCategory}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-[#F72853] bg-white border border-rose-200/80 px-1.5 py-0.5 rounded-md shrink-0">
                  <Lock className="w-2.5 h-2.5" /> Auto-set
                </span>
              </div>
            ) : (
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:bg-white transition-all font-normal cursor-pointer"
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

        {/* Destination Product Link URL */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 block flex items-center gap-1">
            <LinkIcon className="w-3.5 h-3.5 text-[#F72853]" />
            Website Product URL (Direct Buy Page) *
          </label>
          <input
            type="url"
            placeholder="https://yourstore.com/products/summer-jacket"
            value={form.affiliateUrl}
            onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20 focus:bg-white transition-all font-normal placeholder:text-slate-400 font-mono text-[11px]"
            required
          />
          <p className="text-[10px] text-slate-400">
            Paste the exact page link on your website where shoppers can view or
            buy this item.
          </p>
        </div>

        {/* Pricing & Offer Mode Tabs */}
        <div className="bg-slate-50/80 border border-slate-200/80 p-3 sm:p-3.5 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-[#F72853]" />
              Pricing &amp; Discount Deal
            </span>

            {/* Mode Selector Tabs */}
            <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setPricingMode("percent")}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  pricingMode === "percent"
                    ? "bg-[#F72853] text-white font-medium shadow-xs"
                    : "text-slate-600 hover:text-slate-900 font-normal"
                }`}
              >
                % Discount
              </button>
              <button
                type="button"
                onClick={() => setPricingMode("fixed")}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  pricingMode === "fixed"
                    ? "bg-[#F72853] text-white font-medium shadow-xs"
                    : "text-slate-600 hover:text-slate-900 font-normal"
                }`}
              >
                Flat Deal Price
              </button>
              <button
                type="button"
                onClick={() => setPricingMode("exact")}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                  pricingMode === "exact"
                    ? "bg-[#F72853] text-white font-medium shadow-xs"
                    : "text-slate-600 hover:text-slate-900 font-normal"
                }`}
              >
                MRP vs Sale Price
              </button>
            </div>
          </div>

          {pricingMode === "percent" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-normal text-slate-600 block">
                  Discount Percentage (%) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={form.discountPercentage || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({
                      ...form,
                      discountPercentage: val,
                      discountText: val ? `${val}% OFF` : "",
                    });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-normal text-slate-600 block">
                  Badge / Tagline Display
                </label>
                <input
                  type="text"
                  placeholder="e.g. 25% OFF or SPECIAL ONLINE DEAL"
                  value={form.discountText || ""}
                  onChange={(e) =>
                    setForm({ ...form, discountText: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                />
              </div>
            </div>
          ) : pricingMode === "fixed" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-normal text-slate-600 block">
                  Deal Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 499"
                  value={form.discountPrice || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setForm({
                      ...form,
                      discountPrice: val,
                      discountText: val ? `Deal @ ₹${val}` : form.discountText,
                    });
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-normal text-slate-600 block">
                  Deal Tagline Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Limited Edition @ ₹499"
                  value={form.discountText || ""}
                  onChange={(e) =>
                    setForm({ ...form, discountText: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-normal text-slate-600 block">
                  Actual MRP (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1999"
                  value={form.originalPrice}
                  onChange={(e) =>
                    setForm({ ...form, originalPrice: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-normal text-slate-600 block">
                  Offer Sale Price (₹) *
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1299"
                  value={form.discountPrice}
                  onChange={(e) =>
                    setForm({ ...form, discountPrice: e.target.value })
                  }
                  className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20"
                />
              </div>
            </div>
          )}
        </div>

        {/* Product Image */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 block">
            Product Display Image
          </label>

          <div className="flex items-center gap-2">
            <label className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors inline-flex items-center gap-1.5 shrink-0">
              {uploadingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F72853]" />
              ) : (
                <UploadCloud className="w-3.5 h-3.5 text-[#F72853]" />
              )}
              <span>Upload Photo</span>
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
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:bg-white transition-all font-normal placeholder:text-slate-400 font-mono text-[11px]"
            />
          </div>

          {form.imageUrl && (
            <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-600">
              <span>Image attached</span>
              <button
                type="button"
                onClick={() => setForm({ ...form, imageUrl: "" })}
                className="text-rose-500 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700 block">
            Brief Features or Highlights (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="Add key highlights like 1-Year Warranty, 100% Cotton, Free Delivery, etc."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-[#F72853] focus:ring-1 focus:ring-[#F72853]/20 focus:bg-white transition-all font-normal placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/merchant/coupons")}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#F72853] hover:bg-[#e01e47] text-white text-xs font-semibold rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing Link...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Publish Website Product Deal</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Right Column: Live Interactive Preview (5 cols) */}
      <div className="lg:col-span-5 sticky top-20 space-y-2 text-left">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#F72853]" />
            Live Shopper Card Preview
          </span>
          <span className="text-[10px] text-slate-400">
            Updates in real-time
          </span>
        </div>

        <AffiliateProductPreviewCard
          product={{
            title: form.title || "Your Product Title Here",
            category: form.category || "General Offers",
            originalPrice: Number(form.originalPrice) || 0,
            discountPrice: Number(form.discountPrice) || 0,
            discountPercentage: Number(form.discountPercentage) || 0,
            discountText:
              form.discountText ||
              (pricingMode === "fixed" && form.discountPrice
                ? `Deal @ ₹${form.discountPrice}`
                : form.discountPercentage
                  ? `${form.discountPercentage}% OFF`
                  : "Special Deal"),
            affiliateUrl: form.affiliateUrl || "https://yourwebsite.com",
            imageUrl: form.imageUrl,
            description:
              form.description || "Highlights of your deal will appear here.",
            status: "active",
          }}
          isPreview={true}
        />
      </div>
    </div>
  );
}
