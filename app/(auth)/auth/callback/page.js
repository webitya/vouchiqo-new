import mongoose from "mongoose";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { sendMerchantWelcomeEmail } from "@/lib/email/merchant-email";
import { sendUserWelcomeEmail } from "@/lib/email/user-email";
import { connectDB } from "@/lib/mongodb";

/**
 * /auth/callback — Server-side role redirect after OAuth (e.g. Google Sign-In).
 * Better Auth redirects here after the OAuth flow completes.
 * We read the session on the server and forward the user to their correct dashboard.
 */
export default async function AuthCallbackPage({ searchParams }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    // No valid session — send back to login
    redirect("/login");
  }

  const resolvedSearchParams = (await searchParams) || {};
  const requestedRole = resolvedSearchParams?.role;
  const currentRole = session.user.role || "customer";
  let finalRole = currentRole;

  try {
    await connectDB();
    const db = mongoose.connection.db;

    if (db) {
      const userAuthId = String(session.user.id);
      const queryId = mongoose.Types.ObjectId.isValid(userAuthId)
        ? new mongoose.Types.ObjectId(userAuthId)
        : userAuthId;

      // Check if first-time login for OAuth user
      const userProfile = await db
        .collection("user_profiles")
        .findOne({ authId: userAuthId });

      const now = new Date();
      if (!userProfile || !userProfile.lastLoginAt) {
        // First-time OAuth login!
        const targetEmail = session.user.email;
        if (targetEmail) {
          if (requestedRole === "merchant" || currentRole === "merchant") {
            sendMerchantWelcomeEmail({
              to: targetEmail,
              email: targetEmail,
              businessName: session.user.name || "Merchant Store",
            }).catch((err) =>
              console.error("[OAuth Merchant Welcome Email Error]:", err),
            );
          } else {
            sendUserWelcomeEmail({
              to: targetEmail,
              name: session.user.name || targetEmail.split("@")[0],
            }).catch((err) =>
              console.error("[OAuth User Welcome Email Error]:", err),
            );
          }
        }
      }

      // If a role was specifically requested (e.g., during sign up) and user currently has customer role,
      // update role in database.
      if (
        requestedRole &&
        requestedRole !== currentRole &&
        (requestedRole === "merchant" || requestedRole === "customer")
      ) {
        await db
          .collection("user")
          .updateOne(
            { $or: [{ _id: userAuthId }, { _id: queryId }] },
            { $set: { role: requestedRole } },
          );

        await db
          .collection("user_profiles")
          .updateOne(
            { authId: userAuthId },
            { $set: { role: requestedRole, lastLoginAt: now, updatedAt: now } },
            { upsert: true },
          );

        finalRole = requestedRole;
      } else {
        await db
          .collection("user_profiles")
          .updateOne(
            { authId: userAuthId },
            {
              $set: { lastLoginAt: now, updatedAt: now },
              $setOnInsert: { role: currentRole },
            },
            { upsert: true },
          );
      }
    }
  } catch (err) {
    console.error("[Auth Callback Error]:", err);
  }

  if (finalRole === "admin") {
    redirect("/admin/dashboard");
  } else if (finalRole === "merchant") {
    redirect("/merchant/dashboard");
  } else {
    redirect("/");
  }
}
