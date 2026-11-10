import pino from "pino";
import { env } from "../utils/env.js";

const isDev =
  env.NODE_ENV !== "production" && !process.env.VERCEL && !process.env.CI;

let transport;
if (isDev) {
  try {
    // Only attempt to use pino-pretty if available
    require.resolve("pino-pretty");
    transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
      },
    };
  } catch (e) {
    // pino-pretty is not installed or available
  }
}

export const logger = pino({
  level: isDev ? "debug" : "info",
  ...(transport && { transport }),
});
