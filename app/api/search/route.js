import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { escapeRegex } from "@/lib/security";
import AffiliateProduct from "@/modules/affiliate-product/affiliate-product.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { COUPON_CATEGORIES, REDIS_KEYS, REDIS_TTL } from "@/utils/constants";

export const dynamic = "force-dynamic";

const CATEGORY_NAMES = {
  fashion: "Fashion & Clothing",
  food: "Food & Dining",
  electronics: "Electronics & Gadgets",
  beauty: "Beauty & Wellness",
  travel: "Travel & Hospitality",
  home: "Home & Living",
  "home-improvement": "Home Improvement",
  fitness: "Fitness & Healthcare",
  education: "Education & Courses",
  "kids-baby": "Kids & Baby Care",
  jewellery: "Jewellery & Accessories",
  automotive: "Automobile & Services",
  entertainment: "Gaming & Entertainment",
  grocery: "Grocery & Essentials",
  finance: "Finance & Insurance",
};

/**
 * GET /api/search
 * Public unified multi-entity search endpoint.
 * Searches across approved brands, active coupons, verified categories, and affiliate products.
 * Redis-cached per query for 60 seconds.
 */
export const GET = asyncHandler(async (request) => {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || searchParams.get("search") || "").trim();
  const limitParam = parseInt(searchParams.get("limit") || "8", 10);
  const limit = Math.min(Math.max(limitParam, 1), 30);

  if (!q) {
    return ok({
      query: "",
      brands: [],
      coupons: [],
      categories: [],
      products: [],
      total: 0,
    });
  }

  const cleanQ = q.toLowerCase();
  const cacheKey = REDIS_KEYS.searchGlobal(cleanQ);

  // Fast path: Redis cache (60 seconds)
  try {
    const cached = await redis.get(cacheKey);
    if (cached) return ok(JSON.parse(cached));
  } catch (_) {}

  await connectDB();

  const safeRegex = escapeRegex(cleanQ);
  const regex = new RegExp(safeRegex, "i");
  const flexibleRegex = new RegExp(
    safeRegex.replace(/[\s-]+/g, "[\\s-]*"),
    "i",
  );

  // Multi-token words for deep cross-word and multi-keyword queries (e.g. "milton water bottle", "dine in combo")
  const tokens = cleanQ
    .split(/[\s,+-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);

  const BRAND_SEARCH_ALIASES = {
    blissclub: "bliss club",
    zandu: "emami zandu",
    nilkamal: "nilkamal furniture",
    blackberrys: "blackberry",
  };
  const aliasQuery = BRAND_SEARCH_ALIASES[cleanQ.replace(/[^a-z0-9]/g, "")];
  const aliasRegex = aliasQuery
    ? new RegExp(escapeRegex(aliasQuery), "i")
    : null;

  // 1. Matched Categories (matches by name, slug, or query tokens)
  const matchedCategories = COUPON_CATEGORIES.filter((slug) => {
    if (slug === "others") return false;
    const name = (CATEGORY_NAMES[slug] || slug).toLowerCase();
    return (
      name.includes(cleanQ) ||
      slug.toLowerCase().includes(cleanQ) ||
      (tokens.length > 0 && tokens.every((tok) => name.includes(tok)))
    );
  }).map((slug) => ({
    id: `cat_${slug}`,
    title: CATEGORY_NAMES[slug] || slug,
    slug,
    type: "Category",
    href: `/category/${slug}`,
  }));

  // 2. Find matching merchants — in-depth search by:
  //    - Business name & display trade name
  //    - Sub-Category Tags Chips (entered during merchant registration)
  //    - Tags array
  //    - Category & custom category notes
  //    - Slug
  //    - Short and long descriptions
  //    - Operating location (city, address)
  const merchantOrConditions = [
    { businessName: regex },
    { businessName: flexibleRegex },
    ...(aliasRegex ? [{ businessName: aliasRegex }, { slug: aliasRegex }] : []),
    { slug: regex },
    { slug: flexibleRegex },
    { category: regex },
    { customCategoryNotes: regex },
    { subCategoryTags: regex },
    { subCategoryTags: flexibleRegex },
    { tags: regex },
    { tags: flexibleRegex },
    { shortDescription: regex },
    { description: regex },
    { "location.city": regex },
    { "location.address": regex },
  ];

  // Deep multi-token matching: all words appear across merchant profile fields
  if (tokens.length > 1) {
    merchantOrConditions.push({
      $and: tokens.map((token) => {
        const tRegex = new RegExp(escapeRegex(token), "i");
        return {
          $or: [
            { businessName: tRegex },
            { subCategoryTags: tRegex },
            { tags: tRegex },
            { category: tRegex },
            { customCategoryNotes: tRegex },
            { shortDescription: tRegex },
            { description: tRegex },
            { "location.city": tRegex },
          ],
        };
      }),
    });
  }

  const matchingMerchants = await Merchant.find({
    status: "approved",
    $or: merchantOrConditions,
  })
    .select(
      "businessName slug logo category isVerified totalCoupons shortDescription subCategoryTags tags location",
    )
    .limit(limit)
    .lean();

  const matchedMerchantIds = matchingMerchants.map((m) => m._id);

  // 2b. Extract matching Sub-Category Tags Chips
  const matchedTagsMap = new Map();
  const matchesTag = (tag) => {
    if (!tag || typeof tag !== "string") return false;
    const t = tag.toLowerCase().trim();
    if (!t) return false;
    if (t.includes(cleanQ) || cleanQ.includes(t)) return true;
    if (tokens.length > 0 && tokens.every((tok) => t.includes(tok)))
      return true;
    if (tokens.some((tok) => t.includes(tok) && tok.length >= 3)) return true;
    return false;
  };

  matchingMerchants.forEach((m) => {
    const allTags = [...(m.subCategoryTags || []), ...(m.tags || [])];
    allTags.forEach((tagStr) => {
      if (matchesTag(tagStr)) {
        const key = tagStr.toLowerCase().trim();
        if (!matchedTagsMap.has(key)) {
          matchedTagsMap.set(key, {
            id: `tag_${encodeURIComponent(key)}`,
            title: tagStr.trim(),
            tag: tagStr.trim(),
            type: "Tag",
            subtitle: `Sub-Category Tag • ${m.businessName}`,
            href: `/search?q=${encodeURIComponent(tagStr.trim())}`,
            merchantName: m.businessName,
          });
        }
      }
    });
  });

  // Query extra matching tags from merchants and coupons
  const [extraSubCatTags, extraCouponTags] = await Promise.all([
    Merchant.distinct("subCategoryTags", {
      status: "approved",
      $or: [
        { subCategoryTags: regex },
        { subCategoryTags: flexibleRegex },
        ...(tokens.length > 0
          ? [
              {
                subCategoryTags: {
                  $in: tokens.map((t) => new RegExp(escapeRegex(t), "i")),
                },
              },
            ]
          : []),
      ],
    }).catch(() => []),
    Coupon.distinct("tags", {
      status: "active",
      $or: [
        { tags: regex },
        { tags: flexibleRegex },
        ...(tokens.length > 0
          ? [
              {
                tags: {
                  $in: tokens.map((t) => new RegExp(escapeRegex(t), "i")),
                },
              },
            ]
          : []),
      ],
    }).catch(() => []),
  ]);

  [...(extraSubCatTags || []), ...(extraCouponTags || [])].forEach((tagStr) => {
    if (matchesTag(tagStr)) {
      const key = String(tagStr).toLowerCase().trim();
      if (!matchedTagsMap.has(key)) {
        matchedTagsMap.set(key, {
          id: `tag_${encodeURIComponent(key)}`,
          title: String(tagStr).trim(),
          tag: String(tagStr).trim(),
          type: "Tag",
          subtitle: "Sub-Category Tag Chip",
          href: `/search?q=${encodeURIComponent(String(tagStr).trim())}`,
        });
      }
    }
  });

  const matchedTags = Array.from(matchedTagsMap.values()).slice(0, 8);

  // 3. Query Active & Verified Coupons (Offers) in Depth
  // Matches:
  // - Title (exact, flexible, multi-token across words)
  // - Description
  // - Coupon Code
  // - Category
  // - Tags (including Sub-Category tags)
  // - Merchant's store or tags
  const now = new Date();
  const couponOrConditions = [
    { title: regex },
    { title: flexibleRegex },
    { description: regex },
    { code: regex },
    { category: regex },
    { tags: regex },
    { tags: flexibleRegex },
    ...(matchedMerchantIds.length > 0
      ? [{ merchantId: { $in: matchedMerchantIds } }]
      : []),
  ];

  if (tokens.length > 1) {
    couponOrConditions.push({
      $and: tokens.map((token) => {
        const tRegex = new RegExp(escapeRegex(token), "i");
        return {
          $or: [
            { title: tRegex },
            { description: tRegex },
            { code: tRegex },
            { category: tRegex },
            { tags: tRegex },
            ...(matchedMerchantIds.length > 0
              ? [{ merchantId: { $in: matchedMerchantIds } }]
              : []),
          ],
        };
      }),
    });
  }

  const couponQuery = {
    status: "active",
    isVerified: { $ne: false },
    $and: [
      {
        $or: [
          { expiresAt: { $gt: now } },
          { expiresAt: null },
          { expiresAt: { $exists: false } },
        ],
      },
      { $or: couponOrConditions },
    ],
  };

  // 4. Query Active Affiliate Products in Depth
  // Matches:
  // - Product Title (exact, flexible, multi-token e.g. "milton water bottle")
  // - Product Description
  // - Category
  // - Discount text
  // - Associated merchant name or tags
  const productOrConditions = [
    { title: regex },
    { title: flexibleRegex },
    { description: regex },
    { category: regex },
    { discountText: regex },
    ...(matchedMerchantIds.length > 0
      ? [{ merchantId: { $in: matchedMerchantIds } }]
      : []),
  ];

  if (tokens.length > 1) {
    productOrConditions.push({
      $and: tokens.map((token) => {
        const tRegex = new RegExp(escapeRegex(token), "i");
        return {
          $or: [
            { title: tRegex },
            { description: tRegex },
            { category: tRegex },
            { discountText: tRegex },
            ...(matchedMerchantIds.length > 0
              ? [{ merchantId: { $in: matchedMerchantIds } }]
              : []),
          ],
        };
      }),
    });
  }

  const productQuery = {
    status: "active",
    $or: productOrConditions,
  };

  const [coupons, products] = await Promise.all([
    Coupon.find(couponQuery)
      .select(
        "title code discountType discountValue originalPrice category expiresAt totalClaims merchantId isFeatured tags",
      )
      .populate("merchantId", "businessName slug logo subCategoryTags tags")
      .sort({ isFeatured: -1, totalClaims: -1, createdAt: -1 })
      .limit(limit)
      .lean(),
    AffiliateProduct.find(productQuery)
      .select(
        "title discountPrice originalPrice discountPercentage discountText category imageUrl affiliateUrl merchantId description",
      )
      .populate("merchantId", "businessName slug logo subCategoryTags tags")
      .limit(limit)
      .lean(),
  ]);

  const brands = matchingMerchants;
  const total =
    brands.length +
    coupons.length +
    matchedCategories.length +
    products.length +
    matchedTags.length;

  const result = {
    query: q,
    tags: matchedTags,
    brands: brands.map((b) => ({
      id: String(b._id),
      title: b.businessName,
      slug: b.slug,
      logo: b.logo || "",
      category: b.category || "Brand",
      type: "Brand",
      href: `/brand/${b.slug}`,
      isVerified: b.isVerified ?? true,
      totalCoupons: b.totalCoupons || 0,
      subCategoryTags: b.subCategoryTags || [],
      tags: b.tags || [],
    })),
    coupons: coupons.map((c) => ({
      id: String(c._id),
      title: c.title,
      code: c.code || "",
      discountType: c.discountType,
      discountValue: c.discountValue,
      originalPrice: c.originalPrice,
      category: c.category,
      type: "Offer",
      href: `/deals/${c._id}`,
      tags: c.tags || [],
      merchant: c.merchantId
        ? {
            id: String(c.merchantId._id || c.merchantId),
            name: c.merchantId.businessName || "Partner Store",
            slug: c.merchantId.slug || "",
            logo: c.merchantId.logo || "",
          }
        : null,
    })),
    categories: matchedCategories,
    products: products.map((p) => ({
      id: String(p._id),
      title: p.title,
      discountPrice: p.discountPrice,
      originalPrice: p.originalPrice,
      discountPercentage: p.discountPercentage,
      discountText: p.discountText,
      category: p.category,
      type: "Product",
      href: p.affiliateUrl || "#",
      imageUrl: p.imageUrl || "",
      merchant: p.merchantId
        ? {
            name: p.merchantId.businessName,
            slug: p.merchantId.slug,
            logo: p.merchantId.logo,
          }
        : null,
    })),
    total,
  };

  // Cache in Redis (fire-and-forget, 60 seconds)
  try {
    redis
      .setex(cacheKey, REDIS_TTL.SEARCH_GLOBAL, JSON.stringify(result))
      .catch(() => {});
  } catch (_) {}

  return ok(result);
});
