"use server";

import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "./user";

export interface RestaurantWithReviews {
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
  phone: string | null;
  price_level: number | null;
  opening_hours: {
    open_now?: boolean | null;
    weekday_text?: string[];
    periods?: any[];
  } | null;
  created_at: string;
  // Aggregated data
  review_count: number;
  average_rating: number | null;
  reviews: RestaurantReview[];
}

export interface RestaurantReview {
  id: string;
  rating_overall: number;
  rating_food: number;
  rating_service: number;
  rating_ambiance: number;
  rating_price: number;
  comment: string | null;
  occasion: string | null;
  meal_type: string | null;
  visited_at: string;
  created_at: string;
  user: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  like_count: number;
  liked_by_me: boolean;
}

export async function getRestaurantById(
  id: string
): Promise<RestaurantWithReviews | null> {
  noStore();
  const supabase = createAdminClient();
  const currentUserId = await getCurrentUserId();

  // Get restaurant
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !restaurant) return null;

  // Get reviews for this restaurant
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
      rating_overall,
      rating_food,
      rating_service,
      rating_ambiance,
      rating_price,
      comment,
      occasion,
      meal_type,
      visited_at,
      created_at,
      user:users!reviews_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq("restaurant_id", id)
    .order("visited_at", { ascending: false });

  // Get like counts and user's likes for each review
  const reviewIds = reviews?.map((r) => r.id) ?? [];
  
  let likeCounts: Record<string, number> = {};
  let userLikes: Set<string> = new Set();
  
  if (reviewIds.length > 0) {
    // Get like counts
    const { data: likes } = await supabase
      .from("likes")
      .select("review_id")
      .in("review_id", reviewIds);
    
    if (likes) {
      for (const like of likes) {
        likeCounts[like.review_id] = (likeCounts[like.review_id] ?? 0) + 1;
      }
    }
    
    // Get current user's likes
    if (currentUserId) {
      const { data: myLikes } = await supabase
        .from("likes")
        .select("review_id")
        .eq("user_id", currentUserId)
        .in("review_id", reviewIds);
      
      if (myLikes) {
        userLikes = new Set(myLikes.map((l) => l.review_id));
      }
    }
  }

  // Format reviews
  const formattedReviews: RestaurantReview[] = (reviews ?? []).map((r) => ({
    id: r.id,
    rating_overall: r.rating_overall,
    rating_food: r.rating_food,
    rating_service: r.rating_service,
    rating_ambiance: r.rating_ambiance,
    rating_price: r.rating_price,
    comment: r.comment,
    occasion: r.occasion,
    meal_type: r.meal_type,
    visited_at: r.visited_at,
    created_at: r.created_at,
    user: Array.isArray(r.user) ? r.user[0] : r.user,
    like_count: likeCounts[r.id] ?? 0,
    liked_by_me: userLikes.has(r.id),
  }));

  // Calculate average rating
  const ratings = formattedReviews.map((r) => r.rating_overall);
  const averageRating = ratings.length > 0
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : null;

  return {
    ...restaurant,
    review_count: formattedReviews.length,
    average_rating: averageRating,
    reviews: formattedReviews,
  };
}

export async function getRestaurantByGooglePlaceId(
  googlePlaceId: string
): Promise<RestaurantWithReviews | null> {
  noStore();
  const supabase = createAdminClient();

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("google_place_id", googlePlaceId)
    .single();

  if (!restaurant) return null;

  return getRestaurantById(restaurant.id);
}
