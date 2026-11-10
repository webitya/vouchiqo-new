"use client";

import { Gift, LayoutGrid, MapPin, Search, Store, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DirectoryLayout from "@/components/layout/DirectoryLayout";
import SafeImage from "@/components/shared/SafeImage";
import {
  ALPHA_LETTERS,
  POPULAR_MERCHANTS_SIDEBAR,
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
        width: 16,
        height: 16,
        color: isActive ? "#ffffff" : "#4b5563",
        flexShrink: 0,
      }}
    />
  );
}

function StoreCard({ store, imgHeight = 65 }) {
  const totalOffers = (store.coupons || 0) + (store.offers || 0);
  return (
    <Link
      href={`/brand/${store.slug}`}
      prefetch={true}
      style={{ textDecoration: "none" }}
    >
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 6,
          background: "#ffffff",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          transition: "all 0.2s ease-in-out",
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        }}
        className="brand-card-hover"
      >
        <div
          style={{
            height: imgHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#ffffff",
          }}
        >
          <SafeImage
            src={store.logo}
            alt={store.businessName}
            width={80}
            height={50}
            style={{
              maxHeight: "85%",
              maxWidth: "85%",
              objectFit: "contain",
            }}
          />
        </div>
        <div style={{ height: 1, background: "#f3f4f6" }} />
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#000000",
              margin: "0 0 2px 0",
            }}
          >
            {store.businessName}
          </p>
          <p
            style={{
              fontSize: 11,
              color: "#2563eb",
              fontWeight: 600,
              margin: 0,
            }}
          >
            {totalOffers} Active Offers
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function MerchantsClient({
  merchants,
  totalMerchants,
  totalCoupons,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLetter, setActiveLetter] = useState("all");
  const [gridCols, setGridCols] = useState(4);
  const [mounted, setMounted] = useState(false);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = params.get("search");
      if (query) {
        setSearchQuery(query);
        setActiveLetter("all");
      }
    }
  }, []);

  // Format database merchants
  const allMergedMerchants = useMemo(() => {
    return (merchants || []).map((m, idx) => ({
      businessName: m.businessName,
      slug: m.slug,
      logo: m.logo || `/brandlogos/${10002 + (idx % 42)}.jpg`,
      coupons: m.totalCoupons || 0,
      offers: m.totalCoupons ? Math.ceil(m.totalCoupons * 0.7) : 0,
    }));
  }, [merchants]);

  const filteredMerchantsList = useMemo(() => {
    let list = allMergedMerchants;
    if (activeLetter !== "all") {
      list = list.filter((m) =>
        m.businessName.toUpperCase().startsWith(activeLetter),
      );
    }
    if (searchQuery.trim()) {
      list = list.filter((m) =>
        m.businessName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return list;
  }, [allMergedMerchants, activeLetter, searchQuery]);

  const availableLetters = useMemo(() => {
    const set = new Set(
      allMergedMerchants.map((m) => m.businessName[0].toUpperCase()),
    );
    return set;
  }, [allMergedMerchants]);

  const formattedDate = useMemo(() => {
    if (!mounted) return "";
    return new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      weekday: "short",
    });
  }, [mounted]);

  const trendingStores = useMemo(() => {
    return allMergedMerchants.slice(0, 10);
  }, [allMergedMerchants]);

  const visibleSidebarMerchants = showAllMerchants
    ? POPULAR_MERCHANTS_SIDEBAR
    : POPULAR_MERCHANTS_SIDEBAR.slice(0, 8);

  const totalOffersCount = totalCoupons || 0;

  return (
    <DirectoryLayout
      activeKey="Stores"
      title="Stores"
      icon={Store}
      stat1={{
        count: totalMerchants || allMergedMerchants.length || 0,
        label: "Total Stores",
        shortLabel: "Stores",
      }}
      stat2={{
        count: (Number(totalOffersCount) || 0).toLocaleString(),
        label: "Total Verified Offers",
      }}
      aboutTitle="About Stores"
      aboutText="Who doesn't love a great deal? Vouchiqo brings you the best discounts from top stores like Amazon, Flipkart, Myntra, Nykaa, Swiggy, Domino's and more. From shopping for the latest fashion to ordering your favorite food, we have active offers for all your needs."
    >
      {/* Trending Stores */}
      <section
        style={{
          background: "#ffffff",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          padding: "16px 20px 20px",
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#000000",
            marginBottom: 16,
            letterSpacing: "-0.2px",
          }}
        >
          Trending Stores
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {trendingStores.map((store) => (
            <StoreCard key={store.slug} store={store} imgHeight={75} />
          ))}
        </div>
      </section>

      {/* All Stores */}
      <section
        style={{
          background: "#ffffff",
          borderRadius: 6,
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          padding: "16px 20px 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#000000",
              margin: 0,
              letterSpacing: "-0.2px",
            }}
          >
            All Stores
          </h2>
          <div style={{ display: "flex", gap: 4 }}>
            {[3, 4, 5].map((cols) => (
              <button
                key={cols}
                onClick={() => setGridCols(cols)}
                title={`${cols} Columns`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 4,
                  border: "1px solid #e5e7eb",
                  background: gridCols === cols ? "#2563eb" : "#ffffff",
                  color: gridCols === cols ? "#ffffff" : "#4b5563",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                className={gridCols === cols ? "" : "grid-btn-hover"}
              >
                <LayoutGrid style={{ width: 14, height: 14 }} />
              </button>
            ))}
          </div>
        </div>

        {/* Alpha + Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
            paddingBottom: 14,
            borderBottom: "1px solid #f3f4f6",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              flex: 1,
              minWidth: 0,
            }}
          >
            <button
              onClick={() => setActiveLetter("all")}
              style={{
                padding: "3px 8px",
                borderRadius: 4,
                border: "1px solid",
                borderColor: activeLetter === "all" ? "#2563eb" : "#e5e7eb",
                background: activeLetter === "all" ? "#2563eb" : "transparent",
                color: activeLetter === "all" ? "#ffffff" : "#4b5563",
                fontSize: 11,
                fontWeight: 700,
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
                  setActiveLetter(activeLetter === letter ? "all" : letter)
                }
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: activeLetter === letter ? "#2563eb" : "#e5e7eb",
                  background:
                    activeLetter === letter ? "#2563eb" : "transparent",
                  color: activeLetter === letter ? "#ffffff" : "#1f2937",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {letter}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #e5e7eb",
              borderRadius: 4,
              padding: "5px 10px",
              background: "#ffffff",
              minWidth: 200,
            }}
          >
            <Search style={{ width: 14, height: 14, color: "#9ca3af" }} />
            <input
              placeholder="Search by store name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 12,
                color: "#000000",
                outline: "none",
                width: "100%",
              }}
            />
          </div>
        </div>

        {/* Grid */}
        {filteredMerchantsList.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gap: "12px",
            }}
            className="all-stores-responsive-grid"
          >
            {filteredMerchantsList.map((m) => (
              <StoreCard key={m.slug} store={m} imgHeight={60} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "#9ca3af",
            }}
          >
            <p style={{ fontSize: 13 }}>
              No stores found for &quot;{searchQuery}&quot;
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveLetter("all");
              }}
              style={{
                marginTop: 12,
                padding: "6px 12px",
                borderRadius: 4,
                border: "none",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: 12,
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Clear Filter
            </button>
          </div>
        )}
      </section>
    </DirectoryLayout>
  );
}
