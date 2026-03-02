"use client";

import { useState, useEffect } from "react";
import { MapPin, ChevronDown, X, Globe, Navigation } from "lucide-react";

export type LocationMode = "nearby" | "country" | "global";

export interface LocationState {
  mode: LocationMode;
  lat?: number;
  lng?: number;
  country?: string;
  displayName: string;
}

const COUNTRIES = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
];

interface LocationFilterProps {
  value: LocationState;
  onChange: (location: LocationState) => void;
}

export default function LocationFilter({ value, onChange }: LocationFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    if (value.mode === "nearby" && !value.lat) {
      detectLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function detectLocation() {
    if (!navigator.geolocation) {
      // Fallback to global if no geolocation
      onChange({ mode: "global", displayName: "Global" });
      return;
    }

    setIsLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocode to get city name
        try {
          const res = await fetch(
            `/api/places/geocode?lat=${latitude}&lng=${longitude}`
          );
          const data = await res.json();
          
          onChange({
            mode: "nearby",
            lat: latitude,
            lng: longitude,
            displayName: data.city || "Near you",
          });
        } catch {
          onChange({
            mode: "nearby",
            lat: latitude,
            lng: longitude,
            displayName: "Near you",
          });
        }
        
        setIsLoadingLocation(false);
      },
      () => {
        // User denied or error - fallback to global
        onChange({ mode: "global", displayName: "Global" });
        setIsLoadingLocation(false);
      },
      { timeout: 10000 }
    );
  }

  function selectCountry(code: string) {
    const country = COUNTRIES.find((c) => c.code === code);
    if (country) {
      onChange({
        mode: "country",
        country: code,
        displayName: `${country.flag} ${country.name}`,
      });
    }
    setIsExpanded(false);
  }

  function selectGlobal() {
    onChange({ mode: "global", displayName: "Global" });
    setIsExpanded(false);
  }

  function selectNearby() {
    detectLocation();
    setIsExpanded(false);
  }

  return (
    <div className="space-y-2">
      {/* Main location bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-left transition-colors hover:bg-primary/10"
      >
        <MapPin size={18} className="shrink-0 text-primary" />
        <span className="flex-1 text-sm font-medium text-primary">
          {isLoadingLocation ? "Detecting location..." : value.displayName}
        </span>
        {isExpanded ? (
          <X size={16} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={16} className="text-muted-foreground" />
        )}
      </button>

      {/* Expanded options */}
      {isExpanded && (
        <div className="rounded-xl border border-border bg-card p-3 shadow-lg">
          {/* Quick options */}
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={selectNearby}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                value.mode === "nearby"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              <Navigation size={14} />
              Near me
            </button>
            <button
              type="button"
              onClick={selectGlobal}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                value.mode === "global"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              <Globe size={14} />
              Global
            </button>
          </div>

          {/* Country list */}
          <p className="mb-2 text-xs text-muted-foreground">Or select country:</p>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => selectCountry(c.code)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  value.mode === "country" && value.country === c.code
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {c.flag} {c.code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
