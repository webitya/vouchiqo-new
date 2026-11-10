/**
 * Analytics BullMQ Worker
 *
 * Processes background jobs queued by the analytics queue.
 * Handles:
 *  - RECORD_VIEW: increments viewCount on a coupon document
 *  - RECORD_IMPRESSION: increments impressionCount on a coupon & merchant + upserts daily AnalyticsEvent
 *  - RECORD_CLICK: increments clickCount on a coupon & totalClicks on merchant + upserts daily AnalyticsEvent
 *  - RECORD_COPY_CODE: increments copyCodeCount on coupon + upserts daily AnalyticsEvent
 *  - RECORD_STORE_VIEW: increments storePageViews on merchant + upserts daily AnalyticsEvent
 *  - RECORD_BANNER_CLICK: upserts daily AnalyticsEvent for banner clicks
 *  - RECORD_UNIQUE_CODE_GEN: increments uniqueCodeGenCount on coupon + upserts daily AnalyticsEvent
 */

import nextEnv from "@next/env";
if (typeof process !== "undefined" && process.cwd) {
  try {
    const { loadEnvConfig } = nextEnv;
    loadEnvConfig(process.cwd());
  } catch (_) {}
}

import { Worker } from "bullmq";
import mongoose from "mongoose";
import { redis, createQueueConnection } from "../lib/redis.js";
import { JOB_NAMES, QUEUE_NAMES, REDIS_KEYS } from "../utils/constants.js";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Bootstrap DB connection
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[analytics-worker] MONGODB_URI env variable is missing.");
  process.exit(1);
}

let connectionPromise = null;
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URI, { bufferCommands: true }).then(() => {
      console.log("[analytics-worker] MongoDB connected");
    });
  }
  await connectionPromise;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Inline Models
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const couponSchema = new mongoose.Schema(
  {
    viewCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    impressionCount: { type: Number, default: 0 },
    copyCodeCount: { type: Number, default: 0 },
    uniqueCodeGenCount: { type: Number, default: 0 },
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant" },
  },
  { strict: false, collection: "coupons" },
);

const merchantSchema = new mongoose.Schema(
  {
    totalClicks: { type: Number, default: 0 },
    totalImpressions: { type: Number, default: 0 },
    storePageViews: { type: Number, default: 0 },
  },
  { strict: false, collection: "merchants" },
);

const analyticsEventSchema = new mongoose.Schema(
  {
    merchantId: { type: mongoose.Schema.Types.ObjectId, ref: "Merchant" },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    eventType: { type: String, required: true },
    source: { type: String, default: "direct" },
    date: { type: Date, required: true },
    count: { type: Number, default: 1 },
  },
  { strict: false, collection: "analytics_events" },
);

const Coupon = mongoose.models.Coupon ?? mongoose.model("Coupon", couponSchema);
const Merchant =
  mongoose.models.Merchant ?? mongoose.model("Merchant", merchantSchema);
const AnalyticsEvent =
  mongoose.models.AnalyticsEvent ??
  mongoose.model("AnalyticsEvent", analyticsEventSchema);

// Helper to truncate date to midnight UTC/local YYYY-MM-DD
function getTodayStart() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// Helper to record daily event bucket
async function recordDailyEvent({
  merchantId,
  couponId,
  eventType,
  source,
  count = 1,
}) {
  if (!merchantId && !couponId) return;
  const date = getTodayStart();

  const filter = {
    merchantId: merchantId || null,
    couponId: couponId || null,
    eventType,
    source: source || "direct",
    date,
  };

  await AnalyticsEvent.updateOne(filter, { $inc: { count } }, { upsert: true });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Worker
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function isValidId(id) {
  return Boolean(id && mongoose.Types.ObjectId.isValid(String(id)));
}

const connection = createQueueConnection();

export const worker = new Worker(
  QUEUE_NAMES.ANALYTICS,
  async (job) => {
    await connectDB();
    const { couponId, merchantId, source } = job.data;

    switch (job.name) {
      case JOB_NAMES.RECORD_VIEW: {
        if (!isValidId(couponId)) return;
        await Coupon.updateOne({ _id: couponId }, { $inc: { viewCount: 1 } });
        if (couponId && redis && redis.status === "ready") { redis.zincrby(REDIS_KEYS.TRENDING_COUPONS_ZSET, 1, String(couponId)).catch(() => {}); }
        break;
      }

      case JOB_NAMES.RECORD_IMPRESSION: {
        if (isValidId(couponId)) {
          const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { $inc: { impressionCount: 1 } },
            { new: true },
          );
          const derivedMerchantId = merchantId || coupon?.merchantId;
          if (isValidId(derivedMerchantId)) {
            await Merchant.updateOne({ _id: derivedMerchantId }, { $inc: { totalImpressions: 1 } });
          }
          await recordDailyEvent({
            merchantId: derivedMerchantId,
            couponId,
            eventType: "impression",
            source,
          });
        } else if (isValidId(merchantId)) {
          await Merchant.updateOne({ _id: merchantId }, { $inc: { totalImpressions: 1 } });
          await recordDailyEvent({
            merchantId,
            couponId: null,
            eventType: "impression",
            source,
          });
        }
        break;
      }

      case JOB_NAMES.RECORD_CLICK: {
        if (isValidId(couponId)) {
          const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { $inc: { clickCount: 1 } },
            { new: true },
          );
          const derivedMerchantId = merchantId || coupon?.merchantId;
          if (isValidId(derivedMerchantId)) {
            await Merchant.updateOne({ _id: derivedMerchantId }, { $inc: { totalClicks: 1 } });
          }
          await recordDailyEvent({
            merchantId: derivedMerchantId,
            couponId,
            eventType: "click",
            source,
          });
        } else if (isValidId(merchantId)) {
          await Merchant.updateOne({ _id: merchantId }, { $inc: { totalClicks: 1 } });
          await recordDailyEvent({
            merchantId,
            couponId: null,
            eventType: "click",
            source,
          });
        }
        break;
      }

      case JOB_NAMES.RECORD_COPY_CODE: {
        if (isValidId(couponId)) {
          const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { $inc: { copyCodeCount: 1 } },
            { new: true },
          );
          await recordDailyEvent({
            merchantId: merchantId || coupon?.merchantId,
            couponId,
            eventType: "copy_code",
            source,
          });
        }
        break;
      }

      case JOB_NAMES.RECORD_STORE_VIEW: {
        if (merchantId) {
          await Merchant.updateOne({ _id: merchantId }, { $inc: { storePageViews: 1 } });
          await recordDailyEvent({
            merchantId,
            couponId: null,
            eventType: "store_view",
            source,
          });
        }
        break;
      }

      case JOB_NAMES.RECORD_BANNER_CLICK: {
        await recordDailyEvent({
          merchantId: merchantId || null,
          couponId: couponId || null,
          eventType: "banner_click",
          source: "homepage",
        });
        break;
      }

      case JOB_NAMES.RECORD_UNIQUE_CODE_GEN: {
        if (isValidId(couponId)) {
          const coupon = await Coupon.findByIdAndUpdate(
            couponId,
            { $inc: { uniqueCodeGenCount: 1 } },
            { new: true },
          );
          await recordDailyEvent({
            merchantId: merchantId || coupon?.merchantId,
            couponId,
            eventType: "unique_code_gen",
            source,
          });
        }
        break;
      }

      default:
        console.warn(`[analytics-worker] Unknown job: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 10,
  },
);

worker.on("completed", (job) => {
  console.log(`[analytics-worker] Job ${job.id} (${job.name}) completed`);
});

worker.on("failed", (job, err) => {
  console.error(
    `[analytics-worker] Job ${job?.id} (${job?.name}) failed:`,
    err.message,
  );
});

worker.on("error", (err) => {
  console.error("[analytics-worker] Worker error:", err);
});

async function shutdown(signal) {
  console.log(`[analytics-worker] ${signal} received, closing worker...`);
  await worker.close();
  await connection.quit();
  if (mongoose.connection.readyState >= 1) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log(
  "[analytics-worker] Analytics worker started with multi-event tracking",
);
