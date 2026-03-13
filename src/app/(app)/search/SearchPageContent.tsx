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

const TYPE_LABELS: Record<string, string> = {
  trending: "Trending restaurants",
  pizza: "Pizza",
  sushi: "Sushi",
  cafe: "Coffee & Café",
  mexican: "Mexican & Tacos",
  burger: "Burgers",
  salad: "Healthy & Salads",
  italian: "Italian & Pasta",
  steakhouse: "Parrilla & Steakhouse",
};

function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || "";
}

export default function SearchPageContent() {
  const t = useT();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialTab = (searchParams.get("tab") as Tab) || "restaurants";
  const initialType = searchParams.get("type") || "";
  
  const [query, setQuery] = useState(initialQuery || getTypeLabel(initialType));
  const [selectedType, setSelectedType] = useState(initialType);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [location, setLocation] = useState<LocationState>({
    mode: "nearby",
    displayName: t("detectingLocation"),
  });
  
  // Restaurant search state
  const [restaurants, setRestaurants] = useState<RestaurantResult[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [forklistRatings, setForklistRatings] = useState<Record<string, { avg: number; count: number }>>({});
  
  // Trending restaurants (from our DB)
  const [trendingRestaurants, setTrendingRestaurants] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(false);
  
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
      } else if (location.mode === "country" && location.countryName) {
        params.set("country", location.countryName);
      }
      
      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const res = await fetch(`/api/places/text-search?${params.toString()}`);
      const data = await res.json();
      
      const newResults = data.results ?? [];
      
      if (pageToken) {
        setRestaurants(prev => [...prev, ...newResults]);
      } else {
        setRestaurants(newResults);
      }
      setNextPageToken(data.nextPageToken ?? null);
      
      // Fetch ForkList ratings for these results
      if (newResults.length > 0) {
        const placeIds = newResults.map((r: RestaurantResult) => r.placeId);
        fetchForklistRatings(placeIds);
      }
    } catch {
      setRestaurants([]);
    } finally {
      setLoadingRestaurants(false);
    }
  }

  // Fetch ForkList ratings for restaurants
  async function fetchForklistRatings(placeIds: string[]) {
    try {
      const res = await fetch("/api/restaurants/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeIds }),
      });
      const data = await res.json();
      setForklistRatings(prev => ({ ...prev, ...data.ratings }));
    } catch {
      // Silently fail
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

  // Trigger search on type from URL
  useEffect(() => {
    if (initialType === "trending") {
      loadTrendingRestaurants();
    } else if (initialType && query) {
      searchRestaurants(query);
    }
  }, []);

  // Load trending from our DB
  async function loadTrendingRestaurants() {
    setLoadingTrending(true);
    try {
      const res = await fetch("/api/restaurants/trending");
      const data = await res.json();
      setTrendingRestaurants(data.restaurants ?? []);
    } catch {
      setTrendingRestaurants([]);
    } finally {
      setLoadingTrending(false);
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
          placeholder={activeTab === "restaurants" ? t("searchRestaurantsPlaceholder") : t("searchPeoplePlaceholder")}
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

      {/* Type indicator */}
      {selectedType && activeTab === "restaurants" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedType === "trending" ? "🔥" : ""} {TYPE_LABELS[selectedType]}
          </span>
          <button
            onClick={() => {
              setSelectedType("");
              setQuery("");
              setRestaurants([]);
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {/* Trending results (from our DB) */}
        {selectedType === "trending" && activeTab === "restaurants" ? (
          loadingTrending ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : trendingRestaurants.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/30 p-8 text-center">
              <p className="text-muted-foreground">No trending restaurants yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Be the first to review!</p>
            </div>
          ) : (
            <>
              {trendingRestaurants.map((result) => (
                <Link
                  key={result.id}
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
                    {result.city && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {result.city}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        🔥 {result.reviewCount} {result.reviewCount === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </>
          )
        ) : query.trim().length < 2 && !selectedType ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {activeTab === "restaurants" ? t("startTypingRestaurants") : t("startTypingPeople")}
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
                      {(() => {
                        const flRating = forklistRatings[result.placeId];
                        if (flRating) {
                          // Show ForkList rating
                          return (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <span className="text-xs">🍴</span>
                                <Star size={14} className="text-primary" fill="currentColor" />
                                <span className="text-sm font-medium">{flRating.avg.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ({flRating.count})
                              </span>
                            </div>
                          );
                        } else if (result.rating) {
                          // Fallback to Google rating
                          return (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <Star size={14} className="text-yellow-500" fill="currentColor" />
                                <span className="text-sm font-medium">{result.rating.toFixed(1)}</span>
                              </div>
                              {result.ratingCount > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({result.ratingCount})
                                </span>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
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
