"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface PopularReview {
  id: string;
  rating_overall: number;
  comment: string | null;
  visited_at: string;
  created_at: string;
  like_count: number;
  user: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  restaurant: {
    id: string;
    name: string;
    city: string | null;
    photo_reference: string | null;
  };
}

export async function getPopularReviews(
  limit = 10
): Promise<{ reviews: PopularReview[]; error?: string }> {
  const supabase = createAdminClient();

  // Get reviews from last 7 days with most likes
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // First get review IDs with like counts
  const { data: likeCounts, error: likeError } = await supabase
    .from("likes")
    .select("review_id")
    .gte("created_at", sevenDaysAgo.toISOString());

  if (likeError) {
    return { reviews: [], error: "Failed to fetch popular reviews" };
  }

  // Count likes per review
  const reviewLikes: Record<string, number> = {};
  for (const like of likeCounts ?? []) {
    reviewLikes[like.review_id] = (reviewLikes[like.review_id] ?? 0) + 1;
  }

  // Get top review IDs sorted by like count
  const sortedReviewIds = Object.entries(reviewLikes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (sortedReviewIds.length === 0) {
    // Fall back to recent reviews if no likes
    return getRecentReviews(limit);
  }

  // Fetch full review data
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating_overall,
      comment,
      visited_at,
      created_at,
      user:users!reviews_user_id_fkey(id, username, avatar_url, is_private),
      restaurant:restaurants!reviews_restaurant_id_fkey(id, name, city, photo_reference)
    `)
    .in("id", sortedReviewIds);

  if (error) {
    return { reviews: [], error: "Failed to fetch reviews" };
  }

  // Map, filter private users, and sort by like count
  const popularReviews = (reviews ?? [])
    .map((r) => {
      const user = Array.isArray(r.user) ? r.user[0] : r.user;
      return {
        id: r.id,
        rating_overall: r.rating_overall,
        comment: r.comment,
        visited_at: r.visited_at,
        created_at: r.created_at,
        like_count: reviewLikes[r.id] ?? 0,
        user: { id: user?.id, username: user?.username, avatar_url: user?.avatar_url },
        restaurant: Array.isArray(r.restaurant) ? r.restaurant[0] : r.restaurant,
        _isPrivate: user?.is_private ?? false,
      };
    })
    .filter((r) => !r._isPrivate && r.user?.username) // Exclude private users and users without username
    .map(({ _isPrivate, ...review }) => review) // Remove internal field
    .sort((a, b) => b.like_count - a.like_count) as PopularReview[];

  return { reviews: popularReviews };
}

export async function getRecentReviews(
  limit = 10
): Promise<{ reviews: PopularReview[]; error?: string }> {
  const supabase = createAdminClient();

  // Fetch more than limit to account for filtering private users
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select(`
      id,
      rating_overall,
      comment,
      visited_at,
      created_at,
      user:users!reviews_user_id_fkey(id, username, avatar_url, is_private),
      restaurant:restaurants!reviews_restaurant_id_fkey(id, name, city, photo_reference)
    `)
    .order("created_at", { ascending: false })
    .limit(limit * 2); // Fetch extra to account for filtering

  if (error) {
    return { reviews: [], error: "Failed to fetch recent reviews" };
  }

  // Filter out private users and users without username
  const publicReviews = (reviews ?? []).filter((r) => {
    const user = Array.isArray(r.user) ? r.user[0] : r.user;
    return user?.username && !user?.is_private;
  }).slice(0, limit);

  // Get like counts for these reviews
  const reviewIds = publicReviews.map((r) => r.id);
  const { data: likes } = await supabase
    .from("likes")
    .select("review_id")
    .in("review_id", reviewIds);

  const likeCounts: Record<string, number> = {};
  for (const like of likes ?? []) {
    likeCounts[like.review_id] = (likeCounts[like.review_id] ?? 0) + 1;
  }

  const recentReviews = publicReviews.map((r) => {
    const user = Array.isArray(r.user) ? r.user[0] : r.user;
    return {
      id: r.id,
      rating_overall: r.rating_overall,
      comment: r.comment,
      visited_at: r.visited_at,
      created_at: r.created_at,
      like_count: likeCounts[r.id] ?? 0,
      user: { id: user?.id, username: user?.username, avatar_url: user?.avatar_url },
      restaurant: Array.isArray(r.restaurant) ? r.restaurant[0] : r.restaurant,
    };
  }) as PopularReview[];

  return { reviews: recentReviews };
}
