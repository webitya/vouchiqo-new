"use client";

import Link from "next/link";

/**
 * Shared breadcrumb navigation for listing pages.
 * Pass an array of segments: [{ label, href }]
 * The last segment is rendered as non-link text.
 */
export default function Breadcrumb({ segments = [] }) {
  return (
    <div
      style={{
        maxWidth: 1248,
        margin: "0 auto",
        padding: "12px 20px 0",
      }}
    >
      <ul
        style={{
          display: "flex",
          gap: 8,
          listStyle: "none",
          fontSize: 13,
          color: "#6b7280",
          alignItems: "center",
        }}
      >
        {segments.map((seg, idx) => {
          const isLast = idx === segments.length - 1;
          return (
            <li
              key={seg.label}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              {idx > 0 && <span style={{ color: "#9ca3af" }}>›</span>}
              {isLast
                ? <span style={{ color: "#374151", fontWeight: 500 }}>
                    {seg.label}
                  </span>
                : <Link
                    href={seg.href}
                    style={{ color: "#3b5bdb", textDecoration: "none" }}
                  >
                    {seg.label}
                  </Link>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
