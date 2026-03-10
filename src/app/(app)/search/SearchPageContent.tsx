"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, Loader2, MapPin, Star, Lock } from "lucide-react";
import { useT } from "@/lib/i18n";
import LocationFilter, { type LocationState } from "@/components/add/LocationFilter";

interface RestaurantResult {
  placeId: string;
  name: string;
  address: string;
  rating: number | null;
  ratingCount: number;
  priceLevel: string | null;
  photoReference: string | null;
}

interface UserResult {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_private: boolean;
}

type Tab = "restaurants" | "people";

export default function SearchPageContent() {
  const t = useT();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTab = (searchParams.get("tab") as Tab) || "restaurants";
  
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [location, setLocation] = useState<LocationState>({
    mode: "nearby",
    displayName: t("detectingLocation"),
  });
  
  // Restaurant search state
  const [restaurants, setRestaurants] = useState<RestaurantResult[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  
  // People search state
  const [people, setPeople] = useState<UserResult[]>([]);
  const [loadingPeople, setLoadingPeople] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search restaurants
  async function searchRestaurants(searchQuery: string, pageToken?: string) {
    if (searchQuery.trim().length < 2) {
      setRestaurants([]);
      return;
    }
    
    setLoadingRestaurants(true);
    
    try {
      const params = new URLSearchParams({ q: searchQuery });
      
      if (location.mode === "nearby" && location.lat && location.lng) {
        params.set("lat", location.lat.toString());
        params.set("lng", location.lng.toString());
      } else if (location.mode === "country" && location.country) {
        params.set("country", location.country);
      }
      
      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const res = await fetch(`/api/places/text-search?${params.toString()}`);
      const data = await res.json();
      
      if (pageToken) {
        setRestaurants(prev => [...prev, ...(data.results ?? [])]);
      } else {
        setRestaurants(data.results ?? []);
      }
      setNextPageToken(data.nextPageToken ?? null);
    } catch {
      setRestaurants([]);
    } finally {
      setLoadingRestaurants(false);
    }
  }

  // Search people
  async function searchPeople(searchQuery: string) {
    if (searchQuery.trim().length < 2) {
      setPeople([]);
      return;
    }
    
    setLoadingPeople(true);
    
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setPeople(data.users ?? []);
    } catch {
      setPeople([]);
    } finally {
      setLoadingPeople(false);
    }
  }

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (activeTab === "restaurants") {
        searchRestaurants(query);
      } else {
        searchPeople(query);
      }
    }, 300);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, activeTab, location]);

  // Handle tab change
  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    // Trigger search for new tab
    if (query.trim().length >= 2) {
      if (tab === "restaurants") {
        searchRestaurants(query);
      } else {
        searchPeople(query);
      }
    }
  }

  const isLoading = activeTab === "restaurants" ? loadingRestaurants : loadingPeople;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl font-semibold">{t("explore")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("exploreSubtitle")}
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-border bg-secondary py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => handleTabChange("restaurants")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "restaurants"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("restaurants") || "Restaurants"}
        </button>
        <button
          onClick={() => handleTabChange("people")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "people"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {t("users")}
        </button>
      </div>

      {/* Location filter (only for restaurants) */}
      {activeTab === "restaurants" && (
        <LocationFilter value={location} onChange={setLocation} />
      )}

      {/* Results */}
      <div className="space-y-3">
        {query.trim().length < 2 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t("startTyping")}
          </p>
        ) : isLoading && (activeTab === "restaurants" ? restaurants.length === 0 : people.length === 0) ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : activeTab === "restaurants" ? (
          <>
            {restaurants.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
                <p className="text-muted-foreground">{t("noResultsFound")}</p>
              </div>
            ) : (
              <>
                {restaurants.map((result) => (
                  <Link
                    key={result.placeId}
                    href={`/restaurant/${result.placeId}`}
                    className="flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80"
                  >
                    {result.photoReference ? (
                      <img
                        src={`/api/places/photo?ref=${encodeURIComponent(result.photoReference)}`}
                        alt={result.name}
                        className="h-20 w-20 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-serif text-lg font-semibold tracking-tight">
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
                  </Link>
                ))}
                
                {/* Load more */}
                {nextPageToken && (
                  <button
                    onClick={() => searchRestaurants(query, nextPageToken)}
                    disabled={loadingRestaurants}
                    className="w-full rounded-xl bg-secondary py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
                  >
                    {loadingRestaurants ? t("loading") : t("loadMore")}
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {people.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
                <p className="text-muted-foreground">{t("noUsersFound")}</p>
              </div>
            ) : (
              people.map((user) => (
                <Link
                  key={user.id}
                  href={`/u/${user.username}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-card/80"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.username || "User"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-lg font-medium text-muted-foreground">
                      {(user.username || "U")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">@{user.username}</p>
                      {user.is_private && (
                        <Lock size={14} className="text-muted-foreground" />
                      )}
                    </div>
                    {user.bio && (
                      <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
