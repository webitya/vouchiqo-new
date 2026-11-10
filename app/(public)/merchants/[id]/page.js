import mongoose from "mongoose";
import { notFound, RedirectType, redirect } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import Merchant from "@/modules/merchant/merchant.model";

export const dynamic = "force-dynamic";

/**
 * Legacy merchant route redirection: /merchants/[id] -> /brand/[slug]
 * Canonical storefront pages in Vouchiqo live at /brand/[slug].
 */
export default async function MerchantDetailPage({ params }) {
  const resolvedParams = await params;
  const rawId = resolvedParams?.id?.trim();

  if (!rawId) {
    notFound();
  }

  await connectDB();

  let merchant = null;

  // 1. Check if rawId is a MongoDB ObjectId
  if (mongoose.Types.ObjectId.isValid(rawId)) {
    merchant = await Merchant.findById(rawId).select("slug").lean();
  }

  // 2. If not found by ObjectId, lookup by slug
  if (!merchant) {
    merchant = await Merchant.findOne({
      slug: rawId.toLowerCase(),
    })
      .select("slug")
      .lean();
  }

  // 3. Fallback: case-insensitive slug search
  if (!merchant) {
    merchant = await Merchant.findOne({
      slug: { $regex: new RegExp(`^${rawId}$`, "i") },
    })
      .select("slug")
      .lean();
  }

  if (!merchant?.slug) {
    notFound();
  }

  // Permanent canonical redirect to /brand/[slug]
  redirect(`/brand/${merchant.slug}`, RedirectType.replace);
}
