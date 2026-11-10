"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// Centralised cache times — import these in useQuery calls for consistency
export const STALE = {
  session: 5 * 60 * 1000, // 5 min  — matches better-auth cookieCache
  profile: 2 * 60 * 1000, // 2 min
  coupons: 60 * 1000, // 1 min
  analytics: 30 * 1000, // 30 sec — changes frequently
  static: 10 * 60 * 1000, // 10 min — merchants list, categories
};

import { SocketProvider } from "@/components/shared/SocketProvider";

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE.coupons, // 1 min default
            gcTime: 5 * 60 * 1000, // keep unused cache 5 min
            refetchOnWindowFocus: false,
            retry: 1, // one retry on failure
          },
          mutations: {
            onError: () => {}, // mutations handle errors via onError in hooks
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>{children}</SocketProvider>
    </QueryClientProvider>
  );
}
