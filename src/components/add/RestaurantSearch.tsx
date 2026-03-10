"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, Loader2, MapPin, Star, ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import AddToListModal from "@/components/lists/AddToListModal";
import type { PlaceSuggestion } from "@/types";
import LocationFilter, { type LocationState } from "./LocationFilter";
import { useT } from "@/lib/i18n";

interface Suggestion {
  placeId: string;
  name: string;
  address: string;
}

interface SearchResult {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  ratingCount: number;
  priceLevel: string | null;
  photoReference: string | null;
}

interface RestaurantSearchProps {
  onSelect: (restaurant: PlaceSuggestion) => void;
}

export default function RestaurantSearch({ onSelect }: RestaurantSearchProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [prevPageTokens, setPrevPageTokens] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    mode: "nearby",
    displayName: "Detecting...",
  });
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Add to list modal state
  const [listModalOpen, setListModalOpen] = useState(false);
  const [selectedForList, setSelectedForList] = useState<{
    restaurantId: string;
    restaurantName: string;
  } | null>(null);
  const [savingToList, setSavingToList] = useState<string | null>(null);

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
    setShowResults(false);
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`/api/places/details?placeId=${placeId}`);
      const data = await res.json();
      onSelect(data as PlaceSuggestion);
    } catch {
      setIsLoadingDetails(false);
    }
  }

  async function handleSearch(pageToken?: string) {
    if (query.trim().length < 2) return;
    
    setShowDropdown(false);
    setIsLoadingResults(true);
    setShowResults(true);

    try {
      const params = new URLSearchParams({ q: query });
      
      if (location.mode === "nearby" && location.lat && location.lng) {
        params.set("lat", location.lat.toString());
        params.set("lng", location.lng.toString());
      } else if (location.mode === "country" && location.countryName) {
        params.set("country", location.countryName);
      }
      
      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const res = await fetch(`/api/places/text-search?${params.toString()}`);
      const data = await res.json();
      
      setSearchResults(data.results ?? []);
      setNextPageToken(data.nextPageToken ?? null);
    } catch {
      setSearchResults([]);
    } finally {
      setIsLoadingResults(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      setPrevPageTokens([]);
      handleSearch();
    }
  }

  function handleNextPage() {
    if (nextPageToken) {
      setPrevPageTokens((prev) => [...prev, nextPageToken]);
      handleSearch(nextPageToken);
    }
  }

  function handleBackToSearch() {
    setShowResults(false);
    setSearchResults([]);
    setNextPageToken(null);
    setPrevPageTokens([]);
  }

  async function handleAddToList(result: SearchResult) {
    setSavingToList(result.placeId);
    
    try {
      // First get full details
      const detailsRes = await fetch(`/api/places/details?placeId=${result.placeId}`);
      const details = await detailsRes.json();
      
      // Upsert to get restaurant ID
      const upsertRes = await fetch("/api/restaurants/upsert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          google_place_id: details.place_id,
          name: details.name,
          address: details.formatted_address,
          city: details.city,
          lat: details.lat,
          lng: details.lng,
          photo_reference: details.photo_reference,
          cuisine_type: details.cuisine_type,
          website: details.website,
          google_maps_url: details.google_maps_url,
          // New fields
          instagram: details.instagram,
          phone: details.phone,
          price_level: details.price_level,
          opening_hours: details.opening_hours,
        }),
      });
      
      const { id: restaurantId } = await upsertRes.json();
      
      setSelectedForList({
        restaurantId,
        restaurantName: details.name,
      });
      setListModalOpen(true);
    } catch (error) {
      console.error("Failed to prepare for list:", error);
    } finally {
      setSavingToList(null);
    }
  }

  const t = useT();

  if (isLoadingDetails) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("loadingRestaurant")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-serif text-2xl font-semibold">{t("logAVisit")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("searchRestaurants")}
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
            onChange={(e) => {
              setQuery(e.target.value);
              if (showResults) setShowResults(false);
            }}
            onFocus={() => suggestions.length > 0 && !showResults && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={t("searchPlaceholder")}
            autoFocus
            className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {(isSearching || isLoadingResults) && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && suggestions.length > 0 && !showResults && (
          <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            {suggestions.map((s) => (
              <Link
                key={s.placeId}
                href={`/restaurant/${s.placeId}`}
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
              </Link>
            ))}
            {/* Hint to press Enter */}
            <div className="border-t border-border px-4 py-2 text-center text-xs text-muted-foreground">
              {t("pressEnterForMore")}
            </div>
          </div>
        )}
      </div>

      {/* Search results */}
      {showResults && (
        <div className="space-y-4">
          {/* Results header */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {t("resultsFor")} &quot;{query}&quot;
            </p>
            <button
              type="button"
              onClick={handleBackToSearch}
              className="text-sm text-primary hover:underline"
            >
              {t("clearResults")}
            </button>
          </div>

          {/* Results list */}
          {isLoadingResults ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : searchResults.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
              <p className="text-muted-foreground">{t("noResultsFound")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((result) => (
                <Link
                  key={result.placeId}
                  href={`/restaurant/${result.placeId}`}
                  className="group flex w-full gap-4 rounded-2xl border border-border bg-card p-4 text-left transition-all duration-200 hover:border-primary/30 hover:bg-card/80"
                >
                  {/* Photo */}
                  <div className="shrink-0">
                    {result.photoReference ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`/api/places/photo?ref=${encodeURIComponent(result.photoReference)}`}
                        alt={result.name}
                        className="h-20 w-20 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-secondary">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-serif text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                      {result.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {result.address}
                    </p>
                    {result.rating && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-primary" fill="currentColor" />
                          <span className="text-sm font-medium">{result.rating.toFixed(1)}</span>
                        </div>
                        {result.ratingCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({result.ratingCount})
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add to list button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToList(result);
                    }}
                    disabled={savingToList === result.placeId}
                    className="flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-xl border border-border bg-secondary text-muted-foreground transition-all hover:border-primary/30 hover:text-primary disabled:opacity-50"
                    title={t("addToList")}
                  >
                    {savingToList === result.placeId ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </button>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {nextPageToken && !isLoadingResults && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleNextPage}
                className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80"
              >
                {t("loadMore")}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty state hint */}
      {query.trim().length === 0 && !showResults && (
        <p className="text-center text-sm text-muted-foreground">
          {t("startTyping")}
        </p>
      )}

      {/* Add to list modal */}
      {selectedForList && (
        <AddToListModal
          isOpen={listModalOpen}
          onClose={() => {
            setListModalOpen(false);
            setSelectedForList(null);
          }}
          restaurantId={selectedForList.restaurantId}
          restaurantName={selectedForList.restaurantName}
        />
      )}
    </div>
  );
}
