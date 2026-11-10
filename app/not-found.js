"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Home,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f6fa] text-[#191f2e] font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-xl w-full text-center space-y-8 bg-white border border-[#e2e8f0] rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden">
          {/* Decorative glowing gradient backdrop */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#3e80dd] via-purple-500 to-[#2563eb]" />

          {/* Warning Icon with floating animation */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#fef2f2] border border-[#fee2e2] flex items-center justify-center text-[#ef4444] animate-bounce">
              <AlertTriangle className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-7xl font-black text-[#191f2e] tracking-tighter">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-black text-[#1f2937]">
              Oops! Page Not Found
            </h2>
            <p className="text-sm text-[#6b7280] leading-relaxed max-w-sm mx-auto font-medium">
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>
          </div>

          {/* Quick Category search suggestions */}
          <div className="border-t border-b border-[#f1f5f9] py-5 space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#6b7280]">
              Popular Directories
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/merchants"
                className="bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#3e80dd] hover:text-[#3e80dd] transition-all text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>All Stores</span>
              </Link>
              <Link
                href="/categories"
                className="bg-[#f8fafc] border border-[#e2e8f0] hover:border-[#3e80dd] hover:text-[#3e80dd] transition-all text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Categories</span>
              </Link>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.history.back();
                }
              }}
              type="button"
              className="bg-[#f1f5f9] hover:bg-[#e2e8f0] text-xs font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 border-0 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <Link
              href="/"
              className="bg-[#3e80dd] hover:bg-[#2563eb] text-white text-xs font-extrabold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Homepage</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
