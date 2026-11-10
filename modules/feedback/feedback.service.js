import Merchant from "../merchant/merchant.model.js";
import Feedback from "./feedback.model.js";

/**
 * Submit or update process-based feedback.
 */
export async function submitProcessFeedback({
  authId,
  merchantId = null,
  processType = "profile_completion",
  starRating,
  scaleScore = 80,
  selectedTags = [],
  comment = "",
  profileHealthAtSubmission = 100,
  metadata = {},
}) {
  if (!authId) throw new Error("Authentication ID is required.");
  if (!starRating || starRating < 1 || starRating > 5) {
    throw new Error("Star rating must be between 1 and 5.");
  }

  let merchantName = "";
  let merchantEmail = "";
  let effectiveMerchantId = merchantId;

  if (!effectiveMerchantId && authId) {
    const merchant = await Merchant.findOne({ authId }).lean();
    if (merchant) {
      effectiveMerchantId = merchant._id;
      merchantName = merchant.businessName || "";
      merchantEmail = merchant.contactEmail || "";
    }
  } else if (effectiveMerchantId) {
    const merchant = await Merchant.findById(effectiveMerchantId).lean();
    if (merchant) {
      merchantName = merchant.businessName || "";
      merchantEmail = merchant.contactEmail || "";
    }
  }

  const feedback = await Feedback.findOneAndUpdate(
    { authId, processType },
    {
      $set: {
        merchantId: effectiveMerchantId,
        authId,
        merchantName,
        merchantEmail,
        processType,
        starRating: Number(starRating),
        scaleScore: Math.min(100, Math.max(0, Number(scaleScore))),
        selectedTags: Array.isArray(selectedTags) ? selectedTags : [],
        comment: String(comment || "")
          .trim()
          .slice(0, 1000),
        dismissed: false,
        profileHealthAtSubmission: Number(profileHealthAtSubmission || 100),
        metadata,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return feedback;
}

/**
 * Check if the merchant has already submitted or dismissed feedback for this processType.
 */
export async function getFeedbackStatus(
  authId,
  processType = "profile_completion",
) {
  if (!authId)
    return { hasSubmitted: false, hasDismissed: false, feedback: null };

  const feedback = await Feedback.findOne({ authId, processType }).lean();
  if (!feedback) {
    return { hasSubmitted: false, hasDismissed: false, feedback: null };
  }

  return {
    hasSubmitted: !feedback.dismissed,
    hasDismissed: Boolean(feedback.dismissed),
    feedback,
  };
}

/**
 * Record a voluntary dismissal
 */
export async function dismissProcessFeedback(
  authId,
  processType = "profile_completion",
) {
  if (!authId) return null;

  return Feedback.findOneAndUpdate(
    { authId, processType },
    {
      $set: {
        authId,
        processType,
        dismissed: true,
        starRating: 5,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
}
