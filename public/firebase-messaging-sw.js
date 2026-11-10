/**
 * Firebase Cloud Messaging Service Worker
 *
 * Served from the root domain at /firebase-messaging-sw.js
 * Handles background push messages when the app is not in focus.
 */

importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

// NOTE: In production, /firebase-messaging-sw.js is rewritten to /api/push/sw
// which injects environment variables dynamically at runtime.
// The static config below provides safe empty defaults for offline/static fallbacks.
var firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

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
