import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import {
  dismissProcessFeedback,
  getFeedbackStatus,
  submitProcessFeedback,
} from "@/modules/feedback/feedback.service";
import { error, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * GET /api/feedback/process?processType=profile_completion
 * Checks if the current user has already submitted or dismissed feedback for this process.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);

  const { searchParams } = new URL(request.url);
  const processType = searchParams.get("processType") || "profile_completion";

  const status = await getFeedbackStatus(user.id, processType);
  return ok(status);
});

/**
 * POST /api/feedback/process
 * Submits process-based feedback (stars, scale score, tags, comments) or dismisses it.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);

  const body = await request.json();
  const {
    action,
    processType = "profile_completion",
    merchantId,
    starRating,
    scaleScore = 80,
    selectedTags = [],
    comment = "",
    profileHealthAtSubmission = 100,
  } = body || {};

  // Handle explicit dismissal ("Maybe Later" / skip)
  if (action === "dismiss") {
    const dismissed = await dismissProcessFeedback(user.id, processType);
    return ok({ dismissed: true, message: "Feedback dismissed." });
  }

  if (!starRating || Number(starRating) < 1 || Number(starRating) > 5) {
    return error("Star rating must be between 1 and 5.", 400, "INVALID_RATING");
  }

  const feedback = await submitProcessFeedback({
    authId: user.id,
    merchantId,
    processType,
    starRating: Number(starRating),
    scaleScore: Number(scaleScore),
    selectedTags: Array.isArray(selectedTags) ? selectedTags : [],
    comment: String(comment || "").trim(),
    profileHealthAtSubmission: Number(profileHealthAtSubmission || 100),
  });

  return ok({
    feedback,
    message: "Thank you for your valuable feedback!",
  });
});
