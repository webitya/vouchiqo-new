"use client";

import {
  Car,
  ChevronRight,
  Crosshair,
  ExternalLink,
  MapPin,
  Maximize2,
  Navigation,
  Search,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/fetcher";
import { qk } from "@/lib/query-keys";

const CITY_COORDINATES = {
  ranchi: [23.3441, 85.3096],
  jamshedpur: [22.8046, 86.2029],
  patna: [25.5941, 85.1376],
  delhi: [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  bangalore: [12.9716, 77.5946],
  kolkata: [22.5726, 88.3639],
};

function haversine(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 1.0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export default function NearbyOffersTab() {
  const { data: couponsData, isLoading: loading } = useQuery({
    queryKey: [...qk.coupons.all(), "nearby", 50],
    queryFn: async () => {
      const json = await apiFetch("/api/coupons?limit=50&includeAllBrands=true");
      return json.data?.coupons || (Array.isArray(json.data) ? json.data : []);
    },
    staleTime: 60_000,
  });

  const coupons = couponsData || [];
  const [selectedCity, setSelectedCity] = useState("ranchi");
  const [radius, setRadius] = useState("5");
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [userGpsCoords, setUserGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [activeRouteInfo, setActiveRouteInfo] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const routeLayerRef = useRef(null);
  const routingReqIdRef = useRef(0);

  const mapCenter = useMemo(() => {
    return userGpsCoords || CITY_COORDINATES[selectedCity] || [23.3441, 85.3096];
  }, [userGpsCoords, selectedCity]);

  // Load Leaflet
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


  // Process & spread coordinates
  const processedDeals = useMemo(() => {
    const center = mapCenter;
    return coupons.map((c, idx) => {
      const mLoc = c.merchantId?.location;
      let lat = mLoc?.coordinates?.lat;
      let lng = mLoc?.coordinates?.lng;

      if (lat == null || lng == null) {
        const brandKey = (c.merchantId?.businessName || c.brandName || "brand").toString();
        const hash = brandKey.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
        const angle = ((hash * 47) % 360) * (Math.PI / 180);
        const radiusOffset = (((hash * 13) % 35) + 5) / 1000;
        lat = center[0] + Math.cos(angle) * radiusOffset * 1.1;
        lng = center[1] + Math.sin(angle) * radiusOffset * 1.3;
      }

      const dist = haversine(center[0], center[1], lat, lng);
      const businessName = c.merchantId?.businessName || c.brandName || "Partner Store";

      return {
        ...c,
        coords: [lat, lng],
        distance: dist,
        businessName,
        address: mLoc?.address || `${businessName} Store, Main Road`,
      };
    });
  }, [coupons, mapCenter]);

  const filteredDeals = useMemo(() => {
    const maxRadius = parseFloat(radius);
    return processedDeals
      .filter((d) => d.distance <= maxRadius)
      .sort((a, b) => a.distance - b.distance);
  }, [processedDeals, radius]);

  // Handle GPS location with network fallback
  const handleLocateMe = () => {
    setGpsLoading(true);
    const toastId = toast.loading("Detecting your live location...");

    const fallbackToIP = async () => {
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (ipRes.ok) {
          const ipData = await ipRes.json();
          if (ipData.latitude && ipData.longitude) {
            const coords = [ipData.latitude, ipData.longitude];
            setUserGpsCoords(coords);
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo(coords, 13, { duration: 1 });
            }
            toast.success(`Location: ${ipData.city || "Detected"}`, { id: toastId });
            setGpsLoading(false);
            return;
          }
        }
      } catch {}
      setGpsLoading(false);
      toast.error("Could not detect location. Selected city used.", { id: toastId });
    };

    if (!navigator.geolocation) {
      fallbackToIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserGpsCoords(coords);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
        }
        toast.success("Live GPS coordinates detected!", { id: toastId });
        setGpsLoading(false);
      },
      () => {
        fallbackToIP();
      },
      { timeout: 7000, enableHighAccuracy: true },
    );
  };

  // Route drawing
  const handleSelectDeal = useCallback(
    async (deal) => {
      if (!deal) return;
      setSelectedCouponId(deal._id);
      const reqId = ++routingReqIdRef.current;

      if (routeLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }
      setActiveRouteInfo(null);

      if (!mapInstanceRef.current || !window.L) return;
      const L = window.L;

      const start = mapCenter;
      const end = deal.coords;

      const drawRouteLine = (latLngs, distKm, durMin) => {
        if (reqId !== routingReqIdRef.current || !mapInstanceRef.current) return;
        if (routeLayerRef.current) {
          mapInstanceRef.current.removeLayer(routeLayerRef.current);
        }

        const casing = L.polyline(latLngs, {
          color: "#9f1239",
          weight: 7,
          opacity: 0.8,
          lineCap: "round",
          lineJoin: "round",
        });

        const roseLine = L.polyline(latLngs, {
          color: "#F72853",
          weight: 4.5,
          opacity: 0.98,
          lineCap: "round",
          lineJoin: "round",
        });

        const group = L.featureGroup([casing, roseLine]).addTo(mapInstanceRef.current);
        routeLayerRef.current = group;

        setActiveRouteInfo({
          distanceKm: distKm,
          durationMin: durMin,
          businessName: deal.businessName,
          address: deal.address,
          dealId: deal._id,
          discountValue: deal.discountValue,
          discountType: deal.discountType,
          googleMapsUrl: `https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&travelmode=driving`,
        });

        const bounds = group.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
      };

      // Multi-source routing fetch
      try {
        const startLng = start[1];
        const startLat = start[0];
        const endLng = end[1];
        const endLat = end[0];

        const res = await fetch(
          `https://routing.openstreetmap.de/routed-car/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`,
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
      } catch {}

      // Fallback line
      const fallbackDist = deal.distance ? deal.distance.toFixed(1) : "2.0";
      const fallbackMin = Math.max(2, Math.round(Number(fallbackDist) * 2.5));
      drawRouteLine([start, end], fallbackDist, fallbackMin);
    },
    [mapCenter],
  );

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || typeof window === "undefined" || !window.L) {
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

      // Crisp High-DPI Google Streets HD tiles (100% Free)
      L.tileLayer(
        "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&scale=2",
        {
          subdomains: ["0", "1", "2", "3"],
          attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a>',
          maxZoom: 21,
          detectRetina: true,
        },
      ).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView(mapCenter, mapInstanceRef.current.getZoom() || 13);
    }

    const map = mapInstanceRef.current;
    if (!map || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    // 1. Draw Radius Circle
    const distNum = parseFloat(radius);
    if (!Number.isNaN(distNum)) {
      L.circle(mapCenter, {
        radius: distNum * 1000,
        color: "#F72853",
        weight: 1.5,
        opacity: 0.65,
        fillColor: "#F72853",
        fillOpacity: 0.06,
        dashArray: "6, 6",
      }).addTo(markersGroupRef.current);
    }

    // 2. User Location Marker
    const userMarkerHtml = `
      <div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">
        <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(247,40,83,0.3);animation:pulse 2s infinite;"></div>
        <div style="width:16px;height:16px;background:#F72853;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px rgba(247,40,83,0.8);z-index:2;"></div>
      </div>
    `;
    L.marker(mapCenter, {
      icon: L.divIcon({
        className: "custom-user-marker",
        html: userMarkerHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      }),
    }).addTo(markersGroupRef.current);

    // 3. Store Markers
    filteredDeals.forEach((deal) => {
      const isSelected = selectedCouponId === deal._id;
      const badgeText =
        deal.discountType === "percentage"
          ? `${deal.discountValue}% OFF`
          : `₹${deal.discountValue} OFF`;

      const markerHtml = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;transform:${isSelected ? "scale(1.15)" : "scale(1)"};transition:all 0.2s;">
          <div style="background:#fff;border:2px solid #F72853;border-radius:999px;padding:2px 6px;box-shadow:0 3px 10px rgba(0,0,0,0.15);font-size:10px;font-weight:700;color:#0f172a;white-space:nowrap;">
            ${badgeText}
          </div>
          <div style="width:6px;height:6px;background:#F72853;transform:rotate(45deg) translateY(-2px);border-radius:1px;"></div>
        </div>
      `;

      const marker = L.marker(deal.coords, {
        icon: L.divIcon({
          className: "deal-map-marker",
          html: markerHtml,
          iconSize: [60, 26],
          iconAnchor: [30, 26],
        }),
      });

      marker.on("click", () => handleSelectDeal(deal));
      marker.addTo(markersGroupRef.current);
    });
  }, [leafletLoaded, mapCenter, radius, filteredDeals, selectedCouponId, handleSelectDeal]);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-3.5 text-left select-none font-sans">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-[13px] font-semibold text-slate-800 uppercase tracking-wider">
              Nearby Deals Explorer
            </h3>
            <span className="px-2 py-0.2 rounded-full text-[9.5px] font-bold bg-rose-50 text-[#F72853] border border-rose-200">
              {filteredDeals.length} Verified Stores
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-normal">
            Explore live partner store offers around your physical location dynamically.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* City Selection */}
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setUserGpsCoords(null);
            }}
            className="text-[11px] font-medium border border-slate-200 bg-slate-50 rounded-lg px-2.5 py-1 outline-none text-slate-700 focus:border-[#F72853] transition-colors cursor-pointer"
          >
            {Object.keys(CITY_COORDINATES).map((city) => (
              <option key={city} value={city} className="capitalize">
                {city.charAt(0).toUpperCase() + city.slice(1)}
              </option>
            ))}
          </select>

          {/* Radius Selector */}
          <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            {["2", "5", "10"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadius(r)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all uppercase cursor-pointer ${
                  radius === r
                    ? "bg-[#F72853] text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-800 bg-transparent"
                }`}
              >
                {r}km
              </button>
            ))}
          </div>

          {/* Full Screen Map Link */}
          <Link
            href="/nearby-offers"
            className="text-[11px] font-semibold text-[#F72853] hover:text-[#e01e47] bg-rose-50 hover:bg-rose-100/70 border border-rose-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
          >
            <span>Full Map</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left Side: Real Interactive Leaflet Map */}
        <div className="lg:col-span-7 bg-slate-100 border border-slate-200 rounded-xl relative overflow-hidden h-[340px] flex items-center justify-center">
          <div ref={mapRef} className="w-full h-full z-0" />

          {/* Floating GPS button */}
          <div className="absolute top-2.5 right-2.5 z-20">
            <button
              type="button"
              onClick={handleLocateMe}
              className="w-7 h-7 bg-white/95 backdrop-blur-md rounded-lg shadow-md border border-slate-200 flex items-center justify-center text-slate-700 hover:text-[#F72853] transition-all cursor-pointer"
              title="Locate Me (GPS)"
            >
              <Crosshair className={`w-3.5 h-3.5 ${gpsLoading ? "animate-spin text-[#F72853]" : ""}`} />
            </button>
          </div>

          {/* Floating Navigation HUD */}
          {activeRouteInfo && (
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-slate-200 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F72853] animate-pulse shrink-0" />
                      <h4 className="text-[11px] font-bold text-slate-900 truncate">
                        {activeRouteInfo.businessName}
                      </h4>
                      {activeRouteInfo.discountValue && (
                        <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-rose-50 text-[#F72853] border border-rose-200 shrink-0">
                          {activeRouteInfo.discountType === "percentage"
                            ? `${activeRouteInfo.discountValue}% OFF`
                            : `₹${activeRouteInfo.discountValue} OFF`}
                        </span>
                      )}
                    </div>
                    <p className="text-[9.5px] text-slate-500 truncate mt-0.5">
                      {activeRouteInfo.address}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (routeLayerRef.current && mapInstanceRef.current) {
                        mapInstanceRef.current.removeLayer(routeLayerRef.current);
                        routeLayerRef.current = null;
                      }
                      setActiveRouteInfo(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                    <Car className="w-3 h-3 text-[#F72853]" />
                    <span className="text-[#F72853] font-bold">{activeRouteInfo.durationMin} mins</span>
                    <span>•</span>
                    <span>{activeRouteInfo.distanceKm} km</span>
                  </div>

                  <a
                    href={activeRouteInfo.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#F72853] hover:bg-[#e01e47] text-white text-[10px] font-bold py-1 px-2.5 rounded-md flex items-center gap-1 transition-all shadow-2xs"
                  >
                    <Navigation className="w-2.5 h-2.5" />
                    <span>Navigate</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Scrollable Deals List */}
        <div className="lg:col-span-5 h-[340px] overflow-y-auto space-y-2 pr-1 no-scrollbar scrollbar-thin">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading nearby offers...</div>
          ) : filteredDeals.length === 0 ? (
            <div className="p-8 text-center space-y-2 text-slate-400">
              <MapPin className="w-6 h-6 mx-auto text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No stores found within {radius}km</p>
              <p className="text-[10px] text-slate-400">Try expanding your search radius.</p>
            </div>
          ) : (
            filteredDeals.map((deal) => {
              const isSelected = selectedCouponId === deal._id;
              const discountText =
                deal.discountType === "percentage"
                  ? `${deal.discountValue}% OFF`
                  : `₹${deal.discountValue} OFF`;

              return (
                <div
                  key={deal._id}
                  onClick={() => handleSelectDeal(deal)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer shadow-2xs ${
                    isSelected
                      ? "bg-rose-50/40 border-[#F72853] ring-1 ring-rose-200"
                      : "bg-white border-slate-200/90 hover:border-rose-200 hover:bg-rose-50/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-[11.5px] font-bold text-slate-800 truncate">
                          {deal.businessName}
                        </h4>
                        <span className="inline-flex items-center gap-0.5 text-[8.5px] font-normal text-emerald-600">
                          <ShieldCheck className="w-2.5 h-2.5" /> Verified
                        </span>
                      </div>
                      <p className="text-[10.5px] font-medium text-slate-600 line-clamp-1 mt-0.5">
                        {deal.title}
                      </p>
                      <p className="text-[9.5px] text-slate-400 truncate mt-0.5">
                        {deal.address}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-rose-50 text-[#F72853] border border-rose-200">
                        {discountText}
                      </span>
                      <span className="text-[9px] font-medium text-slate-500">
                        {deal.distance} km away
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectDeal(deal);
                      }}
                      className="text-[10px] font-semibold text-[#F72853] hover:text-[#e01e47] flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation className="w-2.5 h-2.5" />
                      <span>Show Route</span>
                    </button>

                    <Link
                      href={`/deals/${deal._id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] font-semibold text-slate-700 hover:text-[#F72853] flex items-center gap-0.5"
                    >
                      <span>Claim Deal</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
