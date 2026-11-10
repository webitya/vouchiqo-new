/**
 * GET /api/push/sw
 *
 * Serves the Firebase service worker with real env vars injected at runtime.
 * This is needed because static files in /public cannot access process.env.
 *
 * The service worker must be served from root scope (/firebase-messaging-sw.js).
 * We handle this via a custom server route that rewrites the request.
 *
 * Usage in next.config.mjs rewrites:
 *   /firebase-messaging-sw.js → /api/push/sw
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  };

  const swContent = `
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

var firebaseConfig = ${JSON.stringify(config)};

firebase.initializeApp(firebaseConfig);
var messaging = firebase.messaging();

/**
 * Background message handler.
 * Guard: if payload.notification exists, browser renders it natively — return early.
 * Only call showNotification() for data-only payloads.
 */
messaging.onBackgroundMessage(function(payload) {
  if (payload.notification) {
    return;
  }

  var data = payload.data || {};
  var title = data.title || "Vouchiqo";
  var body = data.body || "You have a new update";

  var notificationOptions = {
    body: body,
    icon: data.icon || "/navbarlogovouchiqo.webp",
    badge: data.badge || "/navbarlogovouchiqo.webp",
    tag: data.tag || "vouchiqo-push",
    renotify: true,
    data: { url: data.url || "/" }
  };

  if (data.image) {
    notificationOptions.image = data.image;
  }

  return self.registration.showNotification(title, notificationOptions);
});

/**
 * Notification click handler.
 * Focus existing tab → navigate existing tab → open new window.
 */
self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  var targetUrl = (event.notification.data && event.notification.data.url) || "/";
  var fullUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === fullUrl && "focus" in client) {
          return client.focus();
        }
      }
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if ("navigate" in client) {
          return client.navigate(fullUrl).then(function(c) { return c && c.focus(); });
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});
`;

  return new Response(swContent, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
