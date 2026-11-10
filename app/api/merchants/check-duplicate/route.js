import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Merchant from "@/modules/merchant/merchant.model";
import { ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";

/**
 * POST /api/merchants/check-duplicate
 * Real-time pre-validation endpoint to check if an email, phone, GSTIN, or PAN is already registered.
 *
 * Body: { field: "email" | "phone" | "gstin" | "pan", value: string, excludeMerchantId?: string }
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();
  const body = await request.json().catch(() => ({}));
  const { field, value, excludeMerchantId } = body;

  if (!field || !value || typeof value !== "string") {
    return ok({ available: true });
  }

  const cleanVal = value.trim();
  if (!cleanVal) return ok({ available: true });

  const baseFilter = excludeMerchantId
    ? { _id: { $ne: excludeMerchantId } }
    : {};

  let duplicateFound = null;

  if (field === "email") {
    const emailLower = cleanVal.toLowerCase();
    duplicateFound = await Merchant.findOne({
      ...baseFilter,
      contactEmail: emailLower,
    }).lean();

    // Also check Better Auth user collection
    if (!duplicateFound && mongoose.connection.db) {
      const userDoc = await mongoose.connection.db
        .collection("user")
        .findOne({ email: emailLower });
      if (userDoc) {
        return ok({
          available: false,
          field,
          message: "Email address is already registered to an account.",
        });
      }
    }

    if (duplicateFound) {
      return ok({
        available: false,
        field,
        message: "Email address is already registered to another merchant.",
      });
    }
  } else if (field === "phone") {
    duplicateFound = await Merchant.findOne({
      ...baseFilter,
      $or: [{ contactPhone: cleanVal }, { liaisonPhone: cleanVal }],
    }).lean();

    if (duplicateFound) {
      return ok({
        available: false,
        field,
        message: "Mobile / Phone number is already registered to another merchant.",
      });
    }
  } else if (field === "gstin") {
    const gstinUpper = cleanVal.toUpperCase();
    duplicateFound = await Merchant.findOne({
      ...baseFilter,
      gstin: gstinUpper,
    }).lean();

    if (duplicateFound) {
      return ok({
        available: false,
        field,
        message: `GSTIN "${gstinUpper}" is already registered to another merchant.`,
      });
    }
  } else if (field === "pan") {
    const panUpper = cleanVal.toUpperCase();
    duplicateFound = await Merchant.findOne({
      ...baseFilter,
      pan: panUpper,
    }).lean();

    if (duplicateFound) {
      return ok({
        available: false,
        field,
        message: `PAN "${panUpper}" is already registered to another merchant.`,
      });
    }
  }

  return ok({ available: true, field });
});
