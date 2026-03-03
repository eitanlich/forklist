"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface ProfileStats {
  totalReviews: number;
  totalRestaurants: number;
  totalCountries: number;
  averageRating: number;
  totalLikesReceived: number;
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const supabase = createAdminClient();

  // Get reviews
  const { data: reviews, count: reviewCount } = await supabase
    .from("reviews")
    .select("id, rating_overall, restaurant:restaurants!reviews_restaurant_id_fkey(id, country)", { count: "exact" })
    .eq("user_id", userId);

  // Calculate stats from reviews
  const restaurantIds = new Set<string>();
  const countries = new Set<string>();
  let totalRating = 0;

  for (const review of reviews ?? []) {
    const restaurant = Array.isArray(review.restaurant) ? review.restaurant[0] : review.restaurant;
    if (restaurant?.id) restaurantIds.add(restaurant.id);
    if (restaurant?.country) countries.add(restaurant.country);
    totalRating += review.rating_overall;
  }

  // Get total likes received on user's reviews
  const reviewIds = (reviews ?? []).map((r) => r.id);
  let totalLikes = 0;
  
  if (reviewIds.length > 0) {
    const { count: likeCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .in("review_id", reviewIds);
    totalLikes = likeCount ?? 0;
  }

  return {
    totalReviews: reviewCount ?? 0,
    totalRestaurants: restaurantIds.size,
    totalCountries: countries.size,
    averageRating: reviewCount ? Math.round((totalRating / reviewCount) * 10) / 10 : 0,
    totalLikesReceived: totalLikes,
  };
}
