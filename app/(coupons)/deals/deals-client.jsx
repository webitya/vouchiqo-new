"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";
import { Search, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";
import CouponCard from "@/components/shared/cards/CouponCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ─── Skeleton Card ─── */
function SkeletonCard() {
  return (
    <div className="relative bg-white border border-slate-100 rounded-xl overflow-hidden flex flex-col h-full animate-pulse shadow-sm">
      {/* Top section */}
      <div className="p-4 flex-1 space-y-3">
        {/* Merchant row */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-slate-200" />
          <div className="h-2.5 w-24 rounded bg-slate-200" />
        </div>
        {/* Discount badge */}
        <div className="h-5 w-28 rounded bg-slate-200" />
        {/* Title */}
        <div className="h-2.5 w-full rounded bg-slate-100" />
        {/* Description lines */}
        <div className="space-y-1.5">
          <div className="h-2 w-full rounded bg-slate-100" />
          <div className="h-2 w-3/4 rounded bg-slate-100" />
        </div>
      </div>
      {/* Divider */}
      <div className="border-t border-dashed border-slate-100 mx-3.5" />
      {/* Bottom section */}
      <div className="p-3.5 space-y-2.5">
        <div className="h-2.5 w-20 rounded bg-slate-100" />
        <div className="h-8 w-full rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

export default function DealsClient() {
  const searchParams = useSearchParams();
  const urlSearch = searchParams?.get("search") || searchParams?.get("q") || "";
  const [search, setSearch] = useState(urlSearch);

  useEffect(() => {
    const currentQ = searchParams?.get("search") || searchParams?.get("q") || "";
    if (currentQ !== search) {
      setSearch(currentQ);
    }
  }, [searchParams]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data: coupons = [], isLoading: loading } = useQuery({
    queryKey: qk.coupons.list({ search, sortBy, sortOrder, limit: "40" }),
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "40" });
      if (search) params.set("search", search);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const json = await apiFetch(`/api/coupons?${params.toString()}`);
      return json.data?.coupons || [];
    },
    staleTime: 60 * 1000,
  });

  const handleResetFilters = () => {
    setSearch("");
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-text">
      <Navbar />

      {/* ── Hero Banner ── */}
      <section
        className="relative overflow-hidden select-none py-12 md:py-14 px-4"
        style={{
          background:
            "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0e7ff 100%)",
        }}
      >
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #93c5fd 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Soft glow orb */}
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10 text-left">
          {/* Badge */}
          <span
            className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-4 text-blue-700"
            style={{
              backgroundColor: "rgba(37,99,235,0.10)",
              border: "1px solid rgba(37,99,235,0.18)",
            }}
          >
            🏷️ Offers Vault
          </span>

          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight mb-3">
            Browse All Verified Offers
          </h1>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
            Discover active discount codes, promo links, and limited-time deals
            from our verified merchants across India.
          </p>
        </div>
      </section>

      {/* ── Sticky Search & Filters Bar ── */}
      <div className="bg-white border-b border-slate-100 py-3.5 sticky top-[64px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search brand name, keywords or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 text-sm h-10 border-slate-200 bg-slate-50 rounded-lg focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-400 placeholder:text-slate-400"
              />
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
              <SelectTrigger className="h-10 text-xs w-[150px] border-slate-200 cursor-pointer bg-white font-semibold shadow-none text-slate-700 rounded-lg">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-100 shadow-lg rounded-xl">
                <SelectItem
                  value="createdAt"
                  className="text-xs text-slate-700"
                >
                  Newest
                </SelectItem>
                <SelectItem
                  value="discountValue"
                  className="text-xs text-slate-700"
                >
                  Highest Discount
                </SelectItem>
                <SelectItem
                  value="expiresAt"
                  className="text-xs text-slate-700"
                >
                  Expiring Soon
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Results Count ── */}
      {!loading && coupons.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-1 w-full">
          <p className="text-xs text-slate-400 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-600">{coupons.length}</span>{" "}
            verified offers
          </p>
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8 w-full flex-grow">
        {loading ? (
          /* Skeleton grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <>
            {coupons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
                {coupons.map((coupon) => (
                  <CouponCard
                    key={coupon._id}
                    coupon={coupon}
                    isLocal={false}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="py-20 text-center rounded-2xl border border-slate-100 bg-white space-y-4 max-w-md mx-auto mt-6 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 px-6">
                  <h3 className="text-sm font-bold text-slate-800">
                    No offers matched your search
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Try broadening your keywords or resetting the category and
                    location filters.
                  </p>
                </div>
                <Button
                  onClick={handleResetFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 px-6 font-semibold rounded-lg cursor-pointer border-0 shadow-none transition-colors"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
