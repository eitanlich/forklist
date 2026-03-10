"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import RestaurantSearch from "./RestaurantSearch";
import ReviewForm from "./ReviewForm";
import type { PlaceSuggestion } from "@/types";

export default function AddWizard() {
  const searchParams = useSearchParams();
  const placeIdParam = searchParams.get("placeId");
  
  const [restaurant, setRestaurant] = useState<PlaceSuggestion | null>(null);
  const [loading, setLoading] = useState(!!placeIdParam);
  const [error, setError] = useState<string | null>(null);

  // If placeId is in URL, fetch restaurant details directly
  useEffect(() => {
    if (!placeIdParam) return;

    async function fetchRestaurant() {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/places/details?placeId=${placeIdParam}`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        setRestaurant(data as PlaceSuggestion);
      } catch {
        setError("Could not load restaurant. Please search manually.");
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurant();
  }, [placeIdParam]);

  // Loading state when fetching from placeId param
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading restaurant...</p>
      </div>
    );
  }

  // Error state - fall back to search
  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-center">
          <p className="text-sm text-destructive">{error}</p>
        </div>
        <RestaurantSearch onSelect={setRestaurant} />
      </div>
    );
  }

  if (!restaurant) {
    return <RestaurantSearch onSelect={setRestaurant} />;
  }

  return (
    <ReviewForm
      restaurant={restaurant}
      onBack={() => setRestaurant(null)}
    />
  );
}
