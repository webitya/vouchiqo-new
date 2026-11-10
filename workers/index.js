/**
 * Master Workers Runner for Vouchiqo
 * Runs all 4 background workers in a single managed process.
 * Useful for local development and lightweight deployments.
 */

import nextEnv from "@next/env";
if (typeof process !== "undefined" && process.cwd) {
  try {
    const { loadEnvConfig } = nextEnv;
    loadEnvConfig(process.cwd());
  } catch (_) {}
}

import "./analytics.worker.js";
import "./coupons.worker.js";
import "./notifications.worker.js";
import "./revivals.worker.js";

console.log("[vouchiqo-workers] All 4 background workers successfully initialized and active.");
