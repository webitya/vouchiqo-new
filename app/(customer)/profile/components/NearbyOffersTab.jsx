"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Car,
  Compass,
  Crosshair,
  ExternalLink,
  Globe,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "@/lib/fetcher";
import {
  CITY_COORDINATES,
  formatDistance,
  haversine,
  resolveStoreCoordinates,
} from "@/lib/location-resolver";
import { qk } from "@/lib/query-keys";

export default function NearbyOffersTab() {
  const [selectedCity, setSelectedCity] = useState("ranchi");
  const [radiusFilter, setRadiusFilter] = useState("all"); // "all" | "2" | "5" | "10" | "25"
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDealId, setSelectedDealId] = useState(null);
  const [userGpsCoords, setUserGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [activeRouteInfo, setActiveRouteInfo] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routeLayerRef = useRef(null);
  const routingReqIdRef = useRef(0);
  const cardRefs = useRef({});

  // Fetch full active coupons + verified brand storefronts
  const { data: couponsData, isLoading: loading } = useQuery({
    queryKey: [...qk.coupons.all(), "nearby-explorer-all"],
    queryFn: async () => {
      const json = await apiFetch(
        "/api/coupons?limit=250&allDates=true&includeAllBrands=true",
      );
      return json.data?.coupons || (Array.isArray(json.data) ? json.data : []);
    },
    staleTime: 30_000,
  });

  const rawCoupons = couponsData || [];

  const mapCenter = useMemo(() => {
    return (
      userGpsCoords || CITY_COORDINATES[selectedCity] || [23.3441, 85.3096]
    );
  }, [userGpsCoords, selectedCity]);

  // Load Leaflet dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && window.L) {
      setLeafletLoaded(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Live GPS geolocation detection with high accuracy
  const handleLocateMe = useCallback((showToast = true) => {
    setGpsLoading(true);
    let toastId = null;
    if (showToast) {
      toastId = toast.loading("Detecting your live location...");
    }

    const fallbackIP = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const coords = [data.latitude, data.longitude];
            setUserGpsCoords(coords);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo(coords, 14, { duration: 1 });
            }
            if (showToast && toastId) {
              toast.success(`Location detected: ${data.city || "Nearby"}`, {
                id: toastId,
              });
            }
            setGpsLoading(false);
            return;
          }
        }
      } catch (_) {}
      if (showToast && toastId) {
        toast.error("Could not get live GPS. Using selected city center.", {
          id: toastId,
        });
      }
      setGpsLoading(false);
    };

    if (typeof window === "undefined" || !navigator.geolocation) {
      fallbackIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserGpsCoords(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
        }
        if (showToast && toastId) {
          toast.success("Live GPS coordinates detected!", { id: toastId });
        }
        setGpsLoading(false);
      },
      () => fallbackIP(),
      { timeout: 7000, enableHighAccuracy: true },
    );
  }, []);

  // Auto-detect on first load
  useEffect(() => {
    handleLocateMe(false);
  }, [handleLocateMe]);

  // Process & enrich all store offers with exact coordinates & distance
  const processedStores = useMemo(() => {
    const center = mapCenter;

    // Deduplicate by brand / merchant ID so each store location has its offers aggregated
    const brandMap = new Map();

    for (const c of rawCoupons) {
      const merchantObj = c.merchantId || {};
      const brandKey = String(
        merchantObj._id ||
          merchantObj.businessName ||
          c.brandName ||
          c._id ||
          "store",
      )
        .trim()
        .toLowerCase();

      const coords = resolveStoreCoordinates(c, center);
      const distance = haversine(center[0], center[1], coords[0], coords[1]);
      const businessName =
        (typeof merchantObj === "object"
          ? merchantObj.businessName || merchantObj.name
          : null) ||
        c.brandName ||
        "Verified Merchant";

      const address =
        merchantObj.location?.address ||
        c.location?.address ||
        merchantObj.address ||
        c.address ||
        `${businessName} Store, Main Road`;

      const city =
        merchantObj.location?.city ||
        c.location?.city ||
        merchantObj.city ||
        "Ranchi";

      const discountValue = c.discountValue || 20;
      const discountType = c.discountType || "percentage";
      const discountText =
        discountType === "percentage"
          ? `${discountValue}% OFF`
          : `₹${discountValue} OFF`;

      const dealItem = {
        _id: c._id,
        title: c.title || `Special Offer at ${businessName}`,
        description: c.description || "Exclusive in-store voucher savings.",
        discountValue,
        discountType,
        discountText,
        code: c.code || "VIPDEAL",
        category: c.category || merchantObj.category || "General",
        isVerified: c.isVerified !== false,
        merchantId: merchantObj,
        businessName,
        address,
        city,
        coords,
        distance,
        formattedDistance: formatDistance(distance),
        logo: merchantObj.logo || null,
        slug: merchantObj.slug || null,
      };

      if (!brandMap.has(brandKey)) {
        brandMap.set(brandKey, {
          ...dealItem,
          offersCount: 1,
          allDeals: [dealItem],
        });
      } else {
        const existing = brandMap.get(brandKey);
        existing.offersCount += 1;
        existing.allDeals.push(dealItem);
      }
    }

    const uniqueStores = Array.from(brandMap.values());

    // Filter by Search Query
    let filtered = uniqueStores;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((s) => {
        const str = [s.businessName, s.title, s.address, s.category, s.city]
          .join(" ")
          .toLowerCase();
        return str.includes(q);
      });
    }

    // Filter by Category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((s) =>
        (s.category || "")
          .toLowerCase()
          .includes(selectedCategory.toLowerCase()),
      );
    }

    // Filter by Radius
    if (radiusFilter !== "all") {
      const maxR = parseFloat(radiusFilter);
      filtered = filtered.filter((s) => s.distance <= maxR);
    }

    // STRICT NEAREST-FIRST SORT (Google Maps logic: nearest store at 0km is #1)
    return filtered.sort((a, b) => a.distance - b.distance);
  }, [rawCoupons, mapCenter, searchQuery, selectedCategory, radiusFilter]);

  // Google Maps Style Categorised Sections
  const sections = useMemo(() => {
    const nearMe = []; // < 3 km
    const acrossTown = []; // 3 km to 10 km
    const widerRegion = []; // > 10 km

    for (const store of processedStores) {
      if (store.distance < 3.0) {
        nearMe.push(store);
      } else if (store.distance <= 10.0) {
        acrossTown.push(store);
      } else {
        widerRegion.push(store);
      }
    }

    return {
      nearMe,
      acrossTown,
      widerRegion,
      total: processedStores.length,
    };
  }, [processedStores]);

  // Select store & draw real route
  const handleSelectDeal = useCallback(
    async (deal) => {
      if (!deal) return;
      setSelectedDealId(deal._id);
      const reqId = ++routingReqIdRef.current;

      if (routeLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      setActiveRouteInfo(null);

      // Scroll card into view
      if (cardRefs.current[deal._id]) {
        cardRefs.current[deal._id].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }

      if (!mapInstanceRef.current || !window.L) return;
      const L = window.L;

      const start = mapCenter;
      const end = deal.coords;

      const drawRouteLine = (latLngs, distKm, durMin) => {
        if (reqId !== routingReqIdRef.current || !mapInstanceRef.current)
          return;
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }

        // Royal Plum casing
        const casing = L.polyline(latLngs, {
          color: "#35104A",
          weight: 6,
          opacity: 0.85,
          lineCap: "round",
          lineJoin: "round",
        });

        // Festival Teal path
        const tealLine = L.polyline(latLngs, {
          color: "#007F79",
          weight: 4,
          opacity: 0.98,
          lineCap: "round",
          lineJoin: "round",
        });

        const group = L.featureGroup([casing, tealLine]).addTo(
          mapInstanceRef.current,
        );
        routeLayerRef.current = group;

        setActiveRouteInfo({
          distanceKm: distKm,
          durationMin: durMin,
          businessName: deal.businessName,
          address: deal.address,
          dealId: deal._id,
          discountText: deal.discountText,
          googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&travelmode=driving`,
        });

        const bounds = group.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, {
            padding: [45, 45],
            maxZoom: 15,
          });
        }
      };

      try {
        const res = await fetch(
          `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
        );
        if (res.ok) {
          const data = await res.json();
          const route = data.routes?.[0];
          if (route?.geometry?.coordinates) {
            const latLngs = route.geometry.coordinates.map((c) => [c[1], c[0]]);
            const distKm = (route.distance / 1000).toFixed(1);
            const durMin = Math.max(1, Math.round(Number(distKm) * 2.5));
            drawRouteLine(latLngs, distKm, durMin);
            return;
          }
        }
      } catch (_) {}

      // Fallback direct line
      const fallbackDist = deal.distance ? deal.distance.toFixed(1) : "1.0";
      const fallbackMin = Math.max(1, Math.round(Number(fallbackDist) * 2.5));
      drawRouteLine([start, end], fallbackDist, fallbackMin);
    },
    [mapCenter],
  );

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (
      !leafletLoaded ||
      !mapRef.current ||
      typeof window === "undefined" ||
      !window.L
    ) {
      return;
    }
    const L = window.L;

    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: mapCenter,
        zoom: 13,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // High-DPI Google Streets HD tiles
      L.tileLayer(
        "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2",
        {
          subdomains: ["0", "1", "2", "3"],
          attribution:
            '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
          maxZoom: 21,
          detectRetina: true,
        },
      ).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(
        mapCenter,
        mapInstanceRef.current.getZoom() || 13,
      );
    }

    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // 1. Draw Radius circle if filtered
    if (radiusFilter !== "all") {
      const distNum = parseFloat(radiusFilter);
      if (!Number.isNaN(distNum)) {
        L.circle(mapCenter, {
          radius: distNum * 1000,
          color: "#007F79",
          weight: 1.5,
          opacity: 0.7,
          fillColor: "#007F79",
          fillOpacity: 0.06,
          dashArray: "6, 6",
        }).addTo(markersGroupRef.current);
      }
    }

    // 2. User Live Location Marker (Radar Pulse)
    const userMarkerHtml = `
      <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(0,127,121,0.25);animation:ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width:14px;height:14px;background:#007F79;border:3px solid #ffffff;border-radius:50%;box-shadow:0 0 10px rgba(0,127,121,0.7);z-index:2;"></div>
      </div>
    `;
    L.marker(mapCenter, {
      icon: L.divIcon({
        className: "custom-user-marker",
        html: userMarkerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      }),
    })
      .addTo(markersGroupRef.current)
      .bindPopup(
        `<div style="font-family:sans-serif;font-size:11px;font-weight:600;color:#35104A;">Your Location</div>`,
      );

    // 3. Store Markers on Leaflet Map
    processedStores.forEach((store) => {
      const isSelected = selectedDealId === store._id;
      const isUltraNear = store.distance < 1.0;

      const markerColor = isSelected
        ? "#35104A"
        : isUltraNear
          ? "#007F79"
          : "#6B4C82";

      const badgeBg = isSelected ? "#35104A" : "#007F79";

      const markerHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:${isSelected ? "scale(1.15)" : "scale(1)"};transition:all 0.2s;">
          <div style="background:${badgeBg};border:2px solid #ffffff;border-radius:999px;padding:2px 7px;box-shadow:0 3px 10px rgba(0,0,0,0.18);font-size:10px;font-weight:700;color:#ffffff;white-space:nowrap;font-family:sans-serif;">
            ${store.discountText}
          </div>
          <div style="width:6px;height:6px;background:${badgeBg};transform:rotate(45deg) translateY(-2px);border-radius:1px;"></div>
        </div>
      `;

      const marker = L.marker(store.coords, {
        icon: L.divIcon({
          className: "store-deal-marker",
          html: markerHtml,
          iconSize: [64, 28],
          iconAnchor: [32, 28],
        }),
      });

      marker.on("click", () => handleSelectDeal(store));
      marker.addTo(markersGroupRef.current);
    });
  }, [
    leafletLoaded,
    mapCenter,
    radiusFilter,
    processedStores,
    selectedDealId,
    handleSelectDeal,
  ]);

  const renderStoreCard = (deal) => {
    const isSelected = selectedDealId === deal._id;
    const isNearest = deal.distance < 1.0;

    return (
      <div
        key={deal._id}
        ref={(el) => {
          cardRefs.current[deal._id] = el;
        }}
        onClick={() => handleSelectDeal(deal)}
        className={`p-3 rounded-xl border transition-all cursor-pointer text-left font-sans ${
          isSelected
            ? "bg-[#FFF8EF] border-[#007F79] ring-1 ring-[#007F79]/30 shadow-xs"
            : "bg-white border-[#EADBCE] hover:border-[#007F79]/60 hover:bg-[#FFFDF9] shadow-2xs"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-heading font-semibold text-[#35104A] truncate">
                {deal.businessName}
              </h4>
              {deal.isVerified && (
                <span className="inline-flex items-center gap-0.5 text-[9px] font-heading font-semibold text-[#007F79] bg-[#007F79]/10 px-1.5 py-0.2 rounded-full border border-[#007F79]/20">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  <span>Verified</span>
                </span>
              )}
              {deal.offersCount > 1 && (
                <span className="text-[9px] font-heading font-medium text-[#6B4C82] bg-[#FFF8EF] border border-[#EADBCE] px-1.5 py-0.2 rounded-full">
                  {deal.offersCount} Deals
                </span>
              )}
            </div>

            <p className="text-[11px] font-sans text-[#6B4C82] line-clamp-1 mt-0.5">
              {deal.title}
            </p>

            <div className="flex items-center gap-1 text-[10px] text-[#6B4C82] mt-1 truncate">
              <MapPin className="w-3 h-3 text-[#007F79] shrink-0" />
              <span className="truncate">{deal.address}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span
              className={`text-[9.5px] font-heading font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${
                isNearest
                  ? "bg-[#007F79] text-white border-[#007F79] shadow-2xs"
                  : "bg-[#007F79]/10 text-[#007F79] border-[#007F79]/20"
              }`}
            >
              {deal.formattedDistance}
            </span>
            <span className="text-xs font-heading font-semibold text-[#35104A]">
              {deal.discountText}
            </span>
          </div>
        </div>

        {/* Card Actions Footer */}
        <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-[#EADBCE]/60">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${deal.coords[0]},${deal.coords[1]}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[10px] font-heading font-semibold text-[#6B4C82] hover:text-[#007F79] transition-colors"
            title="Open Google Maps Directions"
          >
            <Navigation className="w-2.5 h-2.5 text-[#007F79]" />
            <span>Google Maps ↗</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSelectDeal(deal);
              }}
              className="text-[10px] font-heading font-semibold text-[#007F79] hover:text-[#006e69] hover:underline cursor-pointer"
            >
              Show Route
            </button>
            <Link
              href={`/deals/${deal._id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] font-heading font-semibold text-white bg-[#007F79] hover:bg-[#006e69] px-2 py-0.5 rounded-lg transition-colors shadow-2xs"
            >
              View Offer →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[#FFFDF9] border border-[#EADBCE] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 text-left font-sans">
      {/* Top Header & Search Bar */}
      <div className="space-y-3 border-b border-[#EADBCE] pb-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-heading font-semibold text-[#35104A] tracking-tight flex items-center gap-1.5">
                <Store className="w-4 h-4 text-[#007F79]" />
                <span>Nearby Deals Explorer</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-heading font-semibold bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20">
                {processedStores.length} Verified Stores
              </span>
            </div>
            <p className="text-xs font-sans text-[#6B4C82] mt-0.5">
              Ordered by nearest physical distance to your location — just like
              Google Maps.
            </p>
          </div>

          {/* City & Radius Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* City Dropdown */}
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setUserGpsCoords(null);
              }}
              className="text-xs font-heading font-semibold border border-[#EADBCE] bg-white rounded-xl px-2.5 py-1.5 outline-none text-[#35104A] focus:border-[#007F79] transition-all cursor-pointer shadow-2xs"
            >
              {Object.keys(CITY_COORDINATES).map((city) => (
                <option key={city} value={city} className="capitalize">
                  {city.charAt(0).toUpperCase() + city.slice(1)}
                </option>
              ))}
            </select>

            {/* Radius Filter Pills */}
            <div className="flex items-center border border-[#EADBCE] rounded-xl p-0.5 bg-[#FFF8EF]">
              {[
                { id: "all", label: "All" },
                { id: "2", label: "2KM" },
                { id: "5", label: "5KM" },
                { id: "10", label: "10KM" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRadiusFilter(r.id)}
                  className={`text-[10px] font-heading font-semibold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    radiusFilter === r.id
                      ? "bg-[#007F79] text-white shadow-xs"
                      : "text-[#6B4C82] hover:text-[#35104A]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Full Map Link */}
            <Link
              href="/nearby-offers"
              className="text-xs font-heading font-semibold text-[#007F79] hover:text-white hover:bg-[#007F79] bg-[#007F79]/10 border border-[#007F79]/20 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all"
            >
              <span>Full Map</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Live Location & Search Row */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B4C82]" />
            <input
              type="text"
              placeholder="Search store name, location, or coupon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#EADBCE] focus:border-[#007F79] focus:ring-1 focus:ring-[#007F79]/20 rounded-xl pl-9 pr-8 py-1.5 text-xs font-sans text-[#35104A] placeholder-[#6B4C82]/60 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B4C82] hover:text-[#35104A] cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Near Me GPS Button */}
          <button
            type="button"
            onClick={() => handleLocateMe(true)}
            disabled={gpsLoading}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs font-heading font-semibold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer shrink-0 shadow-2xs ${
              userGpsCoords
                ? "bg-[#007F79] text-white border-[#007F79]"
                : "bg-white hover:bg-[#FFF8EF] text-[#007F79] border-[#007F79]/30"
            }`}
          >
            <Crosshair
              className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin" : ""}`}
            />
            <span>
              {gpsLoading
                ? "Locating..."
                : userGpsCoords
                  ? "Live GPS Active"
                  : "Detect My Location"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column Content: Map (Left) + Google Maps Style Sections (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Interactive Leaflet Map with Live Routing */}
        <div className="lg:col-span-7 bg-[#FFF8EF] border border-[#EADBCE] rounded-2xl relative overflow-hidden h-[360px] sm:h-[440px] flex items-center justify-center">
          <div ref={mapRef} className="w-full h-full z-0" />

          {/* Floating GPS Recenter button on top right of map */}
          <div className="absolute top-3 right-3 z-20">
            <button
              type="button"
              onClick={() => handleLocateMe(true)}
              className="w-8 h-8 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-[#EADBCE] flex items-center justify-center text-[#35104A] hover:text-[#007F79] transition-all cursor-pointer"
              title="Recenter on My GPS Location"
            >
              <Crosshair
                className={`w-4 h-4 ${gpsLoading ? "animate-spin text-[#007F79]" : ""}`}
              />
            </button>
          </div>

          {/* Active Navigation HUD Box */}
          {activeRouteInfo && (
            <div className="absolute bottom-3 left-3 right-3 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="bg-[#FFFDF9]/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-[#EADBCE] flex flex-col gap-1.5 font-sans">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-2 h-2 rounded-full bg-[#007F79] animate-pulse shrink-0" />
                      <h4 className="text-xs font-heading font-semibold text-[#35104A] truncate">
                        {activeRouteInfo.businessName}
                      </h4>
                      <span className="px-2 py-0.2 rounded-full text-[9px] font-heading font-semibold bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20 shrink-0">
                        {activeRouteInfo.discountText}
                      </span>
                    </div>
                    <p className="text-[10.5px] font-sans text-[#6B4C82] truncate mt-0.5">
                      {activeRouteInfo.address}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (routeLayerRef.current && mapInstanceRef.current) {
                        mapInstanceRef.current.removeLayer(
                          routeLayerRef.current,
                        );
                        routeLayerRef.current = null;
                      }
                      setActiveRouteInfo(null);
                    }}
                    className="text-[#6B4C82] hover:text-[#35104A] p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#EADBCE]">
                  <div className="flex items-center gap-1.5 text-xs text-[#35104A] font-heading font-medium">
                    <Car className="w-3.5 h-3.5 text-[#007F79]" />
                    <span className="text-[#007F79] font-semibold">
                      {activeRouteInfo.durationMin} mins drive
                    </span>
                    <span>•</span>
                    <span>{activeRouteInfo.distanceKm} km</span>
                  </div>

                  <a
                    href={activeRouteInfo.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#007F79] hover:bg-[#006e69] text-white text-[11px] font-heading font-semibold py-1 px-3 rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Navigate</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Google Maps Style Distance Categorised Sections */}
        <div className="lg:col-span-5 h-[360px] sm:h-[440px] overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          {loading ? (
            <div className="p-8 text-center text-xs font-sans text-[#6B4C82] space-y-2">
              <div className="w-6 h-6 border-2 border-[#007F79] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Scanning nearby verified stores...</p>
            </div>
          ) : processedStores.length === 0 ? (
            <div className="bg-white border border-dashed border-[#EADBCE] rounded-xl p-8 text-center space-y-2 text-[#6B4C82]">
              <MapPin className="w-8 h-8 mx-auto text-[#007F79]" />
              <p className="text-xs font-heading font-semibold text-[#35104A]">
                No verified stores match your criteria
              </p>
              <p className="text-[11px] font-sans text-[#6B4C82]">
                Try selecting "All" distance or resetting your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRadiusFilter("all");
                  setSearchQuery("");
                }}
                className="text-xs font-heading font-semibold text-[#007F79] hover:underline cursor-pointer"
              >
                Reset Filters →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* SECTION 1: NEARBY PLACES (< 3 KM) */}
              {sections.nearMe.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-heading font-semibold text-[#35104A] flex items-center gap-1.5 uppercase tracking-wide">
                      <span className="w-2 h-2 rounded-full bg-[#007F79]" />
                      <span>Nearby Places (&lt; 3 km)</span>
                    </span>
                    <span className="text-[10px] font-heading font-semibold px-2 py-0.2 rounded-full bg-[#007F79]/10 text-[#007F79] border border-[#007F79]/20">
                      {sections.nearMe.length} Nearby
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sections.nearMe.map(renderStoreCard)}
                  </div>
                </div>
              )}

              {/* SECTION 2: ACROSS TOWN (3 - 10 KM) */}
              {sections.acrossTown.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-heading font-semibold text-[#35104A] flex items-center gap-1.5 uppercase tracking-wide">
                      <Compass className="w-3.5 h-3.5 text-[#35104A]" />
                      <span>Across Town (3 – 10 km)</span>
                    </span>
                    <span className="text-[10px] font-heading font-semibold px-2 py-0.2 rounded-full bg-[#35104A]/10 text-[#35104A] border border-[#35104A]/20">
                      {sections.acrossTown.length} Stores
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sections.acrossTown.map(renderStoreCard)}
                  </div>
                </div>
              )}

              {/* SECTION 3: WIDER REGION (> 10 KM) */}
              {sections.widerRegion.length > 0 && radiusFilter === "all" && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-heading font-semibold text-[#6B4C82] flex items-center gap-1.5 uppercase tracking-wide">
                      <Globe className="w-3.5 h-3.5 text-[#6B4C82]" />
                      <span>Wider Region &amp; Online Brands</span>
                    </span>
                    <span className="text-[10px] font-heading font-medium px-2 py-0.2 rounded-full bg-[#FFF8EF] text-[#6B4C82] border border-[#EADBCE]">
                      {sections.widerRegion.length} Stores
                    </span>
                  </div>
                  <div className="space-y-2">
                    {sections.widerRegion.map(renderStoreCard)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
