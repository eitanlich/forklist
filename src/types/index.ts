export type Occasion = "date" | "family" | "friends" | "business" | "solo" | "other";

export interface DbUser {
  id: string;
  clerk_id: string;
  email: string;
  username: string | null;
  created_at: string;
}

export interface Restaurant {
  id: string;
  google_place_id: string;
  name: string;
  address: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  photo_reference: string | null;
  cuisine_type: string | null;
  website: string | null;
  google_maps_url: string | null;
  instagram: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  restaurant_id: string;
  rating_overall: number;
  rating_food: number;
  rating_service: number;
  rating_ambiance: number;
  rating_price: number;
  comment: string | null;
  occasion: Occasion | null;
  visited_at: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithRestaurant extends Review {
  restaurant: Restaurant;
}

// Google Places Autocomplete result shape (subset we care about)
export interface PlaceSuggestion {
  place_id: string;
  name: string;
  formatted_address: string;
  city?: string;
  lat?: number;
  lng?: number;
  photo_reference?: string;
  cuisine_type?: string;
  website?: string;
  google_maps_url?: string;
}
