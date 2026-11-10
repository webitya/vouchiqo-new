"use client";

import { AlertTriangle, RefreshCw, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Log the runtime exception silently
    console.error("Unhandled Application Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-ivory text-royal-plum font-sans p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-brand-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#35104A] via-[#007F79] to-[#FF2E63]" />

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-festival-pink/10 border border-festival-pink/20 flex items-center justify-center text-festival-pink shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold font-heading text-royal-plum tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs text-royal-plum/70 leading-relaxed font-medium">
            An unexpected application error occurred while loading this page. Click below to reload or return home.
          </p>
          {error?.message && (
            <div className="mt-2 p-2.5 bg-warm-ivory border border-brand-border rounded-xl text-[11px] font-mono text-royal-plum/80 text-left overflow-x-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset ? reset() : window.location.reload()}
            className="bg-festival-pink hover:bg-[#E02253] text-white text-xs font-bold font-heading py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md shadow-festival-pink/20 hover:scale-[1.02]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
          <Link
            href="/"
            className="bg-warm-ivory border border-brand-border hover:bg-brand-surface text-royal-plum text-xs font-bold font-heading py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
