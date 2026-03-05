"use server";

import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/actions/user";

export interface FollowUser {
  id: string;
  username: string | null;
  created_at: string;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface FollowStatus {
  isFollowing: boolean;
  isPending: boolean;
}

// Get user by username
export async function getUserByUsername(username: string) {
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("id, username, created_at")
    .eq("username", username)
    .single();

  return user;
}

// Follow a user
export async function followUser(
  targetUserId: string
): Promise<{ error: string } | { success: true }> {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { error: "Not authenticated" };

  if (currentUserId === targetUserId) {
    return { error: "Cannot follow yourself" };
  }

  const supabase = createAdminClient();

  // Check if target user exists
  const { data: targetUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", targetUserId)
    .single();

  if (!targetUser) return { error: "User not found" };

  // For now, all profiles are public -> status = 'active'
  const { error } = await supabase.from("follows").insert({
    follower_id: currentUserId,
    following_id: targetUserId,
    status: "active",
  });

  if (error) {
    if (error.code === "23505") {
      // Already following
      return { success: true };
    }
    console.error("[followUser] Insert error:", error);
    return { error: "Failed to follow user" };
  }

  return { success: true };
}

// Unfollow a user
export async function unfollowUser(
  targetUserId: string
): Promise<{ error: string } | { success: true }> {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId);

  if (error) return { error: "Failed to unfollow user" };

  return { success: true };
}

// Check if current user follows a target user
export async function getFollowStatus(targetUserId: string): Promise<FollowStatus> {
  noStore();
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { isFollowing: false, isPending: false };

  const supabase = createAdminClient();

  const { data: follow } = await supabase
    .from("follows")
    .select("status")
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId)
    .single();

  if (!follow) return { isFollowing: false, isPending: false };

  return {
    isFollowing: follow.status === "active",
    isPending: follow.status === "pending",
  };
}

// Get followers of a user
export async function getFollowers(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ users: FollowUser[]; total: number }> {
  noStore();
  const supabase = createAdminClient();
  const offset = (page - 1) * limit;

  // Get total count
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId)
    .eq("status", "active");

  // Get followers
  const { data: follows } = await supabase
    .from("follows")
    .select("follower:users!follows_follower_id_fkey(id, username, created_at, bio, avatar_url)")
    .eq("following_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const users = (follows ?? []).map((f) => {
    const follower = Array.isArray(f.follower) ? f.follower[0] : f.follower;
    return follower as FollowUser;
  }).filter(Boolean);

  return { users, total: count ?? 0 };
}

// Get users that a user follows
export async function getFollowing(
  userId: string,
  page = 1,
  limit = 20
): Promise<{ users: FollowUser[]; total: number }> {
  noStore();
  const supabase = createAdminClient();
  const offset = (page - 1) * limit;

  // Get total count
  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", userId)
    .eq("status", "active");

  // Get following
  const { data: follows } = await supabase
    .from("follows")
    .select("following:users!follows_following_id_fkey(id, username, created_at, bio, avatar_url)")
    .eq("follower_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const users = (follows ?? []).map((f) => {
    const following = Array.isArray(f.following) ? f.following[0] : f.following;
    return following as FollowUser;
  }).filter(Boolean);

  return { users, total: count ?? 0 };
}

// Get follower and following counts for a user
export async function getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
  const supabase = createAdminClient();

  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId)
      .eq("status", "active"),
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId)
      .eq("status", "active"),
  ]);

  return {
    followers: followersResult.count ?? 0,
    following: followingResult.count ?? 0,
  };
}

// Get feed reviews from people the current user follows
export interface FeedReview {
  id: string;
  rating_overall: number;
  comment: string | null;
  visited_at: string;
  created_at: string;
  user: {
    id: string;
    username: string | null;
  };
  restaurant: {
    id: string;
    name: string;
    city: string | null;
    photo_reference: string | null;
  };
}

export async function getFeedReviews(
  page = 1,
  limit = 10
): Promise<{ reviews: FeedReview[]; total: number; hasMore: boolean }> {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { reviews: [], total: 0, hasMore: false };

  const supabase = createAdminClient();
  const offset = (page - 1) * limit;

  // Get IDs of people the current user follows + self
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", currentUserId)
    .eq("status", "active");

  // Include own reviews + reviews from people we follow
  const userIds = [currentUserId];
  if (follows && follows.length > 0) {
    userIds.push(...follows.map((f) => f.following_id));
  }

  // Get total count
  const { count } = await supabase
    .from("reviews")
    .select("*", { count: "exact", head: true })
    .in("user_id", userIds);

  // Get reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
      rating_overall,
      comment,
      visited_at,
      created_at,
      user:users!reviews_user_id_fkey(id, username),
      restaurant:restaurants!reviews_restaurant_id_fkey(id, name, city, photo_reference)
    `)
    .in("user_id", userIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const feedReviews = (reviews ?? []).map((r) => ({
    id: r.id,
    rating_overall: r.rating_overall,
    comment: r.comment,
    visited_at: r.visited_at,
    created_at: r.created_at,
    user: Array.isArray(r.user) ? r.user[0] : r.user,
    restaurant: Array.isArray(r.restaurant) ? r.restaurant[0] : r.restaurant,
  })) as FeedReview[];

  const total = count ?? 0;

  return {
    reviews: feedReviews,
    total,
    hasMore: offset + limit < total,
  };
}
