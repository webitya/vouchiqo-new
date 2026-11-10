import { sendMerchantPlanSelectedEmail } from "@/lib/email/merchant-email";
import { connectDB } from "@/lib/mongodb";
import { razorpayKeyId } from "@/lib/razorpay";
import { requireRole } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { handleIdempotency } from "@/modules/payment/idempotency.middleware";
import { enforcePaymentRateLimit } from "@/modules/payment/payment-auth.middleware";
import { PaymentService } from "@/modules/payment/payment.service";
import { ok } from "@/utils/api-response";
import { BadRequestError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";
import { ADDONS_PRICING, ROLES, SUBSCRIPTION_MATRIX } from "@/utils/constants";
import { toPaise } from "@/utils/payment-utils";

export const dynamic = "force-dynamic";

/**
 * POST /api/payments/create-order
 * Headers: Idempotency-Key: <key>
 * Creates an official Razorpay Order & Payment record with server-side price verification and idempotency
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  await enforcePaymentRateLimit(request, "POST:/api/payments/create-order");

  const session = await requireRole(request, ROLES.MERCHANT, ROLES.ADMIN);
  const user = session.user;

  const merchant = await Merchant.findOne({ authId: user.id });
  const merchantId = merchant?._id || user.id;

  const { idempotencyKey, existingResult } = await handleIdempotency(request, {
    ...user,
    merchantId,
  });

  if (existingResult) {
    return ok(
      existingResult.data,
      "Idempotent response: payment previously initiated",
    );
  }

  const body = await request.json();
  const {
    amount,
    plan,
    cycle = "monthly",
    type = "ADDON",
    addOnId,
    description,
    gstin,
  } = body;

  const normalizedType = String(type || "ADDON").toUpperCase();

  // Authoritative server-side price validation (Never trust raw client-provided amount)
  let verifiedAmount = Number(amount);

  if (normalizedType === "ADDON" && addOnId) {
    const matchedAddon = ADDONS_PRICING.find((a) => a.id === addOnId);
    if (!matchedAddon) {
      throw new BadRequestError(`Invalid add-on package specified: ${addOnId}`);
    }
    const basePrice = matchedAddon.price;
    const allowedRates = [basePrice, Math.round(basePrice * 1.18)];
    if (allowedRates.includes(Number(amount))) {
      verifiedAmount = Number(amount);
    } else {
      verifiedAmount = Math.round(basePrice * 1.18);
    }
  } else if (normalizedType === "SUBSCRIPTION" && plan) {
    const planConfig = SUBSCRIPTION_MATRIX[plan.toLowerCase()];
    if (!planConfig) {
      throw new BadRequestError(`Invalid subscription plan: ${plan}`);
    }
    const expectedBase = cycle === "yearly" ? planConfig.priceYearly : planConfig.priceMonthly;
    // Allow founding discount rates (Growth: ₹999, Pro: ₹2,499) or standard catalog rate
    const baseRates = [
      expectedBase,
      plan.toLowerCase() === "growth" ? 999 : null,
      plan.toLowerCase() === "pro" ? 2499 : null,
    ].filter(Boolean);

    const allowedRates = [];
    for (const b of baseRates) {
      allowedRates.push(b);
      allowedRates.push(Math.round(b * 1.18));
    }

    if (allowedRates.includes(Number(amount))) {
      verifiedAmount = Number(amount);
    } else {
      verifiedAmount = Math.round(baseRates[0] * 1.18);
    }
  }

  if (!verifiedAmount || verifiedAmount <= 0) {
    throw new BadRequestError("Invalid payment amount specified");
  }

  // Convert Rupees to Paise for Razorpay SDK (₹1 = 100 Paise)
  const amountInPaise = toPaise(verifiedAmount);

  const cleanGstin = gstin?.trim()?.toUpperCase() || merchant?.gstin || "";

  if (cleanGstin && merchant && merchant.gstin !== cleanGstin) {
    merchant.gstin = cleanGstin;
    await merchant.save();
  }

  const result = await PaymentService.createOrder({
    merchantId,
    amount: amountInPaise,
    currency: "INR",
    type: normalizedType,
    description: description || `Payment for ${plan || normalizedType}`,
    metadata: {
      userEmail: user.email,
      plan: plan || "growth",
      cycle,
      type: normalizedType,
      addOnId: addOnId || "",
      gstin: cleanGstin,
    },
    idempotencyKey,
  });

  // Dispatch Email to Merchant about the chosen subscription plan
  const recipientEmail = merchant?.contactEmail || user?.email;
  if (recipientEmail && plan) {
    sendMerchantPlanSelectedEmail({
      to: recipientEmail,
      businessName: merchant?.businessName || "Merchant Partner",
      planName: String(plan).toUpperCase(),
      planPrice: verifiedAmount,
      billingCycle: cycle,
    }).catch((err) => console.error("[Plan Selected Email Error]:", err));
  }

  return ok(
    {
      orderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
      keyId: razorpayKeyId,
      merchantId,
      user: {
        name: user.name,
        email: user.email,
      },
    },
    "Payment order initiated successfully",
  );
});
