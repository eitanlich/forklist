"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import type { PlaceSuggestion } from "@/types";
import LocationFilter, { type LocationState } from "./LocationFilter";

interface Suggestion {
  placeId: string;
  name: string;
  address: string;
}

interface RestaurantSearchProps {
  onSelect: (restaurant: PlaceSuggestion) => void;
}

export default function RestaurantSearch({ onSelect }: RestaurantSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    mode: "nearby",
    displayName: "Detecting...",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced autocomplete with location
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Build URL with location params
        const params = new URLSearchParams({ q: query });
        
        if (location.mode === "nearby" && location.lat && location.lng) {
          params.set("lat", location.lat.toString());
          params.set("lng", location.lng.toString());
        } else if (location.mode === "country" && location.country) {
          params.set("country", location.country);
        }
        // mode === "global" -> no filters

        const res = await fetch(`/api/places/search?${params.toString()}`);
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query, location]);

  async function handleSelect(placeId: string) {
    setShowDropdown(false);
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`/api/places/details?placeId=${placeId}`);
      const data = await res.json();
      onSelect(data as PlaceSuggestion);
    } catch {
      setIsLoadingDetails(false);
    }
  }

  if (isLoadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading restaurant…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">Log a Visit</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search for the restaurant you visited
        </p>
      </div>

      {/* Location filter */}
      <LocationFilter value={location} onChange={setLocation} />

      {/* Search input */}
      <div className="relative">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Search restaurants…"
            autoFocus
            className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            {suggestions.map((s) => (
              <button
                key={s.placeId}
                type="button"
                onClick={() => handleSelect(s.placeId)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-secondary"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {s.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.address}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty state hint */}
      {query.trim().length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Start typing to search for a restaurant
        </p>
      )}
    </div>
  );
}
