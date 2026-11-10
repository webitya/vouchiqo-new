import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { REDIS_KEYS } from "@/utils/constants";
import BrandClient from "./brand-client";

export const dynamic = "force-dynamic";

// Fields safe to expose publicly for related brand cards
const MERCHANT_PUBLIC_FIELDS = {
  businessName: 1,
  slug: 1,
  logo: 1,
  category: 1,
  description: 1,
  shortDescription: 1,
  followerCount: 1,
  isVerified: 1,
  plan: 1,
  website: 1,
  socialLinks: 1,
  totalCoupons: 1,
};

// Known brand aliases to match incoming slugs to canonical database slugs
const BRAND_ALIASES = {
  blackberrys: "blackberry",
  blackberry: "blackberry",
  blissclub: "bliss-club",
  "bliss-club": "bliss-club",
  bliss: "bliss-club",
  zandu: "emami-zandu",
  "emami-zandu": "emami-zandu",
  nilkamal: "nilkamal-furniture",
  "nilkamal-furniture": "nilkamal-furniture",
  lifestyle: "lifestyle-international-private-limited",
  "lifestyle-international-private-limited":
    "lifestyle-international-private-limited",
  uniqlo: "uniqlo-india",
  "uniqlo-india": "uniqlo-india",
  kama: "kama-ayurveda",
  "kama-ayurveda": "kama-ayurveda",
  cosmic: "cosmic-byte",
  "cosmic-byte": "cosmic-byte",
  bewakoof: "bewakoof",
  milton: "milton",
  salty: "salty",
  asus: "asus",
  nveda: "nveda",
};

/**
 * Reusable predicate to verify whether a coupon/product matches a merchant
 */
function matchesMerchant(item, mIdStr, mSlug) {
  if (!item) return false;
  const cMerchId = item.merchantId?._id
    ? item.merchantId._id.toString()
    : item.merchantId?.toString();
  const cSlug = (
    item.merchantId?.slug ||
    item.merchantSlug ||
    item.brandSlug ||
    ""
  ).toLowerCase();

  const matchesId = Boolean(cMerchId && mIdStr && cMerchId === mIdStr);
  const matchesSlug = Boolean(cSlug && mSlug && cSlug === mSlug);
  return matchesId || matchesSlug;
}

/**
 * Smart resolver to find a merchant by slug, aliases, or fuzzy name directly in MongoDB.
 */
async function resolveMerchant(slug) {
  const cleanSlug = (slug || "").toLowerCase().trim();
  if (!cleanSlug) return null;

  // 1. Direct slug match
  let merchant = await Merchant.findOne({
    slug: cleanSlug,
    status: "approved",
  }).lean();
  if (merchant) return merchant;

  // 2. Known brand aliases
  const aliasSlug =
    BRAND_ALIASES[cleanSlug] || BRAND_ALIASES[cleanSlug.replace(/-/g, "")];
  if (aliasSlug) {
    merchant = await Merchant.findOne({
      slug: aliasSlug,
      status: "approved",
    }).lean();
    if (merchant) return merchant;
  }

  // 3. Fallback fuzzy search on slug and businessName
  const compact = cleanSlug.replace(/[^a-z0-9]/g, "");
  const withoutS = compact.replace(/s$/, "");

  merchant = await Merchant.findOne({
    status: "approved",
    $or: [
      { slug: new RegExp(`^${cleanSlug}`, "i") },
      { slug: new RegExp(`^${withoutS}`, "i") },
      { businessName: new RegExp(cleanSlug.replace(/-/g, "[\\s-]*"), "i") },
      { businessName: new RegExp(withoutS, "i") },
    ],
  }).lean();

  return merchant;
}

/**
 * Generate dynamic SEO metadata for the Brand page from database.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cleanSlug = (slug || "").toLowerCase().trim();

  // Fast path: Redis cache check (< 1ms)
  try {
    if (redis) {
      const cached = await redis.get(REDIS_KEYS.brandDetail(cleanSlug));
      if (cached) {
        const data = JSON.parse(cached);
        const merchant = data?.merchant;
        if (merchant) {
          const title = `${merchant.businessName} Offers, Promo Codes & Deals | Vouchiqo`;
          const description =
            merchant.shortDescription ||
            merchant.description ||
            `Save at ${merchant.businessName} with verified offer codes, discounts, and expiring deals on Vouchiqo.`;
          return {
            title,
            description,
            openGraph: { title, description, type: "website" },
          };
        }
      }
    }
  } catch (_) {}

  await connectDB();

  try {
    const merchant = await resolveMerchant(cleanSlug);
    if (!merchant) {
      return {
        title: "Brand Not Found | Vouchiqo",
        description:
          "The requested brand storefront could not be located on Vouchiqo.",
      };
    }

    const title = `${merchant.businessName} Offers, Promo Codes & Deals | Vouchiqo`;
    const description =
      merchant.shortDescription ||
      merchant.description ||
      `Save at ${merchant.businessName} with verified offer codes, discounts, and expiring deals on Vouchiqo.`;

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
      title: "Brand Not Found | Vouchiqo",
      description:
        "The requested brand storefront could not be located on Vouchiqo.",
    };
  }
}

/**
 * Server Component fetching dynamic brand profile, coupons, affiliate products, and related brands.
 * 100% dynamic data from MongoDB — zero static mock fallbacks.
 */
export default async function BrandPage({ params }) {
  const { slug } = await params;
  const cleanSlug = (slug || "").toLowerCase().trim();

  // Fast path: Redis cache (5 minutes TTL)
  const cacheKey = REDIS_KEYS.brandDetail(cleanSlug);
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      return (
        <BrandClient
          merchant={data.merchant}
          coupons={data.coupons}
          expiredCoupons={data.expiredCoupons}
          affiliateProducts={data.affiliateProducts}
          relatedBrands={data.relatedBrands}
        />
      );
    }
  } catch (_) {}

  await connectDB();

  const merchant = await resolveMerchant(cleanSlug);
  if (!merchant) {
    notFound();
  }

  const mId = merchant._id;
  const mIdStr = merchant._id ? merchant._id.toString() : null;
  const mSlug = merchant.slug ? merchant.slug.toLowerCase() : null;

  const merchantFilter = {
    $or: [
      ...(mId ? [{ merchantId: mId }] : []),
      ...(mIdStr ? [{ merchantId: mIdStr }] : []),
      ...(mSlug ? [{ merchantSlug: mSlug }, { brandSlug: mSlug }] : []),
    ],
  };

  // Parallel dynamic fetch: active coupons, expired coupons, affiliate products, and related brands
  let coupons = [];
  let expiredCoupons = [];
  let affiliateProducts = [];
  let relatedBrands = [];

  try {
    const [rawCoupons, rawExpired, rawAffiliateProducts, rawRelated] =
      await Promise.all([
        Coupon.find({
          $and: [
            merchantFilter,
            { status: "active" },
            {
              $or: [
                { expiresAt: { $gt: new Date() } },
                { expiresAt: null },
                { expiresAt: { $exists: false } },
              ],
            },
          ],
        })
          .sort({ isFeatured: -1, createdAt: -1 })
          .populate("merchantId", "businessName slug logo website")
          .lean(),

        Coupon.find({
          $and: [
            merchantFilter,
            { status: { $nin: ["deleted"] } },
            {
              $or: [{ status: "expired" }, { expiresAt: { $lte: new Date() } }],
            },
          ],
        })
          .sort({ expiresAt: -1 })
          .limit(10)
          .populate("merchantId", "businessName slug logo")
          .lean(),

        AffiliateProduct.find({
          $and: [merchantFilter, { status: { $ne: "inactive" } }],
        })
          .sort({ createdAt: -1 })
          .lean(),

        Merchant.find({
          category: merchant.category,
          status: "approved",
          ...(merchant._id ? { _id: { $ne: merchant._id } } : {}),
        })
          .select(MERCHANT_PUBLIC_FIELDS)
          .limit(8)
          .lean(),
      ]);

    // Apply merchant match verification
    coupons = (rawCoupons || []).filter((c) =>
      matchesMerchant(c, mIdStr, mSlug),
    );
    expiredCoupons = (rawExpired || []).filter((c) =>
      matchesMerchant(c, mIdStr, mSlug),
    );
    affiliateProducts = (rawAffiliateProducts || []).filter((p) =>
      matchesMerchant(p, mIdStr, mSlug),
    );
    relatedBrands = rawRelated || [];
  } catch (err) {
    console.error("Error loading brand deals from database:", err);
  }

  // Serialize payload for Client Component & Redis cache
  const payload = {
    merchant: JSON.parse(JSON.stringify(merchant)),
    coupons: JSON.parse(JSON.stringify(coupons)),
    expiredCoupons: JSON.parse(JSON.stringify(expiredCoupons)),
    affiliateProducts: JSON.parse(JSON.stringify(affiliateProducts)),
    relatedBrands: JSON.parse(JSON.stringify(relatedBrands)),
  };

  // Populate Redis cache with 5-minute TTL (300s)
  try {
    if (redis) {
      const serialized = JSON.stringify(payload);
      redis.set(cacheKey, serialized, "EX", 300).catch(() => {});
      if (
        payload.merchant?.slug &&
        payload.merchant.slug.toLowerCase() !== cleanSlug
      ) {
        redis
          .set(
            REDIS_KEYS.brandDetail(payload.merchant.slug.toLowerCase()),
            serialized,
            "EX",
            300,
          )
          .catch(() => {});
      }
    }
  } catch (_) {}

  return (
    <BrandClient
      merchant={payload.merchant}
      coupons={payload.coupons}
      expiredCoupons={payload.expiredCoupons}
      affiliateProducts={payload.affiliateProducts}
      relatedBrands={payload.relatedBrands}
    />
  );
}
