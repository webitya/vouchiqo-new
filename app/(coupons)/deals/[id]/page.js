import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { logger } from "@/lib/logger";
import Coupon from "@/modules/coupon/coupon.model";
import { getCouponById } from "@/modules/coupon/coupon.service";
import DealDetailsClient from "./deal-details-client";

export const dynamic = "force-dynamic";

/**
 * Generate dynamic SEO metadata for the deal page.
 */
export async function generateMetadata({ params }) {
  const { id } = await params;
  await connectDB();

  try {
    const coupon = await getCouponById(id);
    const brandName = coupon.merchantId?.businessName || "Verified Partner";
    const val = coupon.rawDiscountValue || coupon.discountValue;
    const isNum = val !== null && val !== undefined && val !== "" && !isNaN(Number(val));
    const discountText =
      coupon.discountType === "percentage" && isNum
        ? `${val}% OFF`
        : coupon.discountType === "fixed" && isNum
          ? `₹${val} OFF`
          : "SPECIAL DEAL";

    const title = `${discountText} ${brandName} Coupon - ${coupon.title} | Vouchiqo`;
    const description =
      coupon.description ||
      `Get ${discountText} at ${brandName} with Vouchiqo's verified coupon code: ${coupon.code}. 100% working and community tested.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  } catch (err) {
    return {
      title: "Coupon Deal Not Found | Vouchiqo",
      description:
        "The requested discount code could not be found or has expired.",
    };
  }
}

/**
 * Server Component fetching the coupon details and injecting JSON-LD.
 */
export default async function CouponPage({ params }) {
  const { id } = await params;
  await connectDB();

  let coupon;
  let relatedCoupons = [];

  try {
    coupon = await getCouponById(id);

    // Fetch up to 3 similar coupons in the same category
    const isMockId = !mongoose.isValidObjectId(coupon._id);
    let rawRelated = [];
    if (coupon.category) {
      rawRelated = await Coupon.find({
        category: coupon.category,
        status: "active",
        expiresAt: { $gt: new Date() },
        ...(isMockId ? {} : { _id: { $ne: coupon._id } }),
      })
        .select("title discountValue discountType code expiresAt category merchantId")
        .populate("merchantId", "businessName slug logo")
        .limit(3)
        .lean();
    }

    // Fallback 1: If no category matches, fetch any active coupons from the DB
    if (!rawRelated || rawRelated.length === 0) {
      rawRelated = await Coupon.find({
        status: "active",
        expiresAt: { $gt: new Date() },
        ...(isMockId ? {} : { _id: { $ne: coupon._id } }),
      })
        .select("title discountValue discountType code expiresAt category merchantId")
        .populate("merchantId", "businessName slug logo")
        .limit(3)
        .lean();
    }

    // Fallback 2: If the DB is completely empty (no active coupons at all), construct mock related coupons
    if (!rawRelated || rawRelated.length === 0) {
      rawRelated = [
        {
          _id: "mock_cpn_related_1",
          title: "Flat 10% OFF on Sony Wireless Headsets",
          discountType: "percentage",
          discountValue: 10,
          category: "electronics",
          merchantId: {
            businessName: "Sony",
            slug: "sony",
            logo: "/brandlogos/10035.jpg",
          }
        },
        {
          _id: "mock_cpn_related_2",
          title: "Flat 20% OFF on Adidas Running Shoes",
          discountType: "percentage",
          discountValue: 20,
          category: "fashion",
          merchantId: {
            businessName: "Adidas",
            slug: "adidas",
            logo: "/brandlogos/10012.jpg",
          }
        },
        {
          _id: "mock_cpn_related_3",
          title: "Up to 50% OFF on Samsung Smart TV series",
          discountType: "percentage",
          discountValue: 50,
          category: "electronics",
          merchantId: {
            businessName: "Samsung",
            slug: "samsung",
            logo: "/brandlogos/10005.jpg",
          }
        }
      ];
    }

    relatedCoupons = JSON.parse(JSON.stringify(rawRelated || []));
  } catch (err) {
    logger.error({ err, id }, "Error loading deal page");
    notFound();
  }

  const brandName = coupon.merchantId?.businessName || "Verified Partner";

  // JSON-LD structured data Schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Offer",
    name: coupon.title,
    description:
      coupon.description || `Claim ${coupon.title} coupon code on Vouchiqo.`,
    price: "0",
    priceCurrency: "INR",
    eligibleRegion: {
      "@type": "Place",
      name: coupon.location?.city || "India",
    },
    offeredBy: {
      "@type": "Merchant",
      name: brandName,
    },
    seller: {
      "@type": "Organization",
      name: "Vouchiqo",
      url: "https://vouchiqo.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DealDetailsClient
        coupon={JSON.parse(JSON.stringify(coupon))}
        relatedCoupons={relatedCoupons}
      />
    </>
  );
}
