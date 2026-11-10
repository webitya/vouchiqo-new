/**
 * Firebase Client SDK singleton.
 *
 * - SSR-safe: only initializes in browser environments.
 * - Checks isSupported() before any FCM operation.
 * - Uses modular Firebase v11 SDK.
 *
 * Usage (client components only):
 *   import { getFCMToken, onForegroundMessage } from "@/lib/firebaseClient";
 */

let app = null;
let messagingInstance = null;

function getFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}

/**
 * Lazily initialize and return the Firebase app singleton.
 * Must only be called in browser context.
 */
async function getFirebaseApp() {
  if (app) return app;

  const { initializeApp, getApps, getApp } = await import("firebase/app");

  if (getApps().length === 0) {
    app = initializeApp(getFirebaseConfig());
  } else {
    app = getApp();
  }

  return app;
}

/**
 * Get the Firebase Messaging instance.
 * Returns null if FCM is not supported in this browser.
 */
async function getMessagingInstance() {
  if (typeof window === "undefined") return null;
  if (messagingInstance) return messagingInstance;

  const { isSupported } = await import("firebase/messaging");
  const supported = await isSupported();
  if (!supported) return null;

  const firebaseApp = await getFirebaseApp();
  const { getMessaging } = await import("firebase/messaging");
  messagingInstance = getMessaging(firebaseApp);
  return messagingInstance;
}

/**
 * Check if FCM is supported in this browser.
 *
 * @returns {Promise<boolean>}
 */
export async function isFCMSupported() {
  if (typeof window === "undefined") return false;
  try {
    const { isSupported } = await import("firebase/messaging");
    return await isSupported();
  } catch {
    return false;
  }
}

/**
 * Get the FCM registration token for this device.
 * Triggers service worker registration automatically.
 *
 * @returns {Promise<string|null>} FCM token or null if unsupported/denied
 */
export async function getFCMToken() {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return null;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.warn("[FCM] NEXT_PUBLIC_FIREBASE_VAPID_KEY is not set.");
      return null;
    }

    const { getToken } = await import("firebase/messaging");
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" },
      ),
    });

    return token || null;
  } catch (err) {
    console.error("[FCM] Failed to get token:", err);
    return null;
  }
}

/**
 * Subscribe to foreground messages (while the app is open/focused).
 * Returns an unsubscribe function.
 *
 * @param {(payload: object) => void} callback
 * @returns {Promise<() => void>} unsubscribe function
 */
export async function onForegroundMessage(callback) {
  try {
    const messaging = await getMessagingInstance();
    if (!messaging) return () => {};

    const { onMessage } = await import("firebase/messaging");
    return onMessage(messaging, callback);
  } catch (err) {
    console.error("[FCM] Failed to register foreground listener:", err);
    return () => {};
  }
}
