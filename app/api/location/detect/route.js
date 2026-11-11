import { NextResponse } from "next/server";
import { INDIAN_CITIES } from "@/utils/cities";

export const dynamic = "force-dynamic";

// Known Indian city coordinate reference table for instant distance calculation
const CITY_COORDINATES = [
  { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { name: "Jamshedpur", lat: 22.8046, lon: 86.2029 },
  { name: "Patna", lat: 25.5941, lon: 85.1376 },
  { name: "Arrah", lat: 25.5564, lon: 84.6681 },
  { name: "Dhanbad", lat: 23.7957, lon: 86.4304 },
  { name: "Bokaro", lat: 23.6693, lon: 86.1511 },
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Noida", lat: 28.5355, lon: 77.391 },
  { name: "Gurgaon", lat: 28.4595, lon: 77.0266 },
  { name: "Faridabad", lat: 28.4089, lon: 77.3178 },
  { name: "Ghaziabad", lat: 28.6692, lon: 77.4538 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Thane", lat: 19.2183, lon: 72.9781 },
  { name: "Navi Mumbai", lat: 19.033, lon: 73.0297 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Nagpur", lat: 21.1458, lon: 79.0882 },
  { name: "Nashik", lat: 19.9975, lon: 73.7898 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Mysore", lat: 12.2958, lon: 76.6394 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Coimbatore", lat: 11.0168, lon: 76.9558 },
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Howrah", lat: 22.5958, lon: 88.2636 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Surat", lat: 21.1702, lon: 72.8311 },
  { name: "Vadodara", lat: 22.3072, lon: 73.1812 },
  { name: "Rajkot", lat: 22.3039, lon: 70.8022 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Jodhpur", lat: 26.2389, lon: 73.0243 },
  { name: "Udaipur", lat: 24.5854, lon: 73.7125 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
  { name: "Kanpur", lat: 26.4499, lon: 80.3319 },
  { name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { name: "Agra", lat: 27.1767, lon: 78.0081 },
  { name: "Allahabad", lat: 25.4358, lon: 81.8463 },
  { name: "Bhopal", lat: 23.2599, lon: 77.4126 },
  { name: "Indore", lat: 22.7196, lon: 75.8577 },
  { name: "Gwalior", lat: 26.2183, lon: 78.1828 },
  { name: "Jabalpur", lat: 23.1815, lon: 79.9864 },
  { name: "Chandigarh", lat: 30.7333, lon: 76.7794 },
  { name: "Ludhiana", lat: 30.901, lon: 75.8573 },
  { name: "Amritsar", lat: 31.634, lon: 74.8723 },
  { name: "Jalandhar", lat: 31.326, lon: 75.5762 },
  { name: "Bhubaneswar", lat: 20.2961, lon: 85.8245 },
  { name: "Cuttack", lat: 20.4625, lon: 85.883 },
  { name: "Raipur", lat: 21.2514, lon: 81.6296 },
  { name: "Bhilai", lat: 21.1938, lon: 81.3509 },
  { name: "Guwahati", lat: 26.1445, lon: 91.7362 },
  { name: "Dehradun", lat: 30.3165, lon: 78.0322 },
  { name: "Visakhapatnam", lat: 17.6868, lon: 83.2185 },
  { name: "Vijayawada", lat: 16.5062, lon: 80.648 },
  { name: "Guntur", lat: 16.3067, lon: 80.4365 },
  { name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { name: "Kozhikode", lat: 11.2588, lon: 75.7804 },
];

function getClosestCity(lat, lon) {
  let closest = "Ranchi";
  let minDistance = Number.MAX_VALUE;
  for (const c of CITY_COORDINATES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < minDistance) {
      minDistance = d;
      closest = c.name;
    }
  }
  return closest;
}

function matchCityToIndianCities(rawName) {
  if (!rawName || typeof rawName !== "string") return null;
  const clean = rawName.trim().toLowerCase();

  // Common aliases
  if (clean === "bengaluru") return "Bangalore";
  if (clean === "gurugram") return "Gurgaon";
  if (clean === "prayagraj") return "Allahabad";
  if (clean === "new delhi") return "Delhi";

  // Exact match
  const found = INDIAN_CITIES.find((c) => c.toLowerCase() === clean);
  if (found) return found;

  // Substring match
  const partial = INDIAN_CITIES.find(
    (c) => clean.includes(c.toLowerCase()) || c.toLowerCase().includes(clean),
  );
  if (partial) return partial;

  return rawName.charAt(0).toUpperCase() + rawName.slice(1);
}

async function reverseGeocodeCoords(lat, lon) {
  // Strategy 1: BigDataCloud Reverse Geocoding (fast, accurate for cities & districts)
  try {
    const bdcRes = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: AbortSignal.timeout(3000) },
    );
    if (bdcRes.ok) {
      const data = await bdcRes.json();
      const rawCity =
        data.city ||
        data.locality ||
        data.principalSubdivision ||
        data.countryName;
      if (rawCity) {
        const matched = matchCityToIndianCities(rawCity);
        if (matched) return matched;
      }
    }
  } catch (_) {}

  // Strategy 2: OpenStreetMap Nominatim with valid Server User-Agent
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      {
        headers: {
          "User-Agent": "VouchiqoApp/1.0 (contact@vouchiqo.com)",
          "Accept-Language": "en",
        },
        signal: AbortSignal.timeout(3500),
      },
    );
    if (nomRes.ok) {
      const data = await nomRes.json();
      const addr = data.address || {};
      const rawCity =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        addr.county ||
        addr.state_district;
      if (rawCity) {
        const matched = matchCityToIndianCities(rawCity);
        if (matched) return matched;
      }
    }
  } catch (_) {}

  // Strategy 3: Nearest coordinate mathematical match
  return getClosestCity(lat, lon);
}

async function detectFromIP(request) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const rawIp = forwarded
      ? forwarded.split(",")[0].trim()
      : request.headers.get("x-real-ip") || "";

    const isLocal =
      !rawIp ||
      rawIp === "::1" ||
      rawIp === "127.0.0.1" ||
      rawIp.startsWith("192.168.") ||
      rawIp.startsWith("10.") ||
      rawIp.startsWith("172.");

    // Query IP Geolocation API
    const targetUrl = isLocal
      ? "https://ipapi.co/json/"
      : `https://ipapi.co/${rawIp}/json/`;

    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.city) {
        const matched = matchCityToIndianCities(data.city);
        return {
          city: matched || data.city,
          lat: data.latitude,
          lon: data.longitude,
          source: "ip",
        };
      }
    }
  } catch (_) {}

  // Fallback to ipwho.is
  try {
    const res = await fetch("https://ipwho.is/", {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.city) {
        const matched = matchCityToIndianCities(data.city);
        return {
          city: matched || data.city,
          lat: data.latitude,
          lon: data.longitude,
          source: "ip",
        };
      }
    }
  } catch (_) {}

  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");

    if (latStr && lonStr) {
      const lat = Number.parseFloat(latStr);
      const lon = Number.parseFloat(lonStr);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        const city = await reverseGeocodeCoords(lat, lon);
        return NextResponse.json({
          success: true,
          city,
          lat,
          lon,
          source: "gps",
        });
      }
    }

    // No coords provided: detect via IP in background
    const ipResult = await detectFromIP(request);
    if (ipResult) {
      return NextResponse.json({
        success: true,
        ...ipResult,
      });
    }

    return NextResponse.json({
      success: true,
      city: "Ranchi",
      lat: 23.3441,
      lon: 85.3096,
      source: "default",
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      city: "Ranchi",
      lat: 23.3441,
      lon: 85.3096,
      source: "fallback",
    });
  }
}

export async function POST(request) {
  return GET(request);
}
