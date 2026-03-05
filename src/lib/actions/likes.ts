"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/actions/user";

export async function toggleLike(
  reviewId: string
): Promise<{ liked: boolean; error?: string }> {
  const userId = await getCurrentUserId();
  if (!userId) return { liked: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  // Check if already liked
  const { data: existingLike } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("review_id", reviewId)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("review_id", reviewId);

    if (error) return { liked: true, error: "Failed to unlike" };
    return { liked: false };
  } else {
    // Like
    const { error } = await supabase.from("likes").insert({
      user_id: userId,
      review_id: reviewId,
    });

    if (error) return { liked: false, error: "Failed to like" };
    return { liked: true };
  }
}

export async function hasUserLiked(reviewId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("likes")
    .select("id")
    .eq("user_id", userId)
    .eq("review_id", reviewId)
    .single();

  return !!data;
}

export async function getLikeCount(reviewId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("review_id", reviewId);

  return count ?? 0;
}

export async function getLikeInfo(
  reviewId: string
): Promise<{ count: number; hasLiked: boolean }> {
  const [count, hasLiked] = await Promise.all([
    getLikeCount(reviewId),
    hasUserLiked(reviewId),
  ]);

  return { count, hasLiked };
}

export async function getBatchLikeInfo(
  reviewIds: string[]
): Promise<Record<string, { count: number; hasLiked: boolean }>> {
  if (reviewIds.length === 0) return {};

  const userId = await getCurrentUserId();
  const supabase = createAdminClient();

  // Get all likes for these reviews
  const { data: allLikes } = await supabase
    .from("likes")
    .select("review_id, user_id")
    .in("review_id", reviewIds);

  // Build the result
  const result: Record<string, { count: number; hasLiked: boolean }> = {};

  for (const reviewId of reviewIds) {
    const reviewLikes = (allLikes ?? []).filter((l) => l.review_id === reviewId);
    result[reviewId] = {
      count: reviewLikes.length,
      hasLiked: userId ? reviewLikes.some((l) => l.user_id === userId) : false,
    };
  }

  return result;
}

// Get users who liked a review (for "liked by" display)
export interface LikeUser {
  id: string;
  username: string | null;
  avatar_url: string | null;
}

export async function getLikedBy(
  reviewId: string,
  limit = 10
): Promise<{ users: LikeUser[]; total: number }> {
  const supabase = createAdminClient();

  // Get users who liked (with count in same query)
  const { data: likes, count } = await supabase
    .from("likes")
    .select("user:users(id, username, avatar_url)", { count: "exact" })
    .eq("review_id", reviewId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const users: LikeUser[] = (likes ?? [])
    .map((l) => {
      const user = Array.isArray(l.user) ? l.user[0] : l.user;
      return user as LikeUser;
    })
    .filter((u): u is LikeUser => u !== null);

  // Total should reflect actual displayable users, not just like count
  // This prevents showing "3 likes" but only 2 avatars
  return { users, total: count ?? 0 };
}
