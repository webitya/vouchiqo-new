"use client";

import Link from "next/link";
import { useState } from "react";
import {
  POPULAR_MERCHANTS_SIDEBAR,
  SIDEBAR_NAV,
} from "@/utils/shared-navigation";

/**
 * Shared sidebar used by Brands, Categories, Merchants, Campaigns listing pages.
 * Clean, raw shadcn style sidebar component.
 *
 * @param {string} activeNavKey - The `label` from SIDEBAR_NAV that should be highlighted
 * @param {string} aboutTitle - Title for the "About" section
 * @param {string} aboutText - Description text for the "About" section
 */
export default function Sidebar({
  activeNavKey,
  aboutTitle = "About",
  aboutText = "",
}) {
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);

  const navWithActive = SIDEBAR_NAV.map((nav) => ({
    ...nav,
    active: nav.label === activeNavKey,
  }));

  const visibleMerchants = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  return (
    <aside className="w-full space-y-4 text-left select-none">
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-1.5 space-y-0.5">
          {navWithActive.map((nav) => (
            <Link
              key={nav.label}
              href={nav.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                nav.active
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <img
                src={nav.icon}
                alt={nav.label}
                className={`w-4 h-4 transition-all ${
                  nav.active
                    ? "brightness-0 invert dark:brightness-100 dark:invert-0"
                    : "opacity-75"
                }`}
              />
              <span>{nav.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* About Section */}
      {aboutText && (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-xs space-y-2">
          <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-850 pb-2">
            {aboutTitle}
          </h2>
          <p
            className={`text-xs text-slate-500 dark:text-slate-400 leading-relaxed ${
              showMoreAbout ? "" : "line-clamp-3"
            }`}
          >
            {aboutText}
          </p>
          {aboutText.length > 120 && (
            <button
              onClick={() => setShowMoreAbout((v) => !v)}
              className="text-xs font-semibold text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer"
            >
              {showMoreAbout ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Popular Merchants */}
      <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-850 pb-2">
          Popular Merchants
        </h3>
        <div className="flex flex-col gap-1.5">
          {visibleMerchants.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              prefetch={true}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary transition-colors py-0.5"
            >
              {m.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => setShowAllMerchants((v) => !v)}
          className="text-xs font-semibold text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer pt-1"
        >
          {showAllMerchants ? "See less" : "See more"}
        </button>
      </div>
    </aside>
  );
}
