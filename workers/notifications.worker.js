/**
 * Notifications BullMQ Worker
 *
 * Processes background email sending jobs enqueued by the notifications queue.
 *
 * Start with: node workers/notifications.worker.js
 */

import nextEnv from "@next/env";
if (typeof process !== "undefined" && process.cwd) {
  try {
    const { loadEnvConfig } = nextEnv;
    loadEnvConfig(process.cwd());
  } catch (_) {}
}

import { Worker } from "bullmq";
import { Resend } from "resend";
import { createQueueConnection } from "../lib/redis.js";
import { JOB_NAMES, QUEUE_NAMES } from "../utils/constants.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || "Vouchiqo <noreply@vouchiqo.com>";

const connection = createQueueConnection();

export const worker = new Worker(
  QUEUE_NAMES.NOTIFICATIONS,
  async (job) => {
    if (job.name === JOB_NAMES.SEND_EMAIL) {
      const { to, subject, html } = job.data;

      if (!to || !subject || !html) {
        console.warn("[notifications-worker] Missing required parameters.");
        return;
      }

      if (!resend || !RESEND_API_KEY) {
        console.log(`[notifications-worker Mock Dispatch] To: ${to} | Subject: ${subject}`);
        return;
      }

      let recipient = to;
      const isTestingDomain = !process.env.EMAIL_FROM && FROM_EMAIL.includes("onboarding@resend.dev");
      const devRecipient = process.env.EMAIL_DEV_RECIPIENT || "vouchiqo@gmail.com";

      if (isTestingDomain && recipient !== devRecipient && process.env.NODE_ENV === "development") {
        console.warn(
          `[notifications-worker Dev Sandbox Notice]: Redirecting recipient '${to}' to '${devRecipient}' because 'onboarding@resend.dev' only allows sending to account owner email.`
        );
        recipient = devRecipient;
      }

      try {
        const res = await resend.emails.send({
          from: FROM_EMAIL,
          to: recipient,
          subject,
          html,
        });

        if (res?.error) {
          console.error(`[notifications-worker] Email dispatch error for ${to}:`, res.error.message || res.error);
          return;
        }

        console.log(`[notifications-worker] Email sent successfully to ${recipient}`);
      } catch (err) {
        console.error(`[notifications-worker] Email dispatch failed for ${to}:`, err.message || err);
      }
    } else {
      console.warn(`[notifications-worker] Unknown job: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5,
  },
);

worker.on("completed", (job) => {
  console.log(`[notifications-worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[notifications-worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[notifications-worker] Worker error:", err);
});

async function shutdown(signal) {
  console.log(`[notifications-worker] ${signal} received, closing worker...`);
  await worker.close();
  await connection.quit();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log("[notifications-worker] Notifications worker started");
