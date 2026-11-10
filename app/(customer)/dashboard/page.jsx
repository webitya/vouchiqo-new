import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import Merchant from "@/modules/merchant/merchant.model";
import { REDIS_KEYS } from "@/utils/constants";

export const dynamic = "force-dynamic";

/**
 * /dashboard — Server-Side Role-Based Redirector (SSR)
 * Immediately routes authenticated users to their corresponding workspace:
 *   - Admin -> /admin/dashboard
 *   - Merchant -> /merchant/dashboard
 *   - Customer -> /customer/dashboard
 *   - Unauthenticated -> /login
 */
export default async function DashboardRootRedirect() {
  const reqHeaders = await headers();
  const session = await auth.api
    .getSession({
      headers: reqHeaders,
    })
    .catch(() => null);

  if (!session?.user) {
    redirect("/login?callbackUrl=/merchant/dashboard");
  }

  const role = session.user.role || "customer";

  if (role === "admin") {
    redirect("/admin/dashboard");
  }

  if (role === "merchant") {
    redirect("/merchant/dashboard");
  }

  // Check whether the user has a registered merchant business profile
  const authIdStr = session.user.id ? String(session.user.id) : null;
  let isMerchant = false;

  if (authIdStr && redis) {
    try {
      const cached = await redis.get(REDIS_KEYS.merchantProfile(authIdStr));
      if (cached && cached !== "__NOT_FOUND__") {
        isMerchant = true;
      }
    } catch (_) {}
  }

  if (!isMerchant) {
    await connectDB();
    const query = [];
    if (authIdStr) query.push({ authId: authIdStr });
    if (session.user.email) {
      query.push({ contactEmail: session.user.email.toLowerCase().trim() });
    }

    if (query.length > 0) {
      const merchant = await Merchant.findOne({ $or: query })
        .select("_id")
        .lean();
      if (merchant) {
        isMerchant = true;
      }
    }
  }

  if (isMerchant) {
    redirect("/merchant/dashboard");
  }

  redirect("/customer/dashboard");
}
