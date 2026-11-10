"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socket/client";

/**
 * Generic real-time event listener hook.
 * Subscribes to a socket event and executes a callback function safely.
 * Handles reconnection auto-resubscription seamlessly.
 *
 * @param {string} eventName - Socket event name to listen for
 * @param {Function} callback - Callback function executed when event triggers
 */
export function useRealtime(eventName, callback) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!eventName) return;

    const socket = getSocket();
    if (!socket) return;

    const handleEvent = (data) => {
      if (typeof savedCallback.current === "function") {
        savedCallback.current(data);
      }
    };

    // Attach listener to active socket
    socket.on(eventName, handleEvent);

    // Re-bind listener automatically upon socket reconnection
    const handleConnect = () => {
      socket.off(eventName, handleEvent);
      socket.on(eventName, handleEvent);
    };

    socket.on("connect", handleConnect);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off(eventName, handleEvent);
      socket.off("connect", handleConnect);
    };
  }, [eventName]);
}
