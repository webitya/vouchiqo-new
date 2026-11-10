/**
 * Coupons BullMQ Worker
 *
 * Runs repeatable background jobs to automatically expire coupons whose expiresAt has passed.
 *
 * Start with: node workers/coupons.worker.js
 */

import nextEnv from "@next/env";
if (typeof process !== "undefined" && process.cwd) {
  try {
    const { loadEnvConfig } = nextEnv;
    loadEnvConfig(process.cwd());
  } catch (_) {}
}

import { Queue, Worker } from "bullmq";
import mongoose from "mongoose";
import { createQueueConnection } from "../lib/redis.js";
import { JOB_NAMES, QUEUE_NAMES } from "../utils/constants.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[coupons-worker] MONGODB_URI is missing.");
  process.exit(1);
}

let connectionPromise = null;
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URI, { bufferCommands: true }).then(() => {
      console.log("[coupons-worker] MongoDB connected");
    });
  }
  await connectionPromise;
}

const couponSchema = new mongoose.Schema(
  {
    status: { type: String },
    expiresAt: { type: Date },
  },
  { strict: false, collection: "coupons" },
);

const Coupon = mongoose.models.Coupon ?? mongoose.model("Coupon", couponSchema);

const queueConnection = createQueueConnection();
const workerConnection = createQueueConnection();

// 1. Initialize queue to schedule repeatable job
export const queue = new Queue(QUEUE_NAMES.COUPONS, { connection: queueConnection });

async function scheduleRepeatableJob() {
  await queue.add(
    JOB_NAMES.EXPIRE_COUPON,
    {},
    {
      repeat: { cron: "*/15 * * * *" }, // Run every 15 minutes
      jobId: "auto-expire-coupons-repeatable-job",
    },
  );
  console.log(
    "[coupons-worker] Auto-expiry repeatable job scheduled (every 15 minutes)",
  );
}

scheduleRepeatableJob().catch((err) => {
  console.error("[coupons-worker] Failed to schedule repeatable job:", err);
});

// 2. Start Worker
export const worker = new Worker(
  QUEUE_NAMES.COUPONS,
  async (job) => {
    await connectDB();

    if (job.name === JOB_NAMES.EXPIRE_COUPON) {
      console.log("[coupons-worker] Running auto-expiry check...");

      const result = await Coupon.updateMany(
        {
          status: "active",
          expiresAt: { $lte: new Date() },
        },
        {
          $set: { status: "expired" },
        },
      );

      console.log(
        `[coupons-worker] Expired ${result.modifiedCount} active coupon(s).`,
      );
    } else {
      console.warn(`[coupons-worker] Unknown job: ${job.name}`);
    }
  },
  {
    connection: workerConnection,
    concurrency: 1,
  },
);

worker.on("completed", (job) => {
  console.log(`[coupons-worker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[coupons-worker] Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[coupons-worker] Worker error:", err);
});

async function shutdown(signal) {
  console.log(`[coupons-worker] ${signal} received, closing worker...`);
  await worker.close();
  await queue.close();
  await workerConnection.quit();
  await queueConnection.quit();
  if (mongoose.connection.readyState >= 1) {
    await mongoose.disconnect();
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

console.log("[coupons-worker] Coupons worker started");
