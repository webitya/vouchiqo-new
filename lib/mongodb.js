import mongoose from "mongoose";
import { logger } from "./logger.js";
import { env } from "../utils/env.js";

/**
 * Mongoose connection singleton.
 *
 * Next.js runs in a serverless-like environment where modules can be re-evaluated.
 * We cache the connection on the global object to avoid creating multiple connections
 * across hot reloads in development.
 */
const cache = global.__mongoose ?? { conn: null, promise: null };
global.__mongoose = cache;

export async function connectDB() {
  if (cache.conn && mongoose.connection.readyState === 1) return cache.conn;

  if (
    !cache.promise ||
    mongoose.connection.readyState === 0 ||
    mongoose.connection.readyState === 3
  ) {
    cache.conn = null;
    const opts = {
      bufferCommands: false,
      maxPoolSize: 25,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
    };

    cache.promise = mongoose
      .connect(env.MONGODB_URI, opts)
      .then((m) => {
        logger.info("MongoDB connected");
        return m;
      })
      .catch((err) => {
        logger.error({ err }, "MongoDB connection failed");
        cache.promise = null;
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
