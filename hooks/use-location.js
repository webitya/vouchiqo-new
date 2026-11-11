"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Detects the user's actual city via browser GPS + `/api/location/detect` + OpenStreetMap.
 * Runs in the background on every mount, on visibility change, and on every open of the location selector.
 */
export function useLocation() {
  const [city, setCityState] = useState(null);
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle");

  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // 1. Hydrate location from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vouchiqo_city");
      if (saved && isMountedRef.current) {
        setCityState(saved);
        setStatus("ready");
      }
    } catch (e) {
      console.error("Failed to read location from localStorage:", e);
    }
  }, []);

  const setCity = useCallback((newCity, isManual = true) => {
    if (!isMountedRef.current) return;
    setCityState(newCity);
    try {
      if (newCity) {
        localStorage.setItem("vouchiqo_city", newCity);
        if (isManual) {
          localStorage.setItem("vouchiqo_city_manual", "true");
        }
        setStatus("ready");
      } else {
        localStorage.removeItem("vouchiqo_city");
        localStorage.removeItem("vouchiqo_city_manual");
        setStatus("idle");
      }
    } catch (e) {
      console.error("Failed to write location to localStorage:", e);
    }
  }, []);

  // 2. High-precision Reverse Geocode helper (tries /api/location/detect first, then client-side BDC / OSM)
  const resolveCoordinatesToCity = useCallback(async (lat, lon) => {
    // Try internal server API first (avoids CORS & server-side rate limits)
    try {
      const res = await fetch(`/api/location/detect?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.city) return data.city;
      }
    } catch (_) {}

    // Fallback: BigDataCloud client-side reverse geocoding
    try {
      const bdcRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      );
      if (bdcRes.ok) {
        const data = await bdcRes.json();
        const detected =
          data.city || data.locality || data.principalSubdivision;
        if (detected) return detected;
      }
    } catch (_) {}

    // Fallback: OpenStreetMap Nominatim
    try {
      const nomRes = await fetch(
        `${NOMINATIM_URL}?lat=${lat}&lon=${lon}&format=json`,
        { headers: { "Accept-Language": "en" } },
      );
      if (nomRes.ok) {
        const data = await nomRes.json();
        const detected =
          data.address?.city ||
          data.address?.town ||
          data.address?.municipality ||
          data.address?.village ||
          data.address?.county;
        if (detected) return detected;
      }
    } catch (_) {}

    return null;
  }, []);

  // 3. User-initiated Detect (clicking "Use Current Location")
  const detect = useCallback(async () => {
    if (isMountedRef.current) setStatus("detecting");

    if (!navigator.geolocation) {
      // Fallback to IP detection if browser geolocation is not supported
      try {
        const res = await fetch("/api/location/detect");
        if (res.ok) {
          const data = await res.json();
          if (data?.city && isMountedRef.current) {
            setCity(data.city, false);
            if (data.lat && data.lon)
              setCoords({ lat: data.lat, lon: data.lon });
            setStatus("ready");
            return;
          }
        }
      } catch (_) {}
      if (isMountedRef.current) setStatus("unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords: posCoords }) => {
        const { latitude, longitude } = posCoords;
        if (isMountedRef.current) {
          setCoords({ lat: latitude, lon: longitude });
        }

        const detectedCity = await resolveCoordinatesToCity(
          latitude,
          longitude,
        );

        if (detectedCity && isMountedRef.current) {
          setCity(detectedCity, false);
          setStatus("ready");
        } else {
          // If coords failed to resolve, try IP endpoint
          try {
            const res = await fetch("/api/location/detect");
            if (res.ok) {
              const data = await res.json();
              if (data?.city && isMountedRef.current) {
                setCity(data.city, false);
              }
            }
          } catch (_) {}
          if (isMountedRef.current) setStatus("ready");
        }
      },
      async (err) => {
        console.warn("Geolocation permission denied or timed out:", err);
        // Seamless fallback to IP location
        try {
          const res = await fetch("/api/location/detect");
          if (res.ok) {
            const data = await res.json();
            if (data?.city && isMountedRef.current) {
              setCity(data.city, false);
              if (data.lat && data.lon)
                setCoords({ lat: data.lat, lon: data.lon });
              setStatus("ready");
              return;
            }
          }
        } catch (_) {}
        if (isMountedRef.current) setStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  }, [setCity, resolveCoordinatesToCity]);

  // 4. Background Detection (runs silently without blocking UI)
  const detectBackground = useCallback(async () => {
    try {
      // If user has not set a manual override or if city is empty, check GPS permission
      let permissionState = null;
      try {
        const perm = await navigator.permissions?.query({
          name: "geolocation",
        });
        permissionState = perm?.state;
      } catch (_) {}

      if (permissionState === "granted" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async ({ coords: posCoords }) => {
            const { latitude, longitude } = posCoords;
            if (isMountedRef.current) {
              setCoords({ lat: latitude, lon: longitude });
            }
            const detected = await resolveCoordinatesToCity(
              latitude,
              longitude,
            );
            if (detected && isMountedRef.current) {
              const isManual =
                localStorage.getItem("vouchiqo_city_manual") === "true";
              if (!isManual || !localStorage.getItem("vouchiqo_city")) {
                setCity(detected, false);
              }
            }
          },
          () => {},
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
        );
      } else {
        // Fallback: silent IP detection
        const res = await fetch("/api/location/detect");
        if (res.ok) {
          const data = await res.json();
          if (data?.city && isMountedRef.current) {
            if (data.lat && data.lon)
              setCoords({ lat: data.lat, lon: data.lon });
            const isManual =
              localStorage.getItem("vouchiqo_city_manual") === "true";
            if (!isManual || !localStorage.getItem("vouchiqo_city")) {
              setCity(data.city, false);
            }
          }
        }
      }
    } catch (_) {}
  }, [setCity, resolveCoordinatesToCity]);

  // 5. Run background detection on mount
  useEffect(() => {
    detectBackground();
  }, [detectBackground]);

  // 6. Refresh on window focus / visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        detectBackground();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [detectBackground]);

  return {
    city,
    coords,
    setCity,
    status,
    detect,
    detectBackground,
    refreshLocation: detectBackground,
  };
}
