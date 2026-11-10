"use client";

import { io } from "socket.io-client";

let socket = null;

/**
 * Get or initialize browser-side Socket.IO client singleton.
 *
 * @param {{ userId?: string, role?: string }} [authParams]
 * @returns {import("socket.io-client").Socket}
 */
export function getSocket(authParams = {}) {
  if (typeof window === "undefined") return null;

  if (!socket) {
    const origin = window.location.origin;
    socket = io(origin, {
      path: "/socket.io",
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: authParams,
    });
  } else if (
    authParams.userId &&
    (!socket.auth?.userId || socket.auth.userId !== authParams.userId)
  ) {
    socket.auth = authParams;
    if (socket.connected) {
      socket.disconnect().connect();
    }
  }

  if (!socket.connected) {
    socket.connect();
  }

  if (authParams.userId && socket.connected) {
    socket.emit("room:join", `user:${authParams.userId}`);
  }

  return socket;
}
