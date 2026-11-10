import { toNextJsHandler } from "better-auth/next-js";
import mongoose from "mongoose";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendMerchantWelcomeEmail } from "@/lib/email/merchant-email";
import {
  sendUserWelcomeBackEmail,
  sendUserWelcomeEmail,
} from "@/lib/email/user-email";
import { connectDB } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import { invalidateSessionCache } from "@/modules/auth/auth.middleware";
import { REDIS_KEYS, ROLES } from "@/utils/constants";
import { isDisposableEmail } from "@/utils/disposable-emails";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

// ── Backend Zod Security Verification Schemas ────────────────────────────────
const backendSignInSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
});

const backendSignUpSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name must be at least 1 character")
    .max(100, "Name must be under 100 characters"),
  role: z
    .enum(["customer", "merchant"], {
      errorMap: () => ({
        message: "Invalid role specified. Only customer or merchant permitted.",
      }),
    })
    .optional(),
  data: z
    .object({
      role: z.enum(["customer", "merchant"]).optional(),
      phoneNumber: z.string().optional(),
    })
    .optional(),
});

const backendForgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  redirectTo: z.string().optional(),
});

const backendResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .optional(),
    token: z
      .string({ required_error: "Token is required" })
      .min(1, "Token is required"),
  })
  .refine((data) => data.password || data.newPassword, {
    message: "Password is required and must be at least 8 characters",
    path: ["password"],
  });

export async function POST(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  let parsedBody = null;

  try {
    // Perform validation depending on endpoint
    if (
      pathname.endsWith("/sign-in/email") ||
      pathname.endsWith("/sign-up/email") ||
      pathname.endsWith("/forget-password") ||
      pathname.endsWith("/forgot-password") ||
      pathname.endsWith("/request-password-reset") ||
      pathname.endsWith("/reset-password")
    ) {
      const clone = request.clone();
      const body = await clone.json().catch(() => ({}));
      parsedBody = body;

      let result;
      if (pathname.endsWith("/sign-in/email")) {
        result = backendSignInSchema.safeParse(body);
      } else if (pathname.endsWith("/sign-up/email")) {
        result = backendSignUpSchema.safeParse(body);
      } else if (
        pathname.endsWith("/forget-password") ||
        pathname.endsWith("/forgot-password") ||
        pathname.endsWith("/request-password-reset")
      ) {
        result = backendForgotPasswordSchema.safeParse(body);
      } else if (pathname.endsWith("/reset-password")) {
        result = backendResetPasswordSchema.safeParse(body);
      }

      if (result && !result.success) {
        const issues = result.error.issues || result.error.errors || [];
        return Response.json(
          {
            error: "Validation failed",
            message: issues[0]?.message ?? "Invalid request input",
            details: issues,
          },
          { status: 400 },
        );
      }

      // Check disposable and duplicate email on sign-up
      if (pathname.endsWith("/sign-up/email") && body.email) {
        const normalizedEmail = body.email.toLowerCase().trim();

        if (isDisposableEmail(normalizedEmail)) {
          return Response.json(
            {
              error: "Invalid Email",
              message:
                "Temporary or disposable email addresses are not permitted. Please use a valid personal or business email address.",
            },
            { status: 400 },
          );
        }

        await connectDB();
        const db = mongoose.connection.db;
        const existingEmailUser = await db
          .collection("user")
          .findOne({ email: normalizedEmail });
        if (existingEmailUser) {
          return Response.json(
            {
              error: "Conflict",
              message:
                "An account with this email address already exists. Please log in instead.",
            },
            { status: 409 },
          );
        }

        const phone = body.data?.phoneNumber;
        if (phone) {
          const cleanPhone = phone.trim();
          const existingPhoneMerchant = await db
            .collection("merchants")
            .findOne({
              $or: [{ contactPhone: cleanPhone }, { liaisonPhone: cleanPhone }],
            });
          if (existingPhoneMerchant) {
            return Response.json(
              {
                error: "Conflict",
                message:
                  "Mobile / Phone number is already registered to another merchant account.",
              },
              { status: 409 },
            );
          }
        }
      }

      // Business logic for /sign-in/email (sync roles + recreate admins)
      if (pathname.endsWith("/sign-in/email")) {
        const { email, password } = body;

        if (email) {
          await connectDB();
          const db = mongoose.connection.db;
          const normalizedEmail = email.toLowerCase().trim();
          const dbUser = await db
            .collection("user")
            .findOne({ email: normalizedEmail });
          if (dbUser) {
            const userIdStr = dbUser.id || dbUser._id.toString();
            const merchantProfile = await db
              .collection("merchants")
              .findOne({ authId: userIdStr });
            if (merchantProfile) {
              console.log(
                `[Merchant Sync] Promoting user ${normalizedEmail} to role: merchant`,
              );
              await db
                .collection("user")
                .updateOne(
                  { _id: dbUser._id },
                  { $set: { role: ROLES.MERCHANT } },
                );
              await db
                .collection("user_profiles")
                .updateOne(
                  { authId: userIdStr },
                  { $set: { role: ROLES.MERCHANT } },
                );
            }
          }
        }

        const adminUsername = process.env.ADMIN_USERNAME || "admin";
        const adminEmail = `${adminUsername}@vouchiqo.com`;
        const adminPassword = process.env.ADMIN_PASSWORD;

        if (
          adminPassword &&
          email === adminEmail &&
          password === adminPassword
        ) {
          if (
            process.env.NODE_ENV === "production" &&
            adminPassword === "Admin@123!"
          ) {
            console.error(
              "[CRITICAL SECURITY WARNING] Default ADMIN_PASSWORD 'Admin@123!' detected in production! Please rotate ADMIN_PASSWORD immediately.",
            );
          }
          await connectDB();
          const db = mongoose.connection.db;

          const existingAdmin = await db
            .collection("user")
            .findOne({ email: adminEmail });

          if (!existingAdmin) {
            console.log(
              `[Admin Sync] Initializing Super Admin user: ${adminEmail}`,
            );
            await auth.api.signUpEmail({
              body: {
                email: adminEmail,
                password: adminPassword,
                name: "Super Admin",
              },
            });

            const adminUser = await db
              .collection("user")
              .findOne({ email: adminEmail });
            if (adminUser) {
              await db
                .collection("user")
                .updateOne(
                  { _id: adminUser._id },
                  { $set: { role: ROLES.ADMIN, emailVerified: true } },
                );
              console.log(
                `[Admin Sync] Admin role elevated to ${ROLES.ADMIN} and emailVerified`,
              );
            }
          } else if (
            !existingAdmin.emailVerified ||
            existingAdmin.role !== ROLES.ADMIN
          ) {
            // Ensure existing admin is always verified and has admin role
            await db
              .collection("user")
              .updateOne(
                { _id: existingAdmin._id },
                { $set: { role: ROLES.ADMIN, emailVerified: true } },
              );
          }
        }
      }
    }
  } catch (err) {
    console.error("[Auth API Interceptor] Error executing verification:", err);
  }

  let requestToPass = request;
  if (parsedBody) {
    if (parsedBody.email && typeof parsedBody.email === "string") {
      parsedBody.email = parsedBody.email.trim().toLowerCase();
    }
    // Hard defense-in-depth: never allow admin role injection via sign-up
    if (pathname.endsWith("/sign-up/email")) {
      if (
        parsedBody.role &&
        parsedBody.role !== "merchant" &&
        parsedBody.role !== "customer"
      ) {
        parsedBody.role = "customer";
      }
      if (
        parsedBody.data?.role &&
        parsedBody.data.role !== "merchant" &&
        parsedBody.data.role !== "customer"
      ) {
        parsedBody.data.role = "customer";
      }
    }
    try {
      requestToPass = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: JSON.stringify(parsedBody),
        duplex: "half",
      });
    } catch {
      requestToPass = request;
    }
  }

  const response = await handler.POST(requestToPass);

  // Post-process /sign-up/email to send Welcome Email & promote merchant role
  if (pathname.endsWith("/sign-up/email") && response.ok) {
    try {
      const body = parsedBody || {};
      const referer = request.headers.get("referer") || "";
      const requestedRole = body.role || body.data?.role;
      const isMerchantSignup =
        requestedRole === "merchant" ||
        referer.includes("/merchant") ||
        referer.includes("/onboarding");

      if (isMerchantSignup && parsedBody) {
        parsedBody.role = "merchant";
      }

      if (body.email) {
        const normalizedEmail = body.email.toLowerCase().trim();

        if (isMerchantSignup) {
          // Trigger Merchant Credentials Welcome Email
          sendMerchantWelcomeEmail({
            to: normalizedEmail,
            email: normalizedEmail,
            password: body.password || undefined,
            businessName: body.name || "Your Store",
          }).catch((err) =>
            console.error("[Merchant Welcome Email Error]:", err),
          );

          await connectDB();
          const db = mongoose.connection.db;

          const userDoc = await db
            .collection("user")
            .findOne({ email: normalizedEmail });

          if (userDoc) {
            const userIdStr = userDoc.id || userDoc._id.toString();
            await db.collection("user").updateOne(
              { _id: userDoc._id },
              {
                $set: {
                  role: ROLES.MERCHANT,
                  lastWelcomeEmailSentAt: new Date(),
                },
              },
            );
            await db
              .collection("user_profiles")
              .updateOne(
                { authId: userIdStr },
                { $set: { role: ROLES.MERCHANT } },
                { upsert: true },
              );
            await db
              .collection("session")
              .updateMany(
                {
                  $or: [
                    { userId: userIdStr },
                    ...(mongoose.Types.ObjectId.isValid(userIdStr)
                      ? [{ userId: new mongoose.Types.ObjectId(userIdStr) }]
                      : []),
                  ],
                },
                { $set: { role: ROLES.MERCHANT } },
              )
              .catch(() => {});
            const userSessions = await db
              .collection("session")
              .find({
                $or: [
                  { userId: userIdStr },
                  ...(mongoose.Types.ObjectId.isValid(userIdStr)
                    ? [{ userId: new mongoose.Types.ObjectId(userIdStr) }]
                    : []),
                ],
              })
              .toArray()
              .catch(() => []);
            for (const s of userSessions) {
              if (s.token) {
                await redis.del(REDIS_KEYS.session(s.token)).catch(() => {});
                await redis.del(`auth:session:${s.token}`).catch(() => {});
              }
            }
            console.log(
              `[Sign-Up Sync] Promoted newly registered user ${normalizedEmail} to role: merchant`,
            );
          }
        } else {
          // Trigger Customer Welcome Email
          sendUserWelcomeEmail({
            to: normalizedEmail,
            name: body.name || normalizedEmail.split("@")[0],
          }).catch((err) => console.error("[Welcome Email Error]:", err));
        }
      }
    } catch (e) {
      console.error("[Sign-Up Post-Process Error]:", e);
    }
  }

  // Post-process /sign-in/email to send Welcome Email on FIRST LOGIN or Welcome Back on returning logins
  if (pathname.endsWith("/sign-in/email") && response.ok) {
    try {
      const body = parsedBody || {};
      if (body.email) {
        await connectDB();
        const db = mongoose.connection.db;
        const normalizedEmail = body.email.toLowerCase().trim();
        const userDoc = await db
          .collection("user")
          .findOne({ email: normalizedEmail });

        if (userDoc) {
          const userIdStr = userDoc.id || userDoc._id.toString();
          const profile = await db
            .collection("user_profiles")
            .findOne({ authId: userIdStr });
          const now = new Date();

          const lastLogin = profile?.lastLoginAt
            ? new Date(profile.lastLoginAt)
            : null;

          // Update lastLoginAt in user_profiles
          await db
            .collection("user_profiles")
            .updateOne(
              { authId: userIdStr },
              { $set: { lastLoginAt: now, updatedAt: now } },
              { upsert: true },
            );

          if (!lastLogin) {
            // VERY FIRST LOGIN! Send Official Welcome Email to User / Merchant
            console.log(
              `[First-Time Login Email]: Sending Welcome email to ${normalizedEmail}`,
            );
            if (userDoc.role === "merchant") {
              sendMerchantWelcomeEmail({
                to: normalizedEmail,
                email: normalizedEmail,
                businessName: userDoc.name || "Merchant Store",
              }).catch((err) =>
                console.error("[Merchant Welcome Email Error]:", err),
              );
            } else {
              sendUserWelcomeEmail({
                to: normalizedEmail,
                name: userDoc.name || normalizedEmail.split("@")[0],
              }).catch((err) =>
                console.error("[User Welcome Email Error]:", err),
              );
            }
          } else {
            const daysSinceLastLogin =
              (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24);

            // Send Welcome Back email if returning after >= 1 day
            if (daysSinceLastLogin >= 1) {
              sendUserWelcomeBackEmail({
                to: normalizedEmail,
                name: userDoc.name || normalizedEmail.split("@")[0],
                lastLoginAt: lastLogin,
              }).catch((err) =>
                console.error("[Welcome Back Email Error]:", err),
              );
            }
          }
        }
      }
    } catch (e) {
      console.error("[Sign-In Post-Process Error]:", e);
    }
  }

  // Invalidate Redis session cache on sign-out so revoked sessions
  // are not served from cache after the user logs out.
  if (pathname.endsWith("/sign-out") && response.ok) {
    try {
      await invalidateSessionCache(request);
    } catch (e) {
      console.warn("[Auth Cache] Sign-out invalidation failed:", e?.message);
    }
  }

  return response;
}
