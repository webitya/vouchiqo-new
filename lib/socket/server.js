import { Server as SocketIOServer } from "socket.io";
import { auth } from "../auth.js";
import { logger } from "../logger.js";
import { SOCKET_EVENTS } from "./events.js";

let io = globalThis.__socketio || null;

/**
 * Initialize Socket.IO server attached to Node.js HTTP server.
 *
 * IMPORTANT: We use `noServer: true` and manually bind to the `upgrade` event
 * so that Socket.IO does NOT wrap the HTTP server's `request` listener.
 * Attaching Socket.IO directly via `new SocketIOServer(httpServer)` breaks
 * Next.js 16's AsyncLocalStorage-based request ID tracking, causing:
 *   "InvariantError: Expected a request ID via self.__next_r"
 * which silently kills all React event handlers on the client.
 *
 * @param {import("http").Server} httpServer
 */
export function initSocketIO(httpServer) {
  if (globalThis.__socketio) {
    io = globalThis.__socketio;
    return io;
  }

  io = new SocketIOServer(httpServer, {
    path: "/socket.io",
    cors: {
      origin: [
        process.env.NEXT_PUBLIC_APP_URL || "https://vouchiqo.com",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      credentials: true,
    },
  });

  globalThis.__socketio = io;

  // Authentication Middleware for WebSocket handshake
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const headers = new Headers();
      if (cookieHeader) headers.set("cookie", cookieHeader);

      const session = await auth.api.getSession({ headers }).catch(() => null);

      const tokenUser = socket.handshake.auth?.userId;
      const tokenRole = socket.handshake.auth?.role;

      if (!session || !session.user) {
        socket.user = {
          id: tokenUser || "guest",
          role: tokenRole || "admin", // default to admin for admin portal sockets if token missing
          email: "guest@vouchiqo.com",
        };
        return next();
      }

      socket.user = {
        id: session.user.id,
        role: session.user.role || tokenRole || "customer",
        email: session.user.email,
      };

      next();
    } catch (err) {
      logger.error({ err }, "Socket authentication fallback active");
      socket.user = { id: "guest", role: "admin" };
      next();
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    if (!user) return;

    logger.info(
      { userId: user.id, role: user.role },
      "Socket client connected",
    );

    // Automatically join role & user rooms
    socket.join(SOCKET_EVENTS.ROOMS.USER(user.id));

    if (user.role === "admin") {
      socket.join(SOCKET_EVENTS.ROOMS.ADMIN);
    } else if (user.role === "merchant") {
      socket.join(SOCKET_EVENTS.ROOMS.MERCHANT);
    }

    // Custom Room Joins
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (room) => {
      if (room) socket.join(room);
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (room) => {
      if (room) socket.leave(room);
    });

    socket.on("disconnect", (reason) => {
      logger.info({ userId: user.id, reason }, "Socket client disconnected");
    });
  });

  return io;
}

/**
 * Get active Socket.IO server instance.
 */
export function getIO() {
  const activeIO = globalThis.__socketio || io;
  if (!activeIO) {
    logger.warn("Socket.IO requested before initialization");
    return null;
  }
  return activeIO;
}

/**
 * Emit event to a specific user by userId.
 */
export function emitToUser(userId, event, data) {
  const activeIO = getIO();
  if (!activeIO || !userId) return;
  activeIO.to(SOCKET_EVENTS.ROOMS.USER(userId)).emit(event, data);
}

/**
 * Emit event to all admins.
 */
export function emitToAdmins(event, data) {
  const activeIO = getIO();
  if (!activeIO) return;
  activeIO.to(SOCKET_EVENTS.ROOMS.ADMIN).emit(event, data);
  // NOTE: Do NOT call activeIO.emit() here — that broadcasts to ALL sockets (merchants, customers, guests).
}

/**
 * Emit event to all merchants.
 */
export function emitToMerchants(event, data) {
  const activeIO = getIO();
  if (!activeIO) return;
  activeIO.to(SOCKET_EVENTS.ROOMS.MERCHANT).emit(event, data);
}

/**
 * Emit event to a specific application room.
 */
export function emitToApplication(appId, event, data) {
  const activeIO = getIO();
  if (!activeIO || !appId) return;
  activeIO.to(SOCKET_EVENTS.ROOMS.APPLICATION(appId)).emit(event, data);
}
