"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Get current user's Supabase ID
async function getCurrentUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  return user?.id ?? null;
}

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
