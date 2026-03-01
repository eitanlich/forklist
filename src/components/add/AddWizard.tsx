"use client";

import { useState } from "react";
import RestaurantSearch from "./RestaurantSearch";
import ReviewForm from "./ReviewForm";
import type { PlaceSuggestion } from "@/types";

export default function AddWizard() {
  const [restaurant, setRestaurant] = useState<PlaceSuggestion | null>(null);

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
