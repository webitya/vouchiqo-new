"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

const CITY_COORDINATES = [
  { name: "Ranchi", lat: 23.3441, lon: 85.3096 },
  { name: "Patna", lat: 25.5941, lon: 85.1376 },
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
];

function getClosestCity(lat, lon) {
  let closestCity = "Ranchi";
  let minDistance = Number.MAX_VALUE;

  for (const c of CITY_COORDINATES) {
    const d = (c.lat - lat) ** 2 + (c.lon - lon) ** 2;
    if (d < minDistance) {
      minDistance = d;
      closestCity = c.name;
    }
  }

  return closestCity;
}

/**
 * Detects the user's city via browser geolocation + OpenStreetMap reverse geocoding.
 * Falls back gracefully to nearest coordinate match if reverse geocoding is rate-limited.
 */
export function useLocation() {
  const [city, setCityState] = useState(null);
  const [status, setStatus] = useState("idle");

  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Hydrate location from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vouchiqo_city");
      if (saved) {
        if (isMountedRef.current) {
          setCityState(saved);
          setStatus("ready");
        }
      }
    } catch (e) {
      console.error("Failed to read location from localStorage:", e);
    }
  }, []);

  const setCity = useCallback((newCity) => {
    if (!isMountedRef.current) return;
    setCityState(newCity);
    try {
      if (newCity) {
        localStorage.setItem("vouchiqo_city", newCity);
        setStatus("ready");
      } else {
        localStorage.removeItem("vouchiqo_city");
        setStatus("idle");
      }
    } catch (e) {
      console.error("Failed to write location to localStorage:", e);
    }
  }, []);

  const detect = useCallback(() => {
    if (!navigator.geolocation) {
      if (isMountedRef.current) setStatus("unavailable");
      return;
    }

    if (isMountedRef.current) setStatus("detecting");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let detected = null;
        try {
          const res = await fetch(
            `${NOMINATIM_URL}?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
            { headers: { "Accept-Language": "en" } },
          );
          if (res.ok) {
            const data = await res.json();
            detected =
              data.address?.city ||
              data.address?.town ||
              data.address?.village ||
              data.address?.county ||
              null;
          }
        } catch (e) {
          console.warn(
            "Nominatim reverse geocode failed. Using coordinate fallback:",
            e,
          );
        }

        // If Nominatim fails or returns null, find closest Indian city from coordinates
        if (!detected) {
          detected = getClosestCity(coords.latitude, coords.longitude);
        }

        if (isMountedRef.current) {
          setCity(detected);
          setStatus("ready");
        }
      },
      () => {
        if (isMountedRef.current) setStatus("denied");
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, [setCity]);

  // Auto-detect on mount if browser permission has already been granted previously
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then(({ state }) => {
        if (state === "granted" && !localStorage.getItem("vouchiqo_city")) {
          detect();
        }
      })
      .catch(() => {});
  }, [detect]);

  return { city, setCity, status, detect };
}
