"use client";

import {
  ChevronRight,
  Gift,
  LayoutGrid,
  MapPin,
  Store,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  POPULAR_MERCHANTS_SIDEBAR,
  SIDEBAR_NAV,
} from "@/utils/shared-navigation";

const SIDEBAR_ICONS = {
  Categories: LayoutGrid,
  Stores: Store,
  Brands: Tag,
  Festivals: Gift,
  "Cities Deals": MapPin,
};

function getSidebarIcon(label, isActive) {
  const IconComponent = SIDEBAR_ICONS[label] || Tag;
  return (
    <IconComponent
      style={{
        width: 14,
        height: 14,
        color: isActive ? "#ffffff" : "#64748b",
        flexShrink: 0,
      }}
    />
  );
}

export default function DirectoryLayout({
  activeKey,
  title,
  icon: IconComponent = Store,
  stat1,
  stat2,
  aboutTitle,
  aboutText,
  actionElement,
  children,
}) {
  const [mounted, setMounted] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [showAllMerchants, setShowAllMerchants] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleSidebarMerchants = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 6);

  return (
    <main
      style={{
        background: "#ffffff",
        minHeight: "80vh",
        paddingBottom: 60,
        width: "100%",
      }}
    >
      {/* ── BREADCRUMB ── */}
      <div style={{ borderBottom: "1px solid #f3f4f6", background: "#ffffff" }}>
        <div
          style={{
            width: "100%",
            padding: "12px 24px",
            display: "flex",
            gap: 8,
            fontSize: 13,
            color: "#4b5563",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Home
          </Link>
          <span style={{ color: "#9ca3af" }}>/</span>
          <span style={{ color: "#111827", fontWeight: 500 }}>{title}</span>
        </div>
      </div>

      {/* ── PAGE HEADER ── */}
      <section className="w-full bg-white border-b border-slate-200 px-4 py-3 md:px-6 md:py-5">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-5">
          <div className="flex items-center gap-3 md:gap-5">
            {/* Icon Box */}
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-slate-700" />
            </div>

            <div>
              {/* Title */}
              <h1 className="text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {title}
              </h1>

              {/* Mobile Stats */}
              <div
                className="flex md:hidden items-center gap-3 text-[11px] text-slate-600 mt-0.5"
                suppressHydrationWarning
              >
                <span>
                  {stat1?.shortLabel || stat1?.label} :{" "}
                  <strong className="font-bold text-slate-900">
                    {stat1?.count}
                  </strong>
                </span>
                <span>
                  Coupons &amp; Offers :{" "}
                  <strong className="font-bold text-slate-900">
                    {stat2?.count}
                  </strong>
                </span>
              </div>
            </div>

            {/* Desktop Stats */}
            <div
              className="hidden md:flex items-center gap-7 pl-5 border-l border-slate-200"
              suppressHydrationWarning
            >
              <div>
                <span className="text-lg font-extrabold text-slate-900 block leading-none mb-1">
                  {stat1?.count}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {stat1?.label}
                </span>
              </div>

              <div>
                <span className="text-lg font-extrabold text-slate-900 block leading-none mb-1">
                  {stat2?.count}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {stat2?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Far Right: Action element + Verified On Date */}
          <div className="flex items-center gap-4">
            {actionElement}
            <div
              className="hidden md:block text-xs text-slate-500 font-medium"
              suppressHydrationWarning
            >
              Verified On:{" "}
              {mounted
                ? new Date()
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      weekday: "short",
                    })
                    .toUpperCase()
                : "22 JUL 2026 (WED)"}
            </div>
          </div>
        </div>
      </section>

      {/* ── TWO-COLUMN LAYOUT ── */}
      <div
        style={{
          width: "100%",
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "240px 1fr",
          gap: 24,
          alignItems: "start",
        }}
        className="stores-grid-layout"
      >
        {/* ── SIDEBAR ── */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Nav Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              padding: 8,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            {SIDEBAR_NAV.map((nav) => {
              const isActive = nav.label === activeKey;
              return (
                <Link
                  key={nav.label}
                  href={nav.href}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "9px 14px",
                      borderRadius: 4,
                      background: isActive ? "#2563eb" : "transparent",
                      color: isActive ? "#ffffff" : "#374151",
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      marginBottom: 2,
                    }}
                    className={isActive ? "" : "sidebar-item-hover"}
                  >
                    {getSidebarIcon(nav.label, isActive)}
                    <span>{nav.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* About Card */}
          {aboutTitle && (
            <div
              style={{
                background: "#ffffff",
                borderRadius: 6,
                border: "1px solid #e5e7eb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                padding: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#000000",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  margin: "0 0 10px 0",
                  paddingBottom: 6,
                  borderBottom: "2px solid #2563eb",
                  display: "inline-block",
                }}
              >
                {aboutTitle}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: "#4b5563",
                  lineHeight: 1.6,
                  margin: 0,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: showMoreAbout ? "unset" : 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {aboutText}
              </p>
              <button
                onClick={() => setShowMoreAbout((v) => !v)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  padding: "6px 0 0",
                  display: "block",
                }}
              >
                {showMoreAbout ? "Show Less" : "Read More"}
              </button>
            </div>
          )}

          {/* Popular Merchants Card */}
          <div
            style={{
              background: "#ffffff",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              padding: "16px",
            }}
          >
            <h3
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#000000",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 10px 0",
                paddingBottom: 6,
                borderBottom: "2px solid #2563eb",
                display: "inline-block",
              }}
            >
              Popular Merchants
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visibleSidebarMerchants.map((m) => (
                <Link
                  key={m.label}
                  href={m.href}
                  prefetch={true}
                  style={{
                    fontSize: 12,
                    color: "#4b5563",
                    textDecoration: "none",
                    fontWeight: 500,
                    transition: "color 0.15s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  className="sidebar-link-item"
                >
                  <span>{m.label}</span>
                  <ChevronRight
                    style={{ width: 12, height: 12, color: "#9ca3af" }}
                  />
                </Link>
              ))}
            </div>
            <button
              onClick={() => setShowAllMerchants((v) => !v)}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
                padding: "8px 0 0",
                marginTop: 4,
                display: "block",
              }}
            >
              {showAllMerchants ? "See less" : "See more"}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {children}
        </div>
      </div>

      <style>{`
        .sidebar-item-hover:hover {
          background: #f8fafc !important;
          color: #2563eb !important;
        }
        .sidebar-link-item:hover {
          color: #2563eb !important;
        }
        .brand-card-hover:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
          border-color: #2563eb !important;
          transform: translateY(-1px);
        }
        .grid-btn-hover:hover {
          background: #f8fafc !important;
          color: #2563eb !important;
          border-color: #2563eb !important;
        }
        @media (max-width: 900px) {
          .stores-grid-layout {
            grid-template-columns: 1fr !important;
            padding: 12px !important;
            gap: 16px !important;
          }
        }
        @media (max-width: 640px) {
          .all-stores-responsive-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
          }
        }
        @media (max-width: 480px) {
          .all-stores-responsive-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 6px !important;
          }
        }
      `}</style>
    </main>
  );
}
