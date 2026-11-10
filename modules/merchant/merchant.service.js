import mongoose from "mongoose";
import {
  sendMerchantApprovedEmail,
  sendMerchantRejectedEmail,
} from "../../lib/email/merchant-email.js";
import { logger } from "../../lib/logger.js";
import { redis } from "../../lib/redis.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/app-error.js";
import { MERCHANT_STATUS, REDIS_KEYS, REDIS_TTL } from "../../utils/constants.js";
import { buildMeta, parsePagination } from "../../utils/pagination.js";
import UserProfile from "../user/user.model.js";
import Merchant from "./merchant.model.js";

/**
 * Create a merchant profile.
 * One merchant per user — enforced by unique index on authId.
 *
 * @param {string} authId
 * @param {object} data - Validated merchant data
 */
/**
 * Helper to check for duplicate unique fields (email, phone, gstin, pan)
 */
export async function checkMerchantDuplicates(data, excludeMerchantId = null) {
  const { contactEmail, contactPhone, liaisonPhone, gstin } = data || {};

  const baseFilter = excludeMerchantId
    ? { _id: { $ne: excludeMerchantId } }
    : {};

  const emailStr =
    typeof contactEmail === "string" ? contactEmail.trim().toLowerCase() : "";
  if (emailStr) {
    const dupEmail = await Merchant.findOne({
      ...baseFilter,
      contactEmail: emailStr,
    })
      .select("_id")
      .lean();
    if (dupEmail)
      throw new ConflictError(
        "Email address is already registered to another merchant.",
      );
  }

  const phoneStr = String(contactPhone || liaisonPhone || "").trim();
  if (phoneStr) {
    const dupPhone = await Merchant.findOne({
      ...baseFilter,
      $or: [{ contactPhone: phoneStr }, { liaisonPhone: phoneStr }],
    })
      .select("_id")
      .lean();
    if (dupPhone)
      throw new ConflictError(
        "Mobile / Contact phone number is already registered to another merchant.",
      );
  }

  const cleanGstin = String(gstin || "")
    .trim()
    .toUpperCase();
  if (cleanGstin) {
    const dupGstin = await Merchant.findOne({
      ...baseFilter,
      gstin: cleanGstin,
    })
      .select("_id")
      .lean();
    if (dupGstin)
      throw new ConflictError(
        "GSTIN is already registered to another merchant.",
      );
  }
}

/**
 * Helper to generate a 100% unique, meaningful, SEO-friendly brand slug.
 * Prioritizes:
 * 1. Clean brand slug (e.g. "aditya-cars")
 * 2. Brand + City (e.g. "aditya-cars-ranchi")
 * 3. Brand + State (e.g. "aditya-cars-jharkhand")
 * 4. Brand + City + State (e.g. "aditya-cars-ranchi-jharkhand")
 * 5. Brand + Category (e.g. "aditya-cars-automotive")
 * 6. Brand + City + Category (e.g. "aditya-cars-ranchi-automotive")
 * 7. Brand + Location + Counter (e.g. "aditya-cars-ranchi-2", "aditya-cars-ranchi-3")
 */
export async function generateUniqueSlug(
  baseText,
  city = "",
  state = "",
  category = "",
  excludeMerchantId = null,
) {
  let cleanCategory = "";
  let excludeId = excludeMerchantId;

  if (
    typeof category === "object" ||
    (typeof category === "string" && category.match(/^[0-9a-fA-F]{24}$/))
  ) {
    excludeId = category;
    cleanCategory = "";
  } else {
    cleanCategory = String(category || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Strip any legacy random 4 to 6 character suffix (e.g. -g7y6) if baseText contains one
  let rawText = String(baseText || "merchant");
  rawText = rawText.replace(/-[a-z0-9]{4,6}$/i, "");

  let cleanBase = rawText
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  if (!cleanBase) cleanBase = "merchant";

  const filterBase = excludeId ? { _id: { $ne: excludeId } } : {};

  // 1. Try cleanBase directly (e.g., "aditya-cars")
  const existingExact = await Merchant.findOne({
    ...filterBase,
    slug: cleanBase,
  })
    .select("_id")
    .lean();
  if (!existingExact) return cleanBase;

  // 2. Try cleanBase + city suffix (e.g., "aditya-cars-ranchi")
  const cleanCity = String(city || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (cleanCity) {
    const citySlug = `${cleanBase}-${cleanCity}`.slice(0, 80);
    const existingCity = await Merchant.findOne({
      ...filterBase,
      slug: citySlug,
    })
      .select("_id")
      .lean();
    if (!existingCity) return citySlug;
  }

  // 3. Try cleanBase + state suffix (e.g., "aditya-cars-jharkhand")
  const cleanState = String(state || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (cleanState && cleanState !== cleanCity) {
    const stateSlug = `${cleanBase}-${cleanState}`.slice(0, 80);
    const existingState = await Merchant.findOne({
      ...filterBase,
      slug: stateSlug,
    })
      .select("_id")
      .lean();
    if (!existingState) return stateSlug;
  }

  // 4. Try cleanBase + city + state (e.g., "aditya-cars-ranchi-jharkhand")
  if (cleanCity && cleanState && cleanState !== cleanCity) {
    const cityStateSlug = `${cleanBase}-${cleanCity}-${cleanState}`.slice(
      0,
      80,
    );
    const existingCityState = await Merchant.findOne({
      ...filterBase,
      slug: cityStateSlug,
    })
      .select("_id")
      .lean();
    if (!existingCityState) return cityStateSlug;
  }

  // 5. Try cleanBase + category (e.g., "aditya-cars-automotive")
  if (cleanCategory) {
    const categorySlug = `${cleanBase}-${cleanCategory}`.slice(0, 80);
    const existingCategory = await Merchant.findOne({
      ...filterBase,
      slug: categorySlug,
    })
      .select("_id")
      .lean();
    if (!existingCategory) return categorySlug;
  }

  // 6. Try cleanBase + city + category (e.g., "aditya-cars-ranchi-automotive")
  if (cleanCity && cleanCategory) {
    const cityCatSlug = `${cleanBase}-${cleanCity}-${cleanCategory}`.slice(
      0,
      80,
    );
    const existingCityCat = await Merchant.findOne({
      ...filterBase,
      slug: cityCatSlug,
    })
      .select("_id")
      .lean();
    if (!existingCityCat) return cityCatSlug;
  }

  // 7. Try cleanBase + location + store counter (e.g., "aditya-cars-ranchi-2", "aditya-cars-ranchi-3")
  const prefix = cleanCity
    ? `${cleanBase}-${cleanCity}`
    : cleanState
      ? `${cleanBase}-${cleanState}`
      : cleanBase;

  const prefixEscaped = prefix.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const prefixRegex = new RegExp(`^${prefixEscaped}-(\\d+)$`);
  const existingMatches = await Merchant.find(
    { ...filterBase, slug: prefixRegex },
    { slug: 1 },
  ).lean();

  const takenNumbers = new Set(
    existingMatches
      .map((m) => {
        const match = m.slug.match(prefixRegex);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter(Boolean),
  );

  for (let num = 2; num <= 50; num++) {
    if (!takenNumbers.has(num)) {
      return `${prefix}-${num}`.slice(0, 80);
    }
  }

  return `${prefix}-1`;
}

/**
 * Create a merchant profile.
 * One merchant per user — enforced by unique index on authId.
 *
 * @param {string} authId
 * @param {object} data - Validated merchant data
 */
export async function createMerchant(authId, data) {
  const authIdStr = String(authId);
  const existing = await Merchant.findOne({
    $or: [
      { authId: authIdStr },
      ...(data.contactEmail
        ? [{ contactEmail: data.contactEmail.toLowerCase().trim() }]
        : []),
    ],
  });
  if (existing) throw new ConflictError("You already have a merchant profile");

  await checkMerchantDuplicates(data);

  // Auto-resolve slug collision by generating a guaranteed unique, meaningful slug
  const city = data.location?.city || data.city || "";
  const state = data.location?.state || data.state || "";
  const category = data.category || "";
  data.slug = await generateUniqueSlug(
    data.businessName || data.slug,
    city,
    state,
    category,
    null,
  );

  // Normalize document & image aliases from wizard / onboarding forms
  if (
    !data.docImage &&
    (data.docFileUrl || data.docUrl || data.identityDocumentUrl)
  ) {
    data.docImage = data.docFileUrl || data.docUrl || data.identityDocumentUrl;
  }
  if (
    !data.shopImage &&
    (data.shopPhotoUrl || data.shopFrontUrl || data.storePhotoUrl)
  ) {
    data.shopImage =
      data.shopPhotoUrl || data.shopFrontUrl || data.storePhotoUrl;
  }
  if (!data.logo && (data.logoUrl || data.shopLogo)) {
    data.logo = data.logoUrl || data.shopLogo;
  }
  if (!data.banner && (data.bannerUrl || data.shopBanner)) {
    data.banner = data.bannerUrl || data.shopBanner;
  }

  const merchant = await Merchant.create({ authId: authIdStr, ...data });

  // Update user's role to "merchant" in UserProfile and Better Auth user & session collections
  await UserProfile.updateOne(
    { authId: authIdStr },
    { role: "merchant" },
  ).catch(() => {});
  if (mongoose.connection && mongoose.connection.db) {
    const userCol = mongoose.connection.db.collection("user");
    await userCol
      .updateOne({ _id: authIdStr }, { $set: { role: "merchant" } })
      .catch(() => {});
    await userCol
      .updateOne({ id: authIdStr }, { $set: { role: "merchant" } })
      .catch(() => {});
    if (data.contactEmail) {
      await userCol
        .updateOne(
          { email: data.contactEmail.toLowerCase().trim() },
          { $set: { role: "merchant" } },
        )
        .catch(() => {});
    }
    if (mongoose.Types.ObjectId.isValid(authId)) {
      await userCol
        .updateOne(
          { _id: new mongoose.Types.ObjectId(authId) },
          { $set: { role: "merchant" } },
        )
        .catch(() => {});
    }
    const sessionCol = mongoose.connection.db.collection("session");
    await sessionCol
      .updateMany({ userId: authIdStr }, { $set: { role: "merchant" } })
      .catch(() => {});
  }

  return merchant;
}

/**
 * Get a merchant by their MongoDB _id. Throws if not found or not approved.
 *
 * @param {string} merchantId
 * @param {boolean} publicOnly - If true, only return approved merchants
 */
export async function getMerchantById(merchantId, publicOnly = true) {
  const cacheKey = publicOnly ? REDIS_KEYS.merchantPublic(String(merchantId)) : null;
  if (cacheKey) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (_) {}
  }

  const query = { _id: merchantId };
  if (publicOnly) query.status = MERCHANT_STATUS.APPROVED;

  const merchant = await Merchant.findOne(query).lean();
  if (!merchant) throw new NotFoundError("Merchant");

  if (cacheKey) {
    redis.setex(cacheKey, REDIS_TTL.MERCHANT_PUBLIC, JSON.stringify(merchant)).catch(() => {});
  }

  return merchant;
}

/**
 * Get the merchant profile owned by a specific user.
 *
 * @param {string} authId
 * @param {string} [email]
 */
export async function getMerchantByAuthId(authId, email = null) {
  const authIdStr = authId ? String(authId) : null;
  let merchant = null;

  if (authIdStr) {
    merchant = await Merchant.findOne({ authId: authIdStr }).lean();
  }
  if (!merchant && email) {
    merchant = await Merchant.findOne({
      contactEmail: email.toLowerCase().trim(),
    }).lean();
  }
  if (!merchant) throw new NotFoundError("Merchant profile");
  return merchant;
}

/**
 * Update merchant profile. Only the owner can update.
 *
 * @param {string} merchantId
 * @param {string} authId - Requesting user's auth ID
 * @param {object} data - Validated update data
 * @param {string} [userRole="merchant"] - Role of requesting user
 */
export async function updateMerchant(
  merchantId,
  authId,
  data,
  userRole = "merchant",
) {
  const merchant = await Merchant.findOne({ _id: merchantId });
  if (!merchant) throw new ForbiddenError("You cannot edit this merchant");

  // IDOR protection: non-admin users can only edit their own merchant profile.
  // Without this check, any authenticated merchant could edit another merchant
  // by guessing or enumerating merchantId values.
  if (userRole !== "admin" && String(merchant.authId) !== String(authId)) {
    throw new ForbiddenError(
      "You are not authorized to edit this merchant profile",
    );
  }

  // Lock slug for regular merchants: once created, regular merchants CANNOT modify slug.
  // Only super admin (userRole === "admin") can edit an existing slug.
  if (merchant.slug && userRole !== "admin") {
    delete data.slug;
  } else if (data.slug && data.slug !== merchant.slug) {
    const city =
      data.location?.city || data.city || merchant.location?.city || "";
    const state =
      data.location?.state || data.state || merchant.location?.state || "";
    data.slug = await generateUniqueSlug(data.slug, city, state, merchant._id);
  }

  await checkMerchantDuplicates(data, merchant._id);

  // Normalize document & image aliases from wizard / onboarding forms
  if (
    !data.docImage &&
    (data.docFileUrl || data.docUrl || data.identityDocumentUrl)
  ) {
    data.docImage = data.docFileUrl || data.docUrl || data.identityDocumentUrl;
  }
  if (
    !data.shopImage &&
    (data.shopPhotoUrl || data.shopFrontUrl || data.storePhotoUrl)
  ) {
    data.shopImage =
      data.shopPhotoUrl || data.shopFrontUrl || data.storePhotoUrl;
  }
  if (!data.logo && (data.logoUrl || data.shopLogo)) {
    data.logo = data.logoUrl || data.shopLogo;
  }
  if (!data.banner && (data.bannerUrl || data.shopBanner)) {
    data.banner = data.bannerUrl || data.shopBanner;
  }

  const keyKycFieldsChanged =
    data.docImage && data.docImage !== merchant.docImage;

  if (data.gstin !== undefined) {
    const cleanGstin = (data.gstin || "").trim().toUpperCase();
    if (!cleanGstin) {
      data.gstin = undefined;
      merchant.gstin = undefined;
    } else {
      data.gstin = cleanGstin;
    }
  }

  Object.assign(merchant, data);

  if (keyKycFieldsChanged && merchant.status === MERCHANT_STATUS.APPROVED) {
    merchant.status = MERCHANT_STATUS.PENDING;
    merchant.isVerified = false;
  }
  if (data.operatingHours) {
    merchant.markModified("operatingHours");
  }

  await merchant.save();

  // Keep user role as merchant when updating merchant profile
  const userRoleToSync = "merchant";
  const userCol = mongoose.connection.db?.collection("user");

  await Promise.all([
    UserProfile.findOneAndUpdate(
      { authId: merchant.authId },
      { $set: { role: userRoleToSync } },
      { upsert: true },
    ),
    userCol
      ?.updateOne({ _id: merchant.authId }, { $set: { role: userRoleToSync } })
      .catch(() => {}),
    ...(mongoose.Types.ObjectId.isValid(merchant.authId)
      ? [
          userCol
            ?.updateOne(
              { _id: new mongoose.Types.ObjectId(merchant.authId) },
              { $set: { role: userRoleToSync } },
            )
            .catch(() => {}),
        ]
      : []),
  ]);

  invalidateMerchantPublicCaches(merchant).catch(() => {});

  return merchant;
}

/**
 * Admin: list all merchants with pagination and filters.
 * Uses batch lookup for user profiles to eliminate N+1 database queries.
 */
export async function listMerchants(searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  const filter = {};
  if (status) filter.status = status;

  if (search && search.trim()) {
    const q = search.trim();
    filter.$or = [
      { businessName: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } },
      { contactEmail: { $regex: q, $options: "i" } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder, _id: -1 };

  const [merchantsRaw, total] = await Promise.all([
    Merchant.find(filter)
      .skip(skip)
      .limit(limit)
      .sort(sort)
      .lean(),
    Merchant.countDocuments(filter),
  ]);

  const userCol = mongoose.connection.db?.collection("user");
  const userMap = new Map();

  if (userCol && merchantsRaw.length > 0) {
    const rawIds = merchantsRaw.map((m) => m.authId).filter(Boolean);
    const validObjectIds = rawIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    const users = await userCol
      .find(
        { _id: { $in: [...rawIds, ...validObjectIds] } },
        { projection: { name: 1, email: 1 } },
      )
      .toArray()
      .catch(() => []);

    for (const u of users) {
      userMap.set(String(u._id), u);
    }
  }

  const merchants = merchantsRaw.map((m) => {
    const uDoc = m.authId ? userMap.get(String(m.authId)) : null;
    return {
      ...m,
      userId: uDoc ? { name: uDoc.name, email: uDoc.email } : null,
    };
  });

  return { merchants, meta: buildMeta(total, page, limit) };
}

/**
 * Admin: approve or reject a merchant.
 *
 * @param {string} merchantId
 * @param {"approved" | "rejected"} status
 * @param {string} [rejectionReason]
 */
export async function reviewMerchant(merchantId, status, rejectionReason) {
  const update = { status };
  if (status === MERCHANT_STATUS.APPROVED) {
    update.isVerified = true;
  } else if (status === MERCHANT_STATUS.REJECTED) {
    update.isVerified = false;
    if (rejectionReason) {
      update.rejectionReason = rejectionReason;
    }
  }

  const merchant = await Merchant.findByIdAndUpdate(
    merchantId,
    { $set: update },
    { new: true },
  );

  if (!merchant) throw new NotFoundError("Merchant");

  // Keep user role as "merchant" so the owner remains a merchant account
  const userRole = "merchant";
  const userCol = mongoose.connection.db?.collection("user");

  const authIdStr = merchant.authId ? String(merchant.authId) : null;
  const sessionCol = mongoose.connection.db?.collection("session");

  await Promise.all([
    ...(authIdStr
      ? [
          UserProfile.findOneAndUpdate(
            { authId: authIdStr },
            { $set: { role: userRole } },
            { upsert: true },
          ),
          userCol
            ?.updateOne({ _id: authIdStr }, { $set: { role: userRole } })
            .catch(() => {}),
          userCol
            ?.updateOne({ id: authIdStr }, { $set: { role: userRole } })
            .catch(() => {}),
          ...(mongoose.Types.ObjectId.isValid(authIdStr)
            ? [
                userCol
                  ?.updateOne(
                    { _id: new mongoose.Types.ObjectId(authIdStr) },
                    { $set: { role: userRole } },
                  )
                  .catch(() => {}),
              ]
            : []),
        ]
      : []),
    ...(merchant.contactEmail
      ? [
          userCol
            ?.updateOne(
              { email: merchant.contactEmail.toLowerCase().trim() },
              { $set: { role: userRole } },
            )
            .catch(() => {}),
        ]
      : []),
  ]);

  // Synchronously evict & sync all active sessions and profile caches from Redis
  try {
    if (authIdStr) {
      await redis.del(REDIS_KEYS.merchantProfile(authIdStr)).catch(() => {});
      await redis.del(REDIS_KEYS.userRole(authIdStr)).catch(() => {});
    }
    if (merchant._id) {
      await redis
        .del(REDIS_KEYS.merchantBadges(String(merchant._id)))
        .catch(() => {});
    }
    if (sessionCol) {
      const userSessions = await sessionCol
        .find({
          $or: [
            ...(authIdStr ? [{ userId: authIdStr }] : []),
            ...(mongoose.Types.ObjectId.isValid(authIdStr)
              ? [{ userId: new mongoose.Types.ObjectId(authIdStr) }]
              : []),
          ],
        })
        .toArray()
        .catch(() => []);

      for (const s of userSessions) {
        if (s.token) {
          await redis.del(REDIS_KEYS.session(s.token)).catch(() => {});
          await redis.del(`auth:session:${s.token}`).catch(() => {});
        }
      }

      await sessionCol
        .updateMany(
          {
            $or: [
              ...(authIdStr ? [{ userId: authIdStr }] : []),
              ...(mongoose.Types.ObjectId.isValid(authIdStr)
                ? [{ userId: new mongoose.Types.ObjectId(authIdStr) }]
                : []),
            ],
          },
          { $set: { role: userRole } },
        )
        .catch(() => {});
    }
  } catch (cacheErr) {
    logger.warn({ err: cacheErr }, "[reviewMerchant Cache Evict Error]");
  }

  // Dispatch Email Notification to Merchant on Approval / Rejection
  try {
    let targetEmail = merchant.contactEmail;
    if (!targetEmail && merchant.authId && userCol) {
      const uDoc = await userCol
        .findOne({ _id: merchant.authId })
        .catch(() => null);
      targetEmail = uDoc?.email;
    }

    if (targetEmail) {
      if (status === MERCHANT_STATUS.APPROVED) {
        sendMerchantApprovedEmail({
          to: targetEmail,
          businessName: merchant.businessName,
          liaisonName: merchant.liaisonName,
        }).catch((err) =>
          logger.error(
            { err, merchantId },
            "Merchant approved email dispatch error",
          ),
        );
      } else if (status === MERCHANT_STATUS.REJECTED) {
        sendMerchantRejectedEmail({
          to: targetEmail,
          businessName: merchant.businessName,
          liaisonName: merchant.liaisonName,
          rejectionReason: merchant.rejectionReason || rejectionReason,
        }).catch((err) =>
          logger.error(
            { err, merchantId },
            "Merchant rejected email dispatch error",
          ),
        );
      }
    }
  } catch (err) {
    logger.error({ err, merchantId }, "Review merchant email dispatch failure");
  }

  return merchant;
}


export async function invalidateMerchantPublicCaches(merchant) {
  try {
    const keysToDel = [
      REDIS_KEYS.BRANDS_LIST,
      REDIS_KEYS.MERCHANTS_LIST,
      REDIS_KEYS.HOMEPAGE_DATA,
      REDIS_KEYS.PLATFORM_STATS,
    ];
    if (merchant) {
      if (merchant.authId) keysToDel.push(REDIS_KEYS.merchantProfile(String(merchant.authId)));
      if (merchant._id) {
        keysToDel.push(REDIS_KEYS.merchantBadges(String(merchant._id)));
        keysToDel.push(REDIS_KEYS.merchantPublic(String(merchant._id)));
      }
      if (merchant.slug) keysToDel.push(REDIS_KEYS.brandDetail(String(merchant.slug).toLowerCase()));
    }
    await Promise.allSettled(keysToDel.map((k) => redis.del(k)));
  } catch (_) {}
}
