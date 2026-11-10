"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/use-user";

/**
 * Custom hook to manage process-based feedback modal state,
 * API interactions, and frequency dismissal caching.
 *
 * @param {string} processType - e.g. "profile_completion"
 */
export function useProcessFeedback(processType = "profile_completion") {
  const { user, isLoggedIn } = useUser();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const storageKey = `vouchiqo_feedback_${processType}_${user?.id || "guest"}`;

  // Check backend feedback status
  const { data: statusData, isLoading: isCheckingStatus } = useQuery({
    queryKey: ["feedback-status", processType, user?.id],
    queryFn: async () => {
      if (!isLoggedIn) return { hasSubmitted: true, hasDismissed: true };
      const res = await fetch(
        `/api/feedback/process?processType=${encodeURIComponent(processType)}`,
      );
      if (!res.ok) return { hasSubmitted: false, hasDismissed: false };
      const json = await res.json();
      return json.data || { hasSubmitted: false, hasDismissed: false };
    },
    enabled: Boolean(isLoggedIn && user?.id),
    staleTime: 1000 * 60 * 10,
  });

  const hasResponded = Boolean(
    statusData?.hasSubmitted ||
      statusData?.hasDismissed ||
      (typeof window !== "undefined" &&
        (localStorage.getItem(storageKey) === "true" ||
          localStorage.getItem(`vouchiqo_feedback_dismissed_${processType}`) ===
            "true")),
  );

  const openFeedback = useCallback(() => {
    if (!hasResponded) {
      setIsOpen(true);
    }
  }, [hasResponded]);

  const closeFeedback = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Submit feedback mutation
  const submitMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch("/api/feedback/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          processType,
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "Failed to submit feedback");
      }
      return res.json();
    },
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, "true");
      }
      queryClient.invalidateQueries({
        queryKey: ["feedback-status", processType],
      });
      toast.success("Thank you! Your feedback helps us improve Vouchiqo.");
      setIsOpen(false);
    },
    onError: (err) => {
      toast.error(err.message || "Could not submit feedback. Try again.");
    },
  });

  // Dismiss feedback mutation
  const dismissMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/feedback/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "dismiss",
          processType,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, "true");
      }
      queryClient.invalidateQueries({
        queryKey: ["feedback-status", processType],
      });
      setIsOpen(false);
    },
  });

  const handleDismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "true");
      localStorage.setItem(
        `vouchiqo_feedback_dismissed_${processType}`,
        "true",
      );
    }
    dismissMutation.mutate();
    setIsOpen(false);
  }, [storageKey, processType, dismissMutation]);

  return {
    isOpen,
    setIsOpen,
    openFeedback,
    closeFeedback,
    hasResponded,
    isCheckingStatus,
    submitFeedback: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    dismissFeedback: handleDismiss,
  };
}
