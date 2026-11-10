import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import Campaign from "@/modules/merchant/campaign.model";
import Merchant from "@/modules/merchant/merchant.model";
import Payment from "@/modules/payment/payment.model";
import { ok } from "@/utils/api-response";
import { ForbiddenError, NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * POST /api/merchants/me/flash-sale-pass
 * Activates the 1-time promotional Flash Sale Campaign Pass (₹799) for free/starter merchants.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireRole(request, ROLES.MERCHANT);

  const merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant) {
    throw new NotFoundError("Merchant profile");
  }

  // Check if free merchant has already created a campaign or used their 1-time pass
  const existingCampaignCount = await Campaign.countDocuments({
    merchantId: merchant._id,
  });

  if (merchant.flashSaleCampaignUsed || existingCampaignCount >= 1) {
    throw new ForbiddenError(
      "You have already availed your 1-time promotional Flash Sale Campaign on the Free Plan. Please upgrade to the Growth Plan for unlimited campaigns.",
    );
  }

  const body = await request.json().catch(() => ({}));
  const { orderId, paymentId, simulate } = body;

  // Activate the 1-time pass
  merchant.flashSalePurchased = true;
  merchant.flashSalePurchasedAt = new Date();
  await merchant.save();

  // Create payment record for audit and billing history
  try {
    await Payment.create({
      merchantId: merchant._id,
      amount: 799,
      currency: "INR",
      status: "CAPTURED",
      type: "ADDON",
      gatewayOrderId: orderId || `sim_ord_${Date.now()}`,
      gatewayPaymentId: paymentId || `sim_pay_${Date.now()}`,
      metadata: {
        addOnId: "flash_sale_pass",
        name: "1-Time Flash Sale Campaign Pass",
        amount: 799,
        simulate: !!simulate,
      },
      paidAt: new Date(),
    });
  } catch (err) {
    console.error("[FlashSalePass Payment Record Warning]:", err);
  }

  return ok(
    {
      flashSalePurchased: true,
      flashSalePurchasedAt: merchant.flashSalePurchasedAt,
    },
    "Flash Sale Campaign Pass (₹799) activated successfully! You can now launch your Flash Sale campaign.",
  );
});
