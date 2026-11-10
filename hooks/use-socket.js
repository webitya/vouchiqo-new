"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook to connect and manage Socket.IO client instance asynchronously.
 * Defers loading of socket.io-client until autoConnect is true (backoffice roles only),
 * keeping the public storefront bundles completely free of socket dependencies.
 *
 * @param {{ userId?: string, role?: string, autoConnect?: boolean }} [options]
 * @returns {{ isConnected: boolean, isAuthenticated: boolean, socket: any, emit: Function }}
 */
export function useSocket(options = {}) {
  const { userId, role, autoConnect = true } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!autoConnect || typeof window === "undefined") return;

    let isCancelled = false;

    // Dynamically load socket client on-demand so public visitors never bundle socket.io-client
    import("@/lib/socket/client").then(({ getSocket }) => {
      if (isCancelled) return;

      const s = getSocket({ userId, role });
      if (!s) return;

      socketRef.current = s;
      setSocket(s);

      if (userId && (!s.auth?.userId || s.auth.userId !== userId)) {
        s.auth = { userId, role };
        if (s.connected) {
          s.disconnect().connect();
        }
      }

      if (userId && s.connected) {
        s.emit("room:join", `user:${userId}`);
      }

      if (!s.connected) {
        s.connect();
      }

      function onConnect() {
        setIsConnected(true);
        setIsAuthenticated(true);
      }

      function onDisconnect(reason) {
        setIsConnected(false);
        setIsAuthenticated(false);
        if (reason === "io server disconnect") {
          s.connect();
        }
      }

      function onConnectError(err) {
        setIsConnected(false);
        setIsAuthenticated(false);
        console.warn("[useSocket] Socket connection error:", err.message);
      }

      s.on("connect", onConnect);
      s.on("disconnect", onDisconnect);
      s.on("connect_error", onConnectError);

      if (s.connected) {
        setIsConnected(true);
        setIsAuthenticated(true);
      }
    });

    return () => {
      isCancelled = true;
      const s = socketRef.current;
      if (s) {
        s.off("connect");
        s.off("disconnect");
        s.off("connect_error");
      }
    };
  }, [userId, role, autoConnect]);

  const emit = useCallback(
    (eventName, data) => {
      const s = socketRef.current;
      if (s && isConnected) {
        s.emit(eventName, data);
      }
    },
    [isConnected],
  );

  return { isConnected, isAuthenticated, socket, emit };
}
