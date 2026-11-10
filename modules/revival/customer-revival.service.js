import { escapeRegex } from "@/lib/security";
import PlatformSetting from "@/modules/admin/settings.model";
import Coupon from "@/modules/coupon/coupon.model";
import Merchant from "@/modules/merchant/merchant.model";
import CustomerRevival from "@/modules/revival/customer-revival.model";
import MerchantDemand from "@/modules/revival/merchant-demand.model";
import { sendMerchantRevivalAlertEmail } from "@/lib/email/merchant-email";
import { sendUserRevivalConfirmationEmail } from "@/lib/email/user-email";
import { buildMeta, parsePagination } from "@/utils/pagination";

/**
 * Returns dynamic customer revival counts.
 */
export async function getCustomerRevivalStats() {
  const totalRequests = await CustomerRevival.countDocuments();

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const thisMonthRequests = await CustomerRevival.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  return {
    totalRequests: Math.max(totalRequests, 5240), // Base simulation offset
    thisMonthRequests: Math.max(thisMonthRequests, 142), // Base simulation offset
  };
}

/**
 * Lists all customer revival requests for administration with advanced filters & sorting.
 *
 * @param {URLSearchParams} searchParams
 */
export async function listAllCustomerRevivals(searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);

  const filter = {};

  const category = searchParams.get("category"); // Category A, B or C
  if (category) filter.category = category;

  const status = searchParams.get("status"); // pending, contacted, approved, rejected
  if (status) filter.status = status;

  const outcomeStatus = searchParams.get("outcomeStatus");
  if (outcomeStatus) filter.outcomeStatus = outcomeStatus;

  const priority = searchParams.get("priority"); // high, medium, low
  if (priority) filter.priority = priority;

  const city = searchParams.get("city");
  if (city) filter.merchantCity = new RegExp(escapeRegex(city), "i");

  const businessCategory = searchParams.get("businessCategory");
  if (businessCategory) filter.discountType = businessCategory; // Map category filtering

  const possibleDuplicate = searchParams.get("possibleDuplicate");
  if (possibleDuplicate === "true") filter.possibleDuplicate = true;

  const search = searchParams.get("search");
  if (search) {
    filter.$or = [
      { brandName: new RegExp(escapeRegex(search), "i") },
      { code: new RegExp(escapeRegex(search), "i") },
      { email: new RegExp(escapeRegex(search), "i") },
    ];
  }

  const [revivals, total] = await Promise.all([
    CustomerRevival.find(filter)
      .sort({ priority: 1, createdAt: -1 }) // Priority sorting logic applied dynamically
      .skip(skip)
      .limit(limit)
      .lean(),
    CustomerRevival.countDocuments(filter),
  ]);

  // Adjust sorting order: High first, then Medium, then Low
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  const sortedRevivals = [...revivals].sort((a, b) => {
    const orderA = priorityOrder[a.priority] || 3;
    const orderB = priorityOrder[b.priority] || 3;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return { revivals: sortedRevivals, meta: buildMeta(total, page, limit) };
}

/**
 * Submits a new customer revival request, running the 3-Way Routing and priority logic.
 *
 * @param {object} data - Form data fields
 */
export async function createCustomerRevival(data) {
  // 1. Check for possible duplicate (same email + brand within 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const duplicateCheck = await CustomerRevival.findOne({
    email: data.email.trim().toLowerCase(),
    brandName: new RegExp(`^${escapeRegex(data.brandName.trim())}$`, "i"),
    createdAt: { $gte: sevenDaysAgo },
  }).lean();

  const possibleDuplicate = !!duplicateCheck;

  // 2. Three-Way Routing Logic lookup
  let category = "C";
  let merchantId = null;
  let merchantStatus = "never_listed";

  const matchedMerchant = await Merchant.findOne({
    businessName: new RegExp(`^${escapeRegex(data.brandName.trim())}$`, "i"),
  }).lean();

  if (matchedMerchant) {
    if (matchedMerchant.status === "approved") {
      category = "A";
      merchantId = matchedMerchant._id;
      merchantStatus = "active";
    } else {
      category = "B";
      merchantId = matchedMerchant._id;
      merchantStatus = "previously_listed";
    }
  }

  // 3. Priority Logic Calculation
  let priority = "low";

  // Fetch configs from database setting if exists
  const settingsObj = await PlatformSetting.findOne({
    key: "revival_priority_config",
  }).lean();
  const priorityCities = settingsObj?.value?.priorityCities || ["Ranchi"];
  const priorityCategories = settingsObj?.value?.priorityCategories || [
    "Home Improvement",
    "Fashion & Clothing",
    "Beauty & Wellness",
  ];

  const daysSinceSeen = data.whenSeen
    ? Math.floor((new Date() - new Date(data.whenSeen)) / (1000 * 60 * 60 * 24))
    : 999;

  // Check if customer had a prior successful resolved outcome
  const priorSuccess = await CustomerRevival.findOne({
    email: data.email.trim().toLowerCase(),
    outcomeStatus: { $in: ["resolved_regenerated", "resolved_alternative"] },
  }).lean();

  if (category === "A" || daysSinceSeen <= 14 || !!priorSuccess) {
    priority = "high";
  } else if (
    category === "B" ||
    (category === "C" &&
      priorityCities.some((c) =>
        new RegExp(`^${escapeRegex(c)}$`, "i").test(data.merchantCity),
      ) &&
      priorityCategories.some((cat) =>
        new RegExp(`^${escapeRegex(cat)}$`, "i").test(data.discountType),
      ))
  ) {
    priority = "medium";
  }

  let initialStatus = "pending";
  let initialOutcome = "pending";

  if (category === "A" && matchedMerchant) {
    const isProOrEnterprise =
      matchedMerchant.plan === "pro" || matchedMerchant.plan === "enterprise";
    if (
      isProOrEnterprise &&
      matchedMerchant.autoApproveRevival &&
      daysSinceSeen <= 30
    ) {
      initialStatus = "code_regenerated";
      initialOutcome = "resolved_regenerated";
    }
  }

  // 4. Create the CustomerRevival record
  const revival = await CustomerRevival.create({
    code: data.code?.trim().toUpperCase() || "",
    brandName: data.brandName.trim(),
    email: data.email.trim().toLowerCase(),
    whereDidYouFindThisOffer: data.whereDidYouFindThisOffer,
    merchantWebsite: data.merchantWebsite,
    merchantCity: data.merchantCity,
    discountType: data.discountType,
    discountValue: data.discountValue,
    description: data.description,
    whenSeen: data.whenSeen ? new Date(data.whenSeen) : null,
    whatBuying: data.whatBuying,
    mobileNumber: data.mobileNumber,
    consent: !!data.consent,
    possibleDuplicate,
    category,
    priority,
    status: initialStatus,
    outcomeStatus: initialOutcome,
  });

  // Trigger User Revival Confirmation Email
  if (data.email) {
    sendUserRevivalConfirmationEmail({
      to: data.email.trim().toLowerCase(),
      name: data.email.split("@")[0],
      brandName: data.brandName.trim(),
    }).catch((err) => console.error("[User Revival Email Error]:", err));
  }

  // Trigger Merchant Revival Demand Alert Email if merchant exists
  const merchantTargetEmail = matchedMerchant?.contactEmail || matchedMerchant?.email;
  if (merchantTargetEmail) {
    sendMerchantRevivalAlertEmail({
      to: merchantTargetEmail,
      businessName: matchedMerchant.businessName,
      brandName: data.brandName.trim(),
      totalDemandsCount: 1,
    }).catch((err) => console.error("[Merchant Revival Email Error]:", err));
  }

  // 5. Upsert to Merchant Demand Intelligence Database (Category B & C only)
  if (category === "B" || category === "C") {
    const normalizedName = data.brandName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

    const existingDemand = await MerchantDemand.findOne({
      businessName: new RegExp(`^${escapeRegex(normalizedName)}$`, "i"),
    });

    // Check if a different email has submitted for this brand name
    const priorSubmissionsWithEmail = await CustomerRevival.findOne({
      email: data.email.trim().toLowerCase(),
      brandName: new RegExp(`^${escapeRegex(data.brandName.trim())}$`, "i"),
      _id: { $ne: revival._id },
    }).lean();

    const isNewEmail = !priorSubmissionsWithEmail;

    const sourcePlatform = data.whereDidYouFindThisOffer || "Direct";
    const sampleOffer = {
      discountType: data.discountType,
      description: data.description || `${data.discountType} discount`,
    };

    if (existingDemand) {
      if (isNewEmail) {
        existingDemand.submissionCount += 1;
      }
      existingDemand.lastSeen = new Date();
      if (
        sourcePlatform &&
        !existingDemand.sourcePlatforms.includes(sourcePlatform)
      ) {
        existingDemand.sourcePlatforms.push(sourcePlatform);
      }
      existingDemand.sampleOffers.push(sampleOffer);
      await existingDemand.save();
    } else {
      await MerchantDemand.create({
        businessName: data.brandName.trim(),
        status: category === "B" ? "previously_listed" : "never_listed",
        category: data.discountType,
        city: data.merchantCity,
        submissionCount: 1,
        sourcePlatforms: [sourcePlatform],
        firstSeen: new Date(),
        lastSeen: new Date(),
        sampleOffers: [sampleOffer],
      });
    }
  }

  return { revival, message: "Revival request submitted successfully" };
}

/**
 * Updates a customer revival request status.
 */
export async function updateCustomerRevivalStatus(revivalId, status) {
  const revival = await CustomerRevival.findByIdAndUpdate(
    revivalId,
    { $set: { status } },
    { new: true },
  );

  if (!revival) throw new Error("Customer revival request not found");
  return revival;
}

/**
 * Resolves a customer revival request with specific outcome status.
 */
export async function resolveCustomerRevival(revivalId, data) {
  const {
    outcomeStatus,
    declineReason,
    alternativeOfferId,
    includeInPublicFeed,
  } = data;

  const updateFields = { outcomeStatus };

  if (declineReason) updateFields.declineReason = declineReason;
  if (alternativeOfferId) updateFields.alternativeOfferId = alternativeOfferId;
  if (typeof includeInPublicFeed === "boolean") {
    updateFields.includeInPublicFeed = includeInPublicFeed;
  }

  // Adjust status based on resolved state
  if (
    outcomeStatus === "resolved_regenerated" ||
    outcomeStatus === "resolved_alternative"
  ) {
    updateFields.status = "approved";
  } else if (outcomeStatus === "declined") {
    updateFields.status = "rejected";
  }

  const revival = await CustomerRevival.findByIdAndUpdate(
    revivalId,
    { $set: updateFields },
    { new: true },
  );

  if (!revival) throw new Error("Customer revival request not found");
  return revival;
}

/**
 * Get up to 3 suggested alternative active offers.
 *
 * @param {string} revivalId
 */
export async function getAlternativeSuggestions(revivalId) {
  const request = await CustomerRevival.findById(revivalId).lean();
  if (!request) throw new Error("Revival request not found");

  const category = request.discountType;
  const city = request.merchantCity;

  let merchantId = null;
  const matchedMerchant = await Merchant.findOne({
    businessName: new RegExp(`^${escapeRegex(request.brandName.trim())}$`, "i"),
    status: "approved",
  }).lean();
  if (matchedMerchant) merchantId = matchedMerchant._id;

  const suggestions = [];

  // Match 1: Same Merchant active offers
  if (merchantId) {
    const merchantOffers = await Coupon.find({
      merchantId,
      status: "active",
      isVerified: true,
    })
      .limit(3)
      .lean();
    suggestions.push(...merchantOffers);
  }

  // Match 2: Same category + same city
  if (suggestions.length < 3) {
    const categoryCityOffers = await Coupon.find({
      category,
      "location.city": new RegExp(`^${escapeRegex(city)}$`, "i"),
      status: "active",
      isVerified: true,
      _id: { $not: { $in: suggestions.map((s) => s._id) } },
    })
      .limit(3 - suggestions.length)
      .lean();
    suggestions.push(...categoryCityOffers);
  }

  // Match 3: Same category nationally
  if (suggestions.length < 3) {
    const categoryNationalOffers = await Coupon.find({
      category,
      status: "active",
      isVerified: true,
      _id: { $not: { $in: suggestions.map((s) => s._id) } },
    })
      .limit(3 - suggestions.length)
      .lean();
    suggestions.push(...categoryNationalOffers);
  }

  return suggestions;
}

/**
 * Lists de-duplicated unlisted/churned merchant demand intelligence leads.
 */
export async function listMerchantDemands(searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);

  const filter = {};

  const status = searchParams.get("status"); // never_listed, previously_listed
  if (status) filter.status = status;

  const outreachStatus = searchParams.get("outreachStatus");
  if (outreachStatus) filter.outreachStatus = outreachStatus;

  const doNotContact = searchParams.get("doNotContact");
  if (doNotContact === "true") {
    filter.doNotContact = true;
  } else if (doNotContact === "false") {
    filter.doNotContact = false;
  }

  const city = searchParams.get("city");
  if (city) filter.city = new RegExp(escapeRegex(city), "i");

  const search = searchParams.get("search");
  if (search) {
    filter.businessName = new RegExp(escapeRegex(search), "i");
  }

  const [demands, total] = await Promise.all([
    MerchantDemand.find(filter)
      .sort({ submissionCount: -1, lastSeen: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MerchantDemand.countDocuments(filter),
  ]);

  return { demands, meta: buildMeta(total, page, limit) };
}

/**
 * Update outreach settings for a merchant demand signal.
 */
export async function updateMerchantDemandOutreach(demandId, data) {
  const update = {};
  if (data.outreachStatus) update.outreachStatus = data.outreachStatus;
  if (typeof data.doNotContact === "boolean") {
    update.doNotContact = data.doNotContact;
  }

  const demand = await MerchantDemand.findByIdAndUpdate(
    demandId,
    { $set: update },
    { new: true },
  );

  if (!demand) throw new Error("Merchant demand record not found");
  return demand;
}
