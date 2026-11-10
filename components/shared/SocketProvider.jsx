"use client";

import { createContext, useContext } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useUser } from "@/hooks/use-user";

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  isAuthenticated: false,
  emit: () => {},
});

export function SocketProvider({ children }) {
  const { user } = useUser();
  // Only connect real-time socket for authenticated staff (admin/merchant).
  // Public guests and shoppers never open WebSocket connections.
  const isStaffRole = Boolean(
    user && (user.role === "admin" || user.role === "merchant"),
  );

  const socketState = useSocket({
    userId: user?.id || user?._id,
    role: user?.role || "customer",
    autoConnect: isStaffRole,
  });

  return (
    <SocketContext.Provider value={socketState}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  return useContext(SocketContext);
}
