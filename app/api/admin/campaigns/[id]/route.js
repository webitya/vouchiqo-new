import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Campaign from "@/modules/merchant/campaign.model";
import { ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

/**
 * GET /api/admin/campaigns/[id]
 * Get single campaign details populated with merchant for admin review.
 */
export const GET = asyncHandler(async (request, { params }) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { id } = await params;

  const campaign = await Campaign.findById(id)
    .populate({
      path: "merchantId",
      select: "businessName contactEmail plan logo category location",
    })
    .lean();

  if (!campaign) {
    throw new NotFoundError("Campaign");
  }

  return ok({ campaign });
});

/**
 * PUT /api/admin/campaigns/[id]
 * Moderate specific campaign.
 */
export const PUT = asyncHandler(async (request, { params }) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { id } = await params;
  const body = await request.json();

  const campaign = await Campaign.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true },
  ).populate({
    path: "merchantId",
    select: "businessName contactEmail plan logo category location",
  });

  if (!campaign) {
    throw new NotFoundError("Campaign");
  }

  return ok({ campaign }, "Campaign updated successfully");
});
