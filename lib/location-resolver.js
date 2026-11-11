/**
 * Centralised Geographic Location & Coordinate Resolver for Vouchiqo Nearby Offers.
 * Accurately maps physical addresses, landmarks, and city coordinates.
 */

/**
 * Accurately extracts latitude and longitude from any Google Maps URL, GMB share link, or raw coordinate string.
 */
export function parseGmapsCoordinates(urlOrText) {
  if (!urlOrText || typeof urlOrText !== "string") return null;
  const str = urlOrText.trim();

  // Pattern 1: @lat,lng e.g. https://www.google.com/maps/place/.../@23.364893,85.297936,17z
  const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    const lat = Number(atMatch[1]);
    const lng = Number(atMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    }
  }

  // Pattern 2: ?q=lat,lng or &ll=lat,lng or ?query=lat,lng or ?destination=lat,lng or ?daddr=lat,lng
  const queryMatch = str.match(
    /[?&](?:q|ll|query|destination|daddr)=(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)/,
  );
  if (queryMatch) {
    const lat = Number(queryMatch[1]);
    const lng = Number(queryMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    }
  }

  // Pattern 3: Google Maps share/embed !3dlat!4dlng
  const embedMatch = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (embedMatch) {
    const lat = Number(embedMatch[1]);
    const lng = Number(embedMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    }
  }

  // Pattern 4: Raw comma/space separated coordinates e.g. "23.3441, 85.3096"
  const rawCoordMatch = str.match(/^(-?\d+\.\d{3,})[,\s]+(-?\d+\.\d{3,})$/);
  if (rawCoordMatch) {
    const lat = Number(rawCoordMatch[1]);
    const lng = Number(rawCoordMatch[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat: lat.toFixed(6), lng: lng.toFixed(6) };
    }
  }

  return null;
}

/**
 * Resolves address text and city to known local coordinates (landmarks or city centers).
 */
export function resolveAddressCoordinates(address, city = "") {
  const combined = `${address || ""} ${city || ""}`.toLowerCase();

  // 1. Check known Ranchi local landmarks
  for (const landmark of RANCHI_LOCAL_LANDMARKS) {
    if (landmark.match.some((kw) => combined.includes(kw))) {
      return {
        lat: landmark.coords[0].toFixed(6),
        lng: landmark.coords[1].toFixed(6),
        source: `landmark:${landmark.name}`,
      };
    }
  }

  // 2. Check external cities
  for (const ext of EXTERNAL_CITIES) {
    if (ext.match.some((kw) => combined.includes(kw))) {
      return {
        lat: ext.coords[0].toFixed(6),
        lng: ext.coords[1].toFixed(6),
        source: `city:${ext.city}`,
      };
    }
  }

  // 3. Check city coordinates
  const cleanCity = city.toLowerCase().trim();
  if (cleanCity && CITY_COORDINATES[cleanCity]) {
    const coords = CITY_COORDINATES[cleanCity];
    return {
      lat: coords[0].toFixed(6),
      lng: coords[1].toFixed(6),
      source: `city:${city}`,
    };
  }

  return null;
}

export const CITY_COORDINATES = {
  ranchi: [23.3441, 85.3096],
  jamshedpur: [22.8046, 86.2029],
  patna: [25.5941, 85.1376],
  arrah: [25.5564, 84.6681],
  dhanbad: [23.7957, 86.4304],
  bokaro: [23.6693, 86.1511],
  delhi: [28.6139, 77.209],
  new_delhi: [28.6139, 77.209],
  gurugram: [28.4595, 77.0266],
  noida: [28.5355, 77.391],
  mumbai: [19.076, 72.8777],
  pune: [18.5204, 73.8567],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  hyderabad: [17.385, 78.4867],
  kolkata: [22.5726, 88.3639],
  chennai: [13.0827, 80.2707],
  ahmedabad: [23.0225, 72.5714],
  surat: [21.1702, 72.8311],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  thane: [19.2183, 72.9781],
};

// Known Ranchi physical landmark coordinates for accurate local resolution
const RANCHI_LOCAL_LANDMARKS = [
  {
    match: ["ganga nagar", "naman vidya", "harmu near"],
    coords: [23.364893, 85.297936],
    name: "Ganga Nagar, Harmu",
  },
  {
    match: ["harmu housing", "sahajanand chowk", "harmu bypass", "harmu"],
    coords: [23.3562, 85.3054],
    name: "Harmu Housing Colony",
  },
  {
    match: ["upper bazar", "kart saraye", "adukia", "churuwala", "bansidhar"],
    coords: [23.373, 85.321],
    name: "Upper Bazar",
  },
  {
    match: ["hinoo", "airport road"],
    coords: [23.3288, 85.3211],
    name: "Hinoo Main Road",
  },
  {
    match: ["doranda", "nivaranpur", "forest officers"],
    coords: [23.3427, 85.3248],
    name: "Doranda / Nivaranpur",
  },
  {
    match: ["kanke", "cm house", "raj complex"],
    coords: [23.3855, 85.3232],
    name: "Kanke Road",
  },
  {
    match: ["radium road", "ahirtoli", "kumar market", "laxmi market"],
    coords: [23.3688, 85.326],
    name: "Radium Road",
  },
  {
    match: [
      "pathalkudwa",
      "nayatoli",
      "khajanchi",
      "vishal mega mart",
      "v2 mall",
    ],
    coords: [23.3622, 85.3296],
    name: "Main Road, Nayatoli",
  },
  {
    match: ["pandra", "ratu road", "bazar samiti"],
    coords: [23.3847, 85.2789],
    name: "Pandra / Ratu Road",
  },
  {
    match: ["lalpur", "circular road", "nucleus"],
    coords: [23.3705, 85.3342],
    name: "Lalpur Chowk",
  },
  { match: ["bariatu", "rims"], coords: [23.3895, 85.3486], name: "Bariatu" },
  {
    match: ["namkum", "tatisilwai"],
    coords: [23.3361, 85.3908],
    name: "Namkum",
  },
  {
    match: ["dhurwa", "hec", "jagannathpur"],
    coords: [23.3082, 85.2796],
    name: "Dhurwa",
  },
];

// External city matchers to prevent faraway stores from showing as 0.5km local
const EXTERNAL_CITIES = [
  {
    match: ["gurugram", "gurgaon"],
    coords: [28.4595, 77.0266],
    city: "Gurugram",
  },
  {
    match: ["noida", "greater noida", "gautam budh"],
    coords: [28.5355, 77.391],
    city: "Noida",
  },
  {
    match: [
      "new delhi",
      "delhi",
      "okhla",
      "janakpuri",
      "jhandewalan",
      "jangpura",
    ],
    coords: [28.6139, 77.209],
    city: "New Delhi",
  },
  {
    match: ["mumbai", "kandivali", "powai", "lower parel", "fort, mumbai"],
    coords: [19.076, 72.8777],
    city: "Mumbai",
  },
  {
    match: ["pune", "shirur", "phursungi"],
    coords: [18.5204, 73.8567],
    city: "Pune",
  },
  {
    match: ["thane", "bhiwandi", "kalher"],
    coords: [19.2183, 72.9781],
    city: "Thane",
  },
  {
    match: [
      "bengaluru",
      "bangalore",
      "hsr layout",
      "whitefield",
      "kalyan nagar",
    ],
    coords: [12.9716, 77.5946],
    city: "Bengaluru",
  },
  {
    match: ["hyderabad", "balanagar"],
    coords: [17.385, 78.4867],
    city: "Hyderabad",
  },
  {
    match: ["kolkata", "anandapur", "bidhannagar"],
    coords: [22.5726, 88.3639],
    city: "Kolkata",
  },
  {
    match: ["surat", "sita nagar", "saroli"],
    coords: [21.1702, 72.8311],
    city: "Surat",
  },
  {
    match: ["ahmedabad", "prahlad nagar"],
    coords: [23.0225, 72.5714],
    city: "Ahmedabad",
  },
];

/**
 * Calculates Great Circle distance between two lat/lng pairs in kilometers (Haversine formula).
 */
export function haversine(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null)
    return 999.0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

/**
 * Format distance into human-friendly Google Maps style:
 * "< 50m" | "350 m away" | "1.2 km away"
 */
export function formatDistance(distanceInKm) {
  if (distanceInKm == null || Number.isNaN(distanceInKm)) return "";
  if (distanceInKm < 0.05) return "Right here (< 50m)";
  if (distanceInKm < 1.0) {
    const meters = Math.max(50, Math.round(distanceInKm * 1000));
    return `${meters} m away`;
  }
  return `${distanceInKm.toFixed(1)} km away`;
}

/**
 * Resolves accurate coordinates for a merchant/deal.
 * 1. Returns exact database coordinates if present (e.g. Webitya, Ranjana's).
 * 2. Matches local neighborhood/landmark keywords for accurate Ranchi positioning.
 * 3. Matches other city names for non-local stores (so they aren't faked at 0.5km).
 * 4. Fallbacks to city center with slight deterministic spread.
 */
export function resolveStoreCoordinates(
  store,
  currentCenter = CITY_COORDINATES.ranchi,
) {
  if (
    Array.isArray(store.coords) &&
    store.coords.length === 2 &&
    !Number.isNaN(store.coords[0]) &&
    !Number.isNaN(store.coords[1])
  ) {
    return [Number(store.coords[0]), Number(store.coords[1])];
  }

  const mLoc = store.merchantId?.location || store.location;
  let directLat = mLoc?.coordinates?.lat ?? store.coordinates?.lat;
  let directLng = mLoc?.coordinates?.lng ?? store.coordinates?.lng;

  // Also support array coordinates e.g. [lat, lng] or GeoJSON [lng, lat]
  if (Array.isArray(mLoc?.coordinates) && mLoc.coordinates.length === 2) {
    const [c0, c1] = mLoc.coordinates;
    if (c0 > 0 && c0 < 40 && c1 > 60 && c1 < 100) {
      directLat = c0;
      directLng = c1;
    } else if (c1 > 0 && c1 < 40 && c0 > 60 && c0 < 100) {
      directLat = c1;
      directLng = c0;
    }
  }

  // 1. Exact Database Coordinates
  if (
    directLat != null &&
    directLng != null &&
    !Number.isNaN(directLat) &&
    !Number.isNaN(directLng)
  ) {
    return [Number(directLat), Number(directLng)];
  }

  const rawText = [
    store.businessName,
    store.brandName,
    store.merchantId?.businessName,
    mLoc?.address,
    store.address,
    mLoc?.city,
    store.city,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  // 2. Check Ranchi Local Landmarks
  for (const landmark of RANCHI_LOCAL_LANDMARKS) {
    if (landmark.match.some((keyword) => rawText.includes(keyword))) {
      // Deterministic tiny jitter (10-40 meters) based on store ID/name so distinct stores at same landmark don't perfectly overlap
      const idKey = String(store._id || store.businessName || "store");
      const hash = idKey
        .split("")
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const angle = ((hash * 53) % 360) * (Math.PI / 180);
      const offset = (((hash * 17) % 25) + 5) / 100000; // ~10-30 meters
      return [
        landmark.coords[0] + Math.cos(angle) * offset,
        landmark.coords[1] + Math.sin(angle) * offset,
      ];
    }
  }

  // 3. Check External Cities (Delhi, Gurugram, Mumbai, etc.)
  for (const ext of EXTERNAL_CITIES) {
    if (ext.match.some((keyword) => rawText.includes(keyword))) {
      const idKey = String(store._id || store.businessName || "store");
      const hash = idKey
        .split("")
        .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
      const angle = ((hash * 43) % 360) * (Math.PI / 180);
      const offset = (((hash * 19) % 30) + 10) / 10000; // ~1-3 km within that metro city
      return [
        ext.coords[0] + Math.cos(angle) * offset,
        ext.coords[1] + Math.sin(angle) * offset,
      ];
    }
  }

  // 4. Default: If city matches another known city
  const cityLower = String(mLoc?.city || store.city || "")
    .toLowerCase()
    .trim();
  if (cityLower && CITY_COORDINATES[cityLower]) {
    const base = CITY_COORDINATES[cityLower];
    const idKey = String(store._id || store.businessName || "store");
    const hash = idKey.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const angle = ((hash * 47) % 360) * (Math.PI / 180);
    const radiusOffset = (((hash * 23) % 40) + 10) / 10000;
    return [
      base[0] + Math.cos(angle) * radiusOffset,
      base[1] + Math.sin(angle) * radiusOffset,
    ];
  }

  // 5. Fallback: Place around current map center with a moderate spread (1.5 - 5km)
  const idKey = String(store._id || store.businessName || "store");
  const hash = idKey.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const angle = ((hash * 37) % 360) * (Math.PI / 180);
  const radiusOffset = (((hash * 29) % 35) + 15) / 10000; // ~1.5 - 5km
  return [
    currentCenter[0] + Math.cos(angle) * radiusOffset,
    currentCenter[1] + Math.sin(angle) * radiusOffset,
  ];
}
