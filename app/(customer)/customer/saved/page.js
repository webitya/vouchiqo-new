"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SavedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/profile?tab=saved");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-surface">
      <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
