"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type TimePeriod = "month" | "year" | "all";

export interface ProfileStats {
  totalReviews: number;
  totalRestaurants: number;
  averageRating: number;
  topCuisine: string | null;
  topOccasion: string | null;
  totalLikesReceived: number;
  totalCities: number;
}

export async function getProfileStats(
  userId: string,
  period: TimePeriod = "all"
): Promise<ProfileStats> {
  const supabase = createAdminClient();

  // Calculate date filter based on period
  let dateFilter: string | null = null;
  const now = new Date();
  
  if (period === "month") {
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = monthAgo.toISOString();
  } else if (period === "year") {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    dateFilter = yearStart.toISOString();
  }

  // Build query
  let query = supabase
    .from("reviews")
    .select(`
      id, 
      rating_overall, 
      cuisine_type,
      occasion,
      restaurant:restaurants!reviews_restaurant_id_fkey(id, city)
    `)
    .eq("user_id", userId);

  if (dateFilter) {
    query = query.gte("visited_at", dateFilter);
  }

  const { data: reviews, error } = await query;
  
  // Debug: log if there's an issue
  if (error) {
    console.error("Error fetching reviews for stats:", error);
  }

  // Calculate stats from reviews
  const restaurantIds = new Set<string>();
  const cities = new Set<string>();
  const cuisineCounts: Record<string, number> = {};
  const occasionCounts: Record<string, number> = {};
  let totalRating = 0;

  for (const review of reviews ?? []) {
    const restaurant = Array.isArray(review.restaurant) ? review.restaurant[0] : review.restaurant;
    if (restaurant?.id) restaurantIds.add(restaurant.id);
    if (restaurant?.city) cities.add(restaurant.city);
    totalRating += review.rating_overall;
    
    // Count cuisines
    if (review.cuisine_type) {
      cuisineCounts[review.cuisine_type] = (cuisineCounts[review.cuisine_type] || 0) + 1;
    }
    
    // Count occasions
    if (review.occasion) {
      occasionCounts[review.occasion] = (occasionCounts[review.occasion] || 0) + 1;
    }
  }

  // Find top cuisine and occasion
  const topCuisine = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  
  const topOccasion = Object.entries(occasionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Get total likes received on user's reviews (within period)
  const reviewIds = (reviews ?? []).map((r) => r.id);
  let totalLikes = 0;
  
  if (reviewIds.length > 0) {
    const { count: likeCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .in("review_id", reviewIds);
    totalLikes = likeCount ?? 0;
  }

  const reviewCount = reviews?.length ?? 0;

  return {
    totalReviews: reviewCount,
    totalRestaurants: restaurantIds.size,
    averageRating: reviewCount ? Math.round((totalRating / reviewCount) * 10) / 10 : 0,
    topCuisine,
    topOccasion,
    totalLikesReceived: totalLikes,
    totalCities: cities.size,
  };
}
