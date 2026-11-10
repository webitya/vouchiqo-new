import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { requireRole } from "@/modules/auth/auth.middleware";
import {
  createCustomerRevival,
  getCustomerRevivalStats,
  listAllCustomerRevivals,
  updateCustomerRevivalStatus,
} from "@/modules/revival/customer-revival.service";
import { created, ok } from "@/utils/api-response";
import { asyncHandler } from "@/utils/async-handler";
import { ROLES } from "@/utils/constants";

const createCustomerRevivalSchema = z.object({
  code: z.string().toUpperCase().optional().nullable(),
  brandName: z
    .string()
    .min(2, "Brand name must be at least 2 characters")
    .max(100),
  email: z.string().email("Invalid email address"),
  whereDidYouFindThisOffer: z.string().optional().nullable(),
  merchantWebsite: z.string().optional().nullable(),
  merchantCity: z
    .string()
    .min(2)
    .max(100)
    .optional()
    .nullable()
    .default("Online"),
  discountType: z
    .string()
    .min(2)
    .max(50)
    .optional()
    .nullable()
    .default("Percentage"),
  discountValue: z.number().min(0).optional().nullable().default(0),
  description: z.string().max(200).optional().nullable(),
  whenSeen: z.string().optional().nullable(),
  whatBuying: z.string().max(200).optional().nullable(),
  mobileNumber: z
    .string()
    .optional()
    .nullable()
    .default("9999999999"),
  consent: z.boolean().optional().nullable().default(true),
});

/**
 * GET /api/revivals/customer
 * Returns the count of customer revival requests processed this month for public,
 * or lists all revival documents for administrators with advanced query sorting.
 */
export const GET = asyncHandler(async (request) => {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const isAdminRequest = searchParams.get("admin") === "true";

  if (isAdminRequest) {
    await requireRole(request, ROLES.ADMIN);
    const result = await listAllCustomerRevivals(searchParams);
    return ok(result);
  }

  const stats = await getCustomerRevivalStats();
  return ok(stats);
});

/**
 * POST /api/revivals/customer
 * Submits a new customer revival request with 3-Way routing.
 */
export const POST = asyncHandler(async (request) => {
  await connectDB();

  const body = await request.json();
  const data = createCustomerRevivalSchema.parse(body);

  const { revival, message } = await createCustomerRevival(data);
  return created(revival, message);
});

/**
 * PUT /api/revivals/customer
 * Admin: Update customer revival request status.
 */
export const PUT = asyncHandler(async (request) => {
  await connectDB();
  await requireRole(request, ROLES.ADMIN);

  const { revivalId, status } = await request.json();
  const revival = await updateCustomerRevivalStatus(revivalId, status);
  return ok(revival, `Customer revival request status updated to ${status}`);
});
