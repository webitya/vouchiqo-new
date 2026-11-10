"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function FlatCouponCard({ coupon }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    setIsMobile(media.matches);
    const listener = (e) => setIsMobile(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const { _id, title, discountValue, discountType, merchantId } = coupon;

  const merchantName =
    merchantId?.businessName || merchantId?.name || "Partner";

  const getLogoUrl = () => {
    if (
      merchantId?.logo?.startsWith("/") ||
      merchantId?.logo?.startsWith("http")
    )
      return merchantId.logo;
    const nameLower = merchantName.toLowerCase();
    if (nameLower.includes("burger")) {
      return "/brandlogos/10030.jpg";
    }
    if (nameLower.includes("stylezone")) {
      return "/brandlogos/10021.jpg";
    }
    if (nameLower.includes("techgadgets")) {
      return "/brandlogos/10007.jpg";
    }
    if (nameLower.includes("marbella")) {
      return "/brandlogos/10024.jpg";
    }
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(merchantName)}&backgroundColor=3e80dd&textColor=ffffff`;
  };

  const logoUrl = getLogoUrl();
  const merchantLower = merchantName.toLowerCase();
  const titleLower = title.toLowerCase();

  /* ── LEFT BLOCK: determine the 3-line promo text ── */
  const getPromo = () => {
    // Amazon Prime Day
    if (
      merchantLower.includes("amazon") &&
      (titleLower.includes("prime") || titleLower.includes("day"))
    ) {
      return { top: "AMAZON", mid: "PRIME DAY", bot: "SALE" };
    }
    // End of Season Sale
    if (titleLower.includes("season") && titleLower.includes("sale")) {
      return { top: "END OF", mid: "SEASON", bot: "SALE" };
    }
    // Generic percentage / flat discount
    const isUpTo =
      titleLower.includes("up to") ||
      titleLower.includes("upto") ||
      titleLower.includes("grab up");
    const prefix = isUpTo ? "UP TO" : "FLAT";
    if (discountValue) {
      const valueText =
        discountType === "percentage"
          ? `${discountValue}%`
          : `₹${discountValue}`;
      return { top: prefix, mid: valueText, bot: "OFF" };
    }
    return { top: "SPECIAL", mid: "OFFER", bot: "TODAY" };
  };

  const promo = getPromo();

  /* ── LOGO CONTAINER: brand-specific background ── */
  const getLogoBg = () => {
    if (merchantLower.includes("amazon")) return "#000000";
    if (merchantLower.includes("flipkart")) return "#F7C037";
    return "#ffffff";
  };
  const logoBgColor = getLogoBg();
  const logoHasDarkBg =
    merchantLower.includes("amazon") || merchantLower.includes("flipkart");

  return (
    <div
      className="gh-ec"
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "6px",
        border: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        transition: "box-shadow 250ms ease, transform 250ms ease",
        overflow: "hidden",
        textAlign: "left",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {coupon.isLocal && (
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: 800,
            padding: "2px 8px",
            borderRadius: "9999px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 10,
          }}
        >
          Local Business
        </div>
      )}
      {/* ── TOP SECTION (amt) ── */}
      <div
        className="amt"
        style={{
          display: "flex",
          alignItems: "stretch",
          padding: isMobile ? "12px 14px" : "14px 16px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        {/* Left promo text (amt-header) */}
        <div
          className="amt-header"
          style={{
            width: isMobile ? "72px" : "96px",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            borderRight: "1px dashed #cbd5e1",
            paddingRight: isMobile ? "8px" : "12px",
          }}
        >
          <span
            style={{
              display: "block",
              fontSize: isMobile ? "9px" : "10px",
              fontWeight: 700,
              color: "#3E80DD",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              lineHeight: 1.2,
            }}
          >
            {promo.top}
          </span>
          <span
            style={{
              display: "block",
              fontSize: isMobile ? "17px" : "22px",
              fontWeight: 900,
              color: "#3E80DD",
              textTransform: "uppercase",
              lineHeight: 1.1,
              margin: "1px 0",
              wordBreak: "break-word",
            }}
          >
            {promo.mid}
          </span>
          <span
            style={{
              display: "block",
              fontSize: isMobile ? "9px" : "10px",
              fontWeight: 700,
              color: "#3E80DD",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              lineHeight: 1.2,
            }}
          >
            {promo.bot}
          </span>
        </div>

        {/* Right description (p) */}
        <p
          style={{
            flex: 1,
            paddingLeft: isMobile ? "10px" : "12px",
            fontSize: isMobile ? "12.5px" : "13.5px",
            fontWeight: 600,
            color: "#1e293b",
            lineHeight: 1.35,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </p>
      </div>

      {/* ── FOOTER SECTION (footer-links) ── */}
      <div
        data-div-type="footer-links"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "8px 12px" : "10px 16px",
          gap: isMobile ? "8px" : "12px",
          backgroundColor: "#F8FAFC",
        }}
      >
        {/* Merchant logo container (imw) */}
        <div
          className="imw"
          style={{
            height: isMobile ? "28px" : "34px",
            width: isMobile ? "56px" : "70px",
            borderRadius: "6px",
            border: logoHasDarkBg ? "none" : "1px solid #e2e8f0",
            backgroundColor: logoBgColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "3px",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Image
            src={logoUrl || "/placeholder-brand.png"}
            alt={merchantName || "Merchant Logo"}
            width={40}
            height={40}
            className="max-w-full max-h-full object-contain block"
            onError={(e) => {
              e.currentTarget.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%233e80dd' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* Get Offer Button Link */}
        <Link
          href={`/deals/${_id}`}
          style={{
            fontSize: isMobile ? "11px" : "12px",
            fontWeight: 700,
            color: "#ffffff",
            backgroundColor: "#2563eb",
            padding: isMobile ? "5px 10px" : "6px 14px",
            borderRadius: "6px",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            textDecoration: "none",
            boxShadow: "0 1px 3px rgba(37,99,235,0.2)",
            transition: "background-color 200ms ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1d4ed8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2563eb";
          }}
        >
          <span>Get Offer</span>
          <ExternalLink
            style={{
              width: isMobile ? "11px" : "13px",
              height: isMobile ? "11px" : "13px",
              color: "#ffffff",
            }}
          />
        </Link>
      </div>
    </div>
  );
}
