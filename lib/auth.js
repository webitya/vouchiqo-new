import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP, oneTap } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { Resend } from "resend";
import { env } from "../utils/env.js";
import { sendMerchantPasswordResetEmail } from "./email/merchant-email.js";
import {
  sendUserPasswordResetEmail,
  sendUserVerificationEmail,
  sendUserVerificationOtpEmail,
} from "./email/user-email.js";
import { redis } from "./redis.js";

// better-auth needs a Db instance, not the raw MongoClient
const client = new MongoClient(env.MONGODB_URI);
const db = client.db(); // â† client.db(), NOT client
const resend = new Resend(env.RESEND_API_KEY);

const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL: isProduction
    ? env.BETTER_AUTH_URL || "https://vouchiqo.com"
    : "http://localhost:3000",
  trustedOrigins: [
    "http://vouchiqo.com",
    "https://vouchiqo.com",
    "http://www.vouchiqo.com",
    "https://www.vouchiqo.com",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    ...(env.NEXT_PUBLIC_APP_URL ? [env.NEXT_PUBLIC_APP_URL] : []),
  ],
  secret: env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(db),

  secondaryStorage: {
    get: async (key) => {
      try {
        return await redis.get(`auth:session:${key}`);
      } catch (err) {
        console.warn(
          "[BetterAuth Secondary Storage] GET failed:",
          err?.message,
        );
        return null;
      }
    },
    set: async (key, value, ttl) => {
      try {
        if (ttl) {
          await redis.set(`auth:session:${key}`, value, "EX", ttl);
        } else {
          await redis.set(`auth:session:${key}`, value, "EX", 60 * 60 * 24 * 7);
        }
      } catch (err) {
        console.warn(
          "[BetterAuth Secondary Storage] SET failed:",
          err?.message,
        );
      }
    },
    delete: async (key) => {
      try {
        await redis.del(`auth:session:${key}`);
      } catch (err) {
        console.warn(
          "[BetterAuth Secondary Storage] DELETE failed:",
          err?.message,
        );
      }
    },
  },

  account: {
    skipStateCookieCheck: true,
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: isProduction,
      domain: isProduction ? ".vouchiqo.com" : undefined,
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isProduction,
      httpOnly: true,
    },
    useSecureCookies: isProduction,
  },

  socialProviders: {
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            accessType: "offline",
            prompt: "select_account",
          },
        }
      : {}),
  },

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendUserVerificationOtpEmail({ to: email, otp }).catch((err) =>
          console.error("[OTP Email Error]:", err),
        );
      },
    }),
    oneTap({
      clientId: env.GOOGLE_CLIENT_ID,
    }),
  ],

  rateLimit: {
    enabled: true,
    window: 60, // 60-second window
    max: 10000, // prevent rate limiting on internal middleware/session calls
    customRules: {
      "/session": { window: 60, max: 10000 }, // internal
      "/sign-in/email": { window: 60, max: 30 }, // 30 attempts / min per IP (prevents false-positive lockouts)
      "/sign-up/email": { window: 300, max: 20 }, // 20 registrations / 5 min per IP
      "/forgot-password": { window: 300, max: 5 }, // 5 reset requests / 5 min per IP
      "/request-password-reset": { window: 300, max: 5 }, // 5 reset requests / 5 min per IP
      "/reset-password": { window: 300, max: 5 }, // 5 resets / 5 min per IP
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      console.log("[Password Reset Dispatch]", {
        email: user?.email,
        role: user?.role,
        url,
      });
      if (user?.role === "merchant") {
        await sendMerchantPasswordResetEmail({
          to: user.email,
          resetUrl: url,
          name: user.name,
        }).catch((err) => console.error("[Merchant Reset Email Error]:", err));
      } else {
        await sendUserPasswordResetEmail({
          to: user.email,
          resetUrl: url,
          name: user.name,
        }).catch((err) => console.error("[Reset Email Error]:", err));
      }
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24,
    sendVerificationEmail: async ({ user, url }) => {
      await sendUserVerificationEmail({
        to: user.email,
        verifyUrl: url,
        name: user.name,
      }).catch((err) => console.error("[Verification Email Error]:", err));
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if 1 day old
    storeSessionInDatabase: true, // Persist in MongoDB and cache in Redis
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes client cookie cache for fast navigation
    },
  },

  // Extend the auth user with app-level fields
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        input: true, // allow client to set role on sign-up
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        input: false,
      },
    },
  },

  // --- Security: Block role privilege escalation ---
  // This hook runs before a new user is written to the database.
  // Any client-supplied role that is not "customer" or "merchant"
  // (e.g. an attacker sending role:"admin") is silently downgraded to
  // "customer". Admin accounts can ONLY be created server-side.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const allowedPublicRoles = ["customer", "merchant"];
          if (!user.role || !allowedPublicRoles.includes(user.role)) {
            user.role = "customer";
          }
          return { data: user };
        },
      },
    },
  },
});
