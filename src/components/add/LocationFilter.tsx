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

// Common countries shown by default
const COMMON_COUNTRIES = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
];

// Full list for search
const ALL_COUNTRIES = [
  { code: "AF", name: "Afghanistan", flag: "🇦🇫" },
  { code: "AL", name: "Albania", flag: "🇦🇱" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿" },
  { code: "AD", name: "Andorra", flag: "🇦🇩" },
  { code: "AO", name: "Angola", flag: "🇦🇴" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "AM", name: "Armenia", flag: "🇦🇲" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩" },
  { code: "BY", name: "Belarus", flag: "🇧🇾" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "BZ", name: "Belize", flag: "🇧🇿" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "BA", name: "Bosnia", flag: "🇧🇦" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
  { code: "KH", name: "Cambodia", flag: "🇰🇭" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "CY", name: "Cyprus", flag: "🇨🇾" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "DO", name: "Dominican Republic", flag: "🇩🇴" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "GE", name: "Georgia", flag: "🇬🇪" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "IR", name: "Iran", flag: "🇮🇷" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "JO", name: "Jordan", flag: "🇯🇴" },
  { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" },
  { code: "LB", name: "Lebanon", flag: "🇱🇧" },
  { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MT", name: "Malta", flag: "🇲🇹" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "PA", name: "Panama", flag: "🇵🇦" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "PE", name: "Peru", flag: "🇵🇪" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "RU", name: "Russia", flag: "🇷🇺" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "RS", name: "Serbia", flag: "🇷🇸" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" },
  { code: "AE", name: "UAE", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
];

interface LocationFilterProps {
  value: LocationState;
  onChange: (location: LocationState) => void;
}

export default function LocationFilter({ value, onChange }: LocationFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Filter countries based on search
  const filteredCountries = countrySearch.trim()
    ? ALL_COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
          c.code.toLowerCase().includes(countrySearch.toLowerCase())
      )
    : COMMON_COUNTRIES;

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
    const country = ALL_COUNTRIES.find((c) => c.code === code);
    if (country) {
      onChange({
        mode: "country",
        country: code,
        displayName: `${country.flag} ${country.name}`,
      });
    }
    setCountrySearch("");
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

          {/* Country search */}
          <div className="mb-2">
            <input
              type="text"
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Country list */}
          <p className="mb-2 text-xs text-muted-foreground">
            {countrySearch ? `Results for "${countrySearch}"` : "Popular countries:"}
          </p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {filteredCountries.map((c) => (
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
            {filteredCountries.length === 0 && (
              <p className="text-sm text-muted-foreground">No countries found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
