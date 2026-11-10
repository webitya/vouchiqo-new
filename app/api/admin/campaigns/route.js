import { connectDB } from "@/lib/mongodb";
import { dispatchEvent } from "@/lib/socket/dispatcher";
import { SOCKET_EVENTS } from "@/lib/socket/events";
import { requireRole } from "@/modules/auth/auth.middleware";
import Campaign from "@/modules/merchant/campaign.model";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/admin/campaigns
 * List all campaigns across merchants for admin queue & moderation.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const campaigns = await Campaign.find(filter)
    .populate({
      path: "merchantId",
      select: "authId userId businessName contactEmail plan logo category",
    })
    .sort({ createdAt: -1 })
    .lean();

  return ok({ campaigns });
});

/**
 * POST /api/admin/campaigns
 * Create a new platform festival / marketing campaign package directly.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  let merchantId = body.merchantId;

  if (!merchantId) {
    const defaultMerchant = await Merchant.findOne().lean();
    if (defaultMerchant) {
      merchantId = defaultMerchant._id;
    }
  }

  const campaign = await Campaign.create({
    merchantId,
    name: body.name || "Festival Campaign Package",
    type: body.type || "festival",
    objective: body.objective || "festival_boost",
    headline: body.headline || body.name,
    subHeadline: body.subHeadline || "",
    description: body.description || "",
    bannerUrl: body.bannerUrl || "",
    timing: {
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate
        ? new Date(body.endDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      hasCountdownTimer: body.hasCountdownTimer !== false,
      hasPreTeaser: Boolean(body.hasPreTeaser),
      preTeaserHeadline: body.preTeaserHeadline || "",
    },
    targeting: {
      audience: body.audience || "all",
      targetCity: body.targetCity || "Ranchi",
      addOns: body.addOns || [
        "Homepage Featured Slot (₹999)",
        "Targeted Push Notification (₹599)",
        "Flash Campaign Boost (₹799)",
      ],
      preferredEmailSubject: body.emailSubject || "",
    },
    settings: {
      homepageSlot: true,
      pushNotification: true,
      newsletter: true,
    },
    status: body.status || "live",
    startDate: body.startDate ? new Date(body.startDate) : new Date(),
    endDate: body.endDate
      ? new Date(body.endDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const populated = await Campaign.findById(campaign._id).populate("merchantId", "businessName plan logo");

  await dispatchEvent({
    target: "admins",
    event: SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED,
    payload: {
      campaignId: campaign._id,
      status: campaign.status,
      name: campaign.name,
    },
  });

  return ok({ campaign: populated }, "Festival Campaign Package created & deployed successfully");
});

/**
 * PUT /api/admin/campaigns
 * Moderate campaign: approve, reject, or request changes.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const body = await request.json();
  const {
    campaignId,
    status,
    rejectionReason,
    requestNotes,
    scheduleDate,
    pauseReason,
    capLimit,
  } = body;

  if (!campaignId) {
    throw new Error("Campaign ID is required");
  }

  const update = {};
  if (status) update.status = status;
  if (rejectionReason) update.rejectionReason = rejectionReason;
  if (requestNotes) update.requestNotes = requestNotes;
  if (pauseReason) update.pauseReason = pauseReason;
  if (capLimit) update["offerDetails.redemptionLimit"] = capLimit;
  if (scheduleDate) update.startDate = new Date(scheduleDate);

  const campaign = await Campaign.findByIdAndUpdate(
    campaignId,
    { $set: update },
    { new: true },
  ).populate({
    path: "merchantId",
    select: "authId userId businessName contactEmail plan logo category",
  });

  const targetUserId = campaign?.merchantId?.authId || campaign?.merchantId?.userId;

  const payload = {
    campaignId: campaign._id || campaign.id,
    status: campaign.status,
    name: campaign.name,
    rejectionReason: campaign.rejectionReason || "",
  };

  // Broadcast to Admin desk
  await dispatchEvent({ target: "admins", event: SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED, payload });

  // Direct socket & DB notification to merchant owner
  if (targetUserId) {
    const isApproved = campaign.status === "active" || campaign.status === "approved";
    const isRejected = campaign.status === "rejected";

    await dispatchEvent({
      target: "user",
      userId: String(targetUserId),
      event: SOCKET_EVENTS.CAMPAIGN_STATUS_CHANGED,
      payload,
      notify: {
        userId: String(targetUserId),
        type: isApproved ? "campaign_approved" : isRejected ? "campaign_rejected" : "campaign_status_changed",
        category: "campaign",
        title: isApproved
          ? "Campaign Approved & Live"
          : isRejected
            ? "Campaign Rejected"
            : `Campaign Status Updated (${campaign.status})`,
        message: isApproved
          ? `Your promotional campaign '${campaign.name}' has been verified and approved.`
          : isRejected
            ? `Your campaign '${campaign.name}' was rejected: ${campaign.rejectionReason || "Please review guidelines."}`
            : `Campaign '${campaign.name}' status is now ${campaign.status}.`,
        metadata: payload,
      },
    });
  }

  return ok({ campaign }, "Campaign updated successfully");
});
