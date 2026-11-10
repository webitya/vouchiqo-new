"use client";

/**
 * Shared grid column toggle buttons for listing pages.
 *
 * @param {number} gridCols - Currently selected column count
 * @param {Function} onGridChange - Callback when column count changes
 * @param {number[]} options - Array of column count options (e.g. [2, 3, 4])
 */
export default function GridToggle({
  gridCols,
  onGridChange,
  options = [2, 3, 4],
}) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {options.map((cols) => (
        <button
          key={cols}
          onClick={() => onGridChange?.(cols)}
          title={`${cols} Columns`}
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            border: "1px solid #e8eaf0",
            background: gridCols === cols ? "#3b5bdb" : "#fff",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        >
          {Array.from({ length: cols }).map((_, i) => (
            <span
              key={i}
              style={{
                display: "block",
                width: gridCols === 4 ? 4 : gridCols === 3 ? 5 : 7,
                height: 14,
                borderRadius: 2,
                background: gridCols === cols ? "#fff" : "#9ca3af",
              }}
            />
          ))}
        </button>
      ))}
    </div>
  );
}
