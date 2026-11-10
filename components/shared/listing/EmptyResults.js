"use client";

/**
 * Shared empty state for listing pages when no items match the filter.
 *
 * @param {string} searchQuery - Current search text (shown in message)
 * @param {string} itemType - Type of item (e.g. "brands", "categories", "stores")
 * @param {Function} onClearFilter - Callback to clear all filters
 */
export default function EmptyResults({ searchQuery, itemType, onClearFilter }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "48px 0",
        color: "#9ca3af",
      }}
    >
      <p style={{ fontSize: 14 }}>
        No {itemType} found for &quot;{searchQuery}&quot;
      </p>
      <button
        onClick={onClearFilter}
        style={{
          marginTop: 12,
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #3b5bdb",
          background: "#3b5bdb",
          color: "#fff",
          fontSize: 13,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Clear Filter
      </button>
    </div>
  );
}
