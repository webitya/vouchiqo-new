/**
 * Firebase Admin SDK singleton.
 *
 * - Server-only — never import this in client components.
 * - Safe singleton via getApps() guard.
 * - Handles FIREBASE_PRIVATE_KEY \n unescaping for Vercel/env compatibility.
 * - Exports sendPushToTokens() for multicast broadcasting.
 *
 * Usage:
 *   import { sendPushToTokens } from "@/lib/firebaseAdmin";
 */

import { cert, getApps, getApp, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

/**
 * Initialize (or return cached) Firebase Admin app.
 */
function getAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !privateKey
  ) {
    throw new Error(
      "[FirebaseAdmin] Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY env vars.",
    );
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });
}

/**
 * Send push notifications to an array of FCM tokens.
 * Automatically chunks into batches of 500 (FCM multicast limit).
 *
 * @param {string[]} tokens - Array of FCM registration tokens
 * @param {{ title: string, body: string, icon?: string, image?: string, badge?: string, url?: string, tag?: string, category?: string }} payload
 * @returns {Promise<{ successCount: number, failureCount: number, invalidTokens: string[] }>}
 */
export async function sendPushToTokens(tokens, payload) {
  if (!tokens || tokens.length === 0) {
    return { successCount: 0, failureCount: 0, invalidTokens: [] };
  }

  const app = getAdminApp();
  const messaging = getMessaging(app);

  const CHUNK_SIZE = 500;
  const chunks = [];
  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    chunks.push(tokens.slice(i, i + CHUNK_SIZE));
  }

  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];

  for (const chunk of chunks) {
    const message = {
      tokens: chunk,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.image ? { imageUrl: payload.image } : {}),
      },
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: payload.icon || "/navbarlogovouchiqo.webp",
          badge: payload.badge || "/navbarlogovouchiqo.webp",
          tag: `app-${payload.tag || payload.category || "general"}`,
          renotify: true,
          ...(payload.image ? { image: payload.image } : {}),
        },
        fcmOptions: {
          link: payload.url || "/",
        },
        data: {
          url: payload.url || "/",
          category: payload.category || "general",
          tag: payload.tag || "general",
        },
      },
    };

    try {
      const result = await messaging.sendEachForMulticast(message);
      successCount += result.successCount;
      failureCount += result.failureCount;

      // Identify invalid/unregistered tokens for DB pruning
      result.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === "messaging/registration-token-not-registered" ||
            code === "messaging/invalid-registration-token" ||
            code === "messaging/invalid-argument"
          ) {
            invalidTokens.push(chunk[idx]);
          }
        }
      });
    } catch (err) {
      console.error("[FirebaseAdmin] Multicast chunk failed:", err);
      failureCount += chunk.length;
    }
  }

  return { successCount, failureCount, invalidTokens };
}
