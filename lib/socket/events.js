/**
 * Centralized Socket.IO Event Constants for Vouchiqo.
 * Single source of truth for all real-time events across server and client.
 */

export const SOCKET_EVENTS = {
  // Connection / Rooms
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  JOIN_ROOM: "room:join",
  LEAVE_ROOM: "room:leave",

  // Coupon Events
  COUPON_SUBMITTED: "coupon:submitted",
  COUPON_SUBMITTED_CONFIRMATION: "coupon:submitted:confirmation",
  COUPON_STATUS_CHANGED: "coupon:status:changed",
  COUPON_CLAIMED: "coupon:claimed",
  COUPON_REDEEMED: "coupon:redeemed",

  // Campaign Events
  CAMPAIGN_SUBMITTED: "campaign:submitted",
  CAMPAIGN_STATUS_CHANGED: "campaign:status:changed",

  // Application Events
  APPLICATION_NEW: "application:new",
  APPLICATION_STATUS_CHANGED: "application:status:changed",
  DOCUMENT_VERIFIED: "document:verified",

  // Revival Events
  REVIVAL_SUBMITTED: "revival:submitted",
  REVIVAL_STATUS_CHANGED: "revival:status:changed",

  // Notification Events
  NOTIFICATION_NEW: "notification:new",

  // Room Identifiers Generator
  ROOMS: {
    ADMIN: "role:admin",
    MERCHANT: "role:merchant",
    USER: (userId) => `user:${userId}`,
    APPLICATION: (appId) => `application:${appId}`,
  },
};
