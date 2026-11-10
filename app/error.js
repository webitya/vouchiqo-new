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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] text-[#191f2e] font-sans p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-500" />

        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Something Went Wrong
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            An unexpected application error occurred while loading this page. Click below to reload or return home.
          </p>
          {error?.message && (
            <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] font-mono text-slate-600 text-left overflow-x-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset ? reset() : window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm hover:scale-[1.02]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
          <Link
            href="/"
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
