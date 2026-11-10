"use client";

/**
 * Shared page header with icon, title, stats, and verified date.
 * Used by Brands, Categories, Merchants, Campaigns listing pages.
 *
 * @param {string} title - Page heading text
 * @param {React.ReactNode} icon - Icon element (SVG or lucide)
 * @param {Array} stats - [{ value, label }] stat blocks
 * @param {string} verifiedDate - Verified on date string
 */
export default function PageHeader({
  title,
  icon,
  stats = [],
  verifiedDate = "",
}) {
  return (
    <section
      style={{
        background: "#fff",
        borderBottom: "1px solid #e8eaf0",
        paddingBottom: 0,
      }}
    >
      <div
        style={{
          maxWidth: 1248,
          margin: "0 auto",
          padding: "16px 20px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Left: icon + title + stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#eef2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#111827",
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              {title}
            </h1>
          </div>
          {stats.length > 0 && (
            <div style={{ display: "flex", gap: 24, marginLeft: 12 }}>
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "#111827",
                      margin: 0,
                    }}
                  >
                    {stat.value}
                  </p>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                    <span style={{ fontWeight: 600 }}>Total</span> {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Verified date */}
        {verifiedDate && (
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            Verified On: {verifiedDate}
          </p>
        )}
      </div>
    </section>
  );
}
