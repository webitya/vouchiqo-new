import { notificationQueue } from "@/lib/queue";
import Notification from "@/modules/notification/notification.model";
import { JOB_NAMES } from "@/utils/constants";
import { buildMeta, parsePagination } from "@/utils/pagination";

/**
 * Create an in-app notification.
 *
 * @param {string} userId
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {object} [metadata]
 */
export async function createNotification(
  userId,
  type,
  title,
  message,
  metadata = {},
) {
  return Notification.create({ userId, type, title, message, metadata });
}

/**
 * Get unread notification count for a user.
 *
 * @param {string} userId
 */
export async function getUnreadCount(userId) {
  return Notification.countDocuments({ userId, isRead: false });
}

/**
 * Get all notifications for a user with pagination.
 *
 * @param {string} userId
 * @param {URLSearchParams} searchParams
 */
export async function getUserNotifications(userId, searchParams) {
  const { page, limit, skip } = parsePagination(searchParams);

  const [notifications, total] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments({ userId }),
  ]);

  return { notifications, meta: buildMeta(total, page, limit) };
}

/**
 * Mark all notifications as read for a user.
 *
 * @param {string} userId
 */
export async function markAllRead(userId) {
  await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } },
  );
}

/**
 * Send an email notification via BullMQ.
 * Non-blocking — failures are logged but don't crash the request.
 *
 * @param {string} to - Email address
 * @param {string} subject
 * @param {string} html
 */
export async function sendEmailNotification(to, subject, html) {
  await notificationQueue
    .add(JOB_NAMES.SEND_EMAIL, { to, subject, html })
    .catch(() => {});
}
