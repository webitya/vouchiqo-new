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
    <div className="min-h-screen flex flex-col bg-[#FFF8EF] text-[#35104A] font-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-xl w-full text-center space-y-8 bg-white border border-[#EADBCE] rounded-3xl p-8 md:p-12 shadow-lg relative overflow-hidden font-sans">
          {/* Decorative glowing gradient backdrop */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#35104A] via-[#007F79] to-[#FF2E63]" />

          {/* Warning Icon with floating animation */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-[#FF2E63]/10 border border-[#FF2E63]/20 flex items-center justify-center text-[#FF2E63] animate-bounce">
              <AlertTriangle className="w-10 h-10" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-7xl font-heading font-black text-[#35104A] tracking-tighter">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-[#35104A]">
              Oops! Page Not Found
            </h2>
            <p className="text-sm text-[#6B4C82] leading-relaxed max-w-sm mx-auto font-medium font-sans">
              The page you are looking for might have been removed, had its name
              changed, or is temporarily unavailable.
            </p>
          </div>

          {/* Quick Category search suggestions */}
          <div className="border-t border-b border-[#EADBCE] py-5 space-y-3">
            <p className="text-xs font-heading font-bold uppercase tracking-wider text-[#6B4C82]">
              Popular Directories
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/brands"
                className="bg-[#FFF8EF] border border-[#EADBCE] hover:border-[#007F79] hover:text-[#007F79] transition-all text-xs font-heading font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer text-[#35104A]"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>All Stores</span>
              </Link>
              <Link
                href="/categories"
                className="bg-[#FFF8EF] border border-[#EADBCE] hover:border-[#007F79] hover:text-[#007F79] transition-all text-xs font-heading font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer text-[#35104A]"
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
              className="bg-[#FFF8EF] hover:bg-[#EADBCE] text-xs font-heading font-bold text-[#35104A] py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-[#EADBCE] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <Link
              href="/"
              className="bg-[#FF2E63] hover:bg-[#E02253] text-white text-xs font-heading font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
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
