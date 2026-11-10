import { createServer } from "node:http";
import nextEnv from "@next/env";
import next from "next";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

import { logger } from "./lib/logger.js";
import { initSocketIO } from "./lib/socket/server.js";

const dev = process.env.NODE_ENV !== "production";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    if (req.url?.startsWith("/socket.io")) return;
    handle(req, res);
  });

  // Attach Socket.IO to HTTP server
  initSocketIO(httpServer);

  httpServer.listen(port, () => {
    logger.info(`> Vouchiqo server ready on http://localhost:${port}`);
  });
});
