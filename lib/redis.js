import { Redis } from "ioredis";
import { logger } from "./logger.js";
import { env } from "../utils/env.js";

/**
 * Redis singleton.
 *
 * maxRetriesPerRequest: null is required by BullMQ.
 * commandTimeout: 3000 prevents slow/unreachable Redis queries from hanging HTTP requests.
 * connectTimeout: 5000 limits handshake time.
 */
function createClient() {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    connectTimeout: 5000,
    commandTimeout: 3000,
    enableReadyCheck: true,
  });

  client.on("connect", () => logger.info("Redis connected"));
  client.on("error", (err) => logger.error({ err }, "Redis error"));
  client.on("close", () => logger.warn("Redis connection closed"));

  return client;
}

const cache = global.__redis ?? { client: null };
global.__redis = cache;

if (!cache.client) {
  cache.client = createClient();
}

export const redis = cache.client;

/**
 * Factory for BullMQ queue and worker connections.
 * BullMQ requires maxRetriesPerRequest: null, no short commandTimeout (since workers use blocking commands),
 * and enableReadyCheck: false.
 */
export function createQueueConnection() {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    connectTimeout: 10000,
    lazyConnect: false,
  });

  client.on("error", (err) => logger.error({ err }, "Queue Redis connection error"));

  return client;
}


/**
 * Non-blocking pattern deletion using Redis SCAN + Pipeline.
 * Avoids blocking Redis single-threaded event loop with KEYS command in production.
 */
export async function scanDel(pattern) {
  if (!redis || redis.status !== "ready") return 0;
  return new Promise((resolve) => {
    try {
      const stream = redis.scanStream({ match: pattern, count: 100 });
      const pipeline = redis.pipeline();
      let count = 0;
      stream.on("data", (keys = []) => {
        for (const k of keys) {
          pipeline.del(k);
          count++;
        }
      });
      stream.on("end", async () => {
        if (count > 0) {
          await pipeline.exec().catch(() => {});
        }
        resolve(count);
      });
      stream.on("error", () => resolve(0));
    } catch (_) {
      resolve(0);
    }
  });
}
