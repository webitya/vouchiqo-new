import { sendMerchantWelcomeEmail } from "@/lib/email/merchant-email";
import { connectDB } from "@/lib/mongodb";
import { requireAuth } from "@/modules/auth/auth.middleware";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { NotFoundError } from "@/utils/app-error";
import { asyncHandler } from "@/utils/async-handler";

export const dynamic = "force-dynamic";

/**
 * POST /api/merchants/resend-confirmation
 * Resends the merchant welcome & credentials confirmation email.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const { user } = await requireAuth(request);

  let merchant = await Merchant.findOne({ authId: user.id });
  if (!merchant && user.email) {
    merchant = await Merchant.findOne({
      contactEmail: user.email.toLowerCase().trim(),
    });
  }

  const targetEmail = merchant?.contactEmail || user.email;
  if (!targetEmail) {
    throw new NotFoundError("Merchant email contact details");
  }

  await sendMerchantWelcomeEmail({
    to: targetEmail,
    email: targetEmail,
    businessName: merchant?.businessName || "Merchant Store",
    liaisonName: merchant?.liaisonName || user.name,
  });

  return ok({ sent: true, to: targetEmail }, "Confirmation email resent successfully!");
});
