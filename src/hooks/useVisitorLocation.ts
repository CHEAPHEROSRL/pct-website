"use client";

import { useState, useEffect, useCallback } from "react";
import { haversineDistance } from "@/lib/trail";
import { geocodeCity, type GeocodedLocation } from "@/lib/geocode";

const STORAGE_KEY = "pct-visitor-location";

export interface VisitorLocation extends GeocodedLocation {
  setAt: number;
}

export interface VisitorDistanceInfo {
  /** Visitor's stored location */
  visitorLocation: VisitorLocation | null;
  /** Distance in miles from Paul's current position (null if no visitor or Paul location) */
  distanceMiles: number | null;
  /** Whether Paul is nearby (< 100 miles) */
  isNearby: boolean;
  /** Loading state during geocoding */
  isGeocoding: boolean;
  /** Error message if geocoding failed */
  error: string | null;
  /** Set visitor location by city name */
  setCity: (city: string) => Promise<boolean>;
  /** Clear stored location */
  clearLocation: () => void;
}

export function useVisitorLocation(
  paulLat: number | null,
  paulLng: number | null
): VisitorDistanceInfo {
  const [visitorLocation, setVisitorLocation] =
    useState<VisitorLocation | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount, or auto-detect via IP geolocation
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setVisitorLocation(JSON.parse(stored));
        return;
      }
    } catch {
      // Ignore parse errors
    }

    // No stored location — auto-detect via IP geolocation
    setIsGeocoding(true);
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && typeof data.lat === "number") {
          const displayParts = [data.city, data.regionName].filter(Boolean);
          const location: VisitorLocation = {
            lat: data.lat,
            lng: data.lon,
            displayName: displayParts.join(", ") || data.country || "Your location",
            setAt: Date.now(),
          };
          setVisitorLocation(location);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
        }
      })
      .catch(() => {
        // Silently fail — user can still enter manually
      })
      .finally(() => {
        setIsGeocoding(false);
      });
  }, []);

  // Calculate distance
  const distanceMiles =
    visitorLocation && paulLat !== null && paulLng !== null
      ? Math.round(
          haversineDistance(
            visitorLocation.lat,
            visitorLocation.lng,
            paulLat,
            paulLng
          )
        )
      : null;

  const isNearby = distanceMiles !== null && distanceMiles < 100;

  const setCity = useCallback(async (city: string): Promise<boolean> => {
    setIsGeocoding(true);
    setError(null);

    const result = await geocodeCity(city);

    if (!result) {
      setError("Could not find that location. Try a larger city nearby.");
      setIsGeocoding(false);
      return false;
    }

    const location: VisitorLocation = {
      ...result,
      setAt: Date.now(),
    };

    setVisitorLocation(location);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
    setIsGeocoding(false);
    return true;
  }, []);

  const clearLocation = useCallback(() => {
    setVisitorLocation(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    visitorLocation,
    distanceMiles,
    isNearby,
    isGeocoding,
    error,
    setCity,
    clearLocation,
  };
}
