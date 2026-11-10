"use client";

import { ALPHA_LETTERS } from "@/utils/shared-navigation";

/**
 * Shared alphabetical filter bar + search input for listing pages.
 *
 * @param {string} activeLetter - Currently active letter filter ("all" or a letter)
 * @param {string[]} availableLetters - Letters that have matching items
 * @param {string} searchQuery - Current search text
 * @param {string} searchPlaceholder - Placeholder for search input
 * @param {Function} onLetterChange - Callback when letter is clicked
 * @param {Function} onSearchChange - Callback when search input changes
 */
export default function AlphaFilter({
  activeLetter = "all",
  availableLetters = [],
  searchQuery = "",
  searchPlaceholder = "Search...",
  onLetterChange,
  onSearchChange,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
        paddingBottom: 14,
        borderBottom: "1px solid #f1f3f9",
      }}
    >
      {/* Alpha letters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          flex: 1,
          minWidth: 0,
        }}
      >
        <button
          onClick={() => onLetterChange?.("all")}
          style={{
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid",
            borderColor: activeLetter === "all" ? "#3b5bdb" : "#e8eaf0",
            background: activeLetter === "all" ? "#3b5bdb" : "transparent",
            color: activeLetter === "all" ? "#fff" : "#6b7280",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          All
        </button>
        {ALPHA_LETTERS.map((letter) => (
          <button
            key={letter}
            onClick={() =>
              onLetterChange?.(activeLetter === letter ? "all" : letter)
            }
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: "1px solid",
              borderColor: activeLetter === letter ? "#3b5bdb" : "#e8eaf0",
              background: activeLetter === letter ? "#3b5bdb" : "transparent",
              color: activeLetter === letter ? "#fff" : "#374151",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          border: "1px solid #e8eaf0",
          borderRadius: 8,
          padding: "7px 12px",
          background: "#f9fafb",
          minWidth: 200,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 13,
            color: "#374151",
            outline: "none",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
}
