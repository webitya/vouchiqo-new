import { logger } from "../logger.js";
import {
  emitToAdmins,
  emitToApplication,
  emitToMerchants,
  emitToUser,
  getIO,
} from "./server.js";
import { SOCKET_EVENTS } from "./events.js";
import Notification from "../../modules/notification/notification.model.js";

/**
 * Production-grade unified Real-time Event Dispatcher & Notification Persister.
 *
 * Atomically handles:
 * 1. Socket.IO event emission to target rooms/users/admins/merchants
 * 2. Optional DB persistence to the `Notification` collection
 * 3. Real-time notification stream update trigger (`SOCKET_EVENTS.NOTIFICATION_NEW`)
 *
 * @param {Object} options
 * @param {"user" | "admins" | "merchants" | "room"} options.target - Target audience
 * @param {string} [options.userId] - Target user ID (required when target is "user")
 * @param {string} [options.room] - Room name (required when target is "room")
 * @param {string} options.event - Event name from SOCKET_EVENTS
 * @param {Object} [options.payload] - Data payload sent to socket clients
 * @param {Object} [options.notify] - Optional DB Notification to create
 * @param {string} [options.notify.userId] - User ID to receive the DB notification (defaults to options.userId)
 * @param {string} [options.notify.type] - Notification type descriptor
 * @param {"system" | "campaign" | "billing" | "general"} [options.notify.category] - Category tab filter
 * @param {string} options.notify.title - Notification title
 * @param {string} options.notify.message - Notification detail text
 * @param {Object} [options.notify.metadata] - Extra metadata object
 */
export async function dispatchEvent(options = {}) {
  const {
    target = "user",
    userId,
    room,
    event,
    payload = {},
    notify,
  } = options;

  // 1. Socket.IO Real-time Broadcast
  try {
    const io = getIO();
    if (io) {
      switch (target) {
        case "user":
          if (userId) emitToUser(userId, event, payload);
          break;
        case "admins":
          emitToAdmins(event, payload);
          break;
        case "merchants":
          emitToMerchants(event, payload);
          break;
        case "room":
          if (room) io.to(room).emit(event, payload);
          break;
        default:
          break;
      }
    }
  } catch (socketErr) {
    logger.warn(
      { err: socketErr, event },
      "[dispatchEvent] Socket emit failed silently",
    );
  }

  // 2. DB Notification Persistence & Stream Update (if notify object provided)
  if (notify && (notify.userId || userId)) {
    try {
      const recipientId = notify.userId || userId;
      const notificationDoc = await Notification.create({
        userId: recipientId,
        type: notify.type || "system",
        category: notify.category || "system",
        title: notify.title,
        message: notify.message,
        metadata: notify.metadata || payload || {},
        isRead: false,
      });

      // Signal real-time refresh to recipient's notification bell/page
      emitToUser(recipientId, SOCKET_EVENTS.NOTIFICATION_NEW, {
        notification: notificationDoc.toObject(),
        unreadCount: await Notification.countDocuments({
          userId: recipientId,
          isRead: false,
        }),
      });
    } catch (dbErr) {
      logger.error(
        { err: dbErr, notify },
        "[dispatchEvent] Failed to persist DB notification",
      );
    }
  }
}
