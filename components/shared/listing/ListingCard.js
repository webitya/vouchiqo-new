import { Tag } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import SafeImage from "@/components/shared/SafeImage";

export const ListingCard = memo(function ListingCard({
  name,
  slug,
  logo,
  coupons,
  offers,
  href,
  logoHeight = 80,
  showStats = true,
}) {
  const linkHref = href || `/brand/${slug}`;

  return (
    <Link href={linkHref} style={{ textDecoration: "none" }}>
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          background: "#fff",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
          e.currentTarget.style.borderColor = "#2563eb";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e5e7eb";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {/* Logo container */}
        <div
          style={{
            height: logoHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 6,
            background: "#fff",
          }}
        >
          <SafeImage
            src={logo}
            alt={name}
            width={72}
            height={72}
            fallbackSrc="/placeholder-brand.webp"
            className="max-h-[85%] max-w-[85%] object-contain"
          />
        </div>
        {/* Divider */}
        <div style={{ height: 1, background: "#f3f4f6" }} />
        {/* Content area */}
        <div style={{ padding: "12px", textAlign: "left" }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#000000",
              margin: "0 0 4px 0",
            }}
          >
            {name}
          </p>
          {showStats && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#2563eb",
                fontWeight: 600,
              }}
            >
              <Tag className="w-3 h-3 text-[#2563eb]" />
              <span>{coupons + offers} Active Offers</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

export default ListingCard;
