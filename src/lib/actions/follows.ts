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
): Promise<{ error: string } | { success: true; pending?: boolean }> {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { error: "Not authenticated" };

  if (currentUserId === targetUserId) {
    return { error: "Cannot follow yourself" };
  }

  const supabase = createAdminClient();

  // Check if target user exists and if they're private
  const { data: targetUser } = await supabase
    .from("users")
    .select("id, is_private")
    .eq("id", targetUserId)
    .single();

  if (!targetUser) return { error: "User not found" };

  // If target is private, create pending request; otherwise active
  const status = targetUser.is_private ? "pending" : "active";
  
  const { error } = await supabase.from("follows").insert({
    follower_id: currentUserId,
    following_id: targetUserId,
    status,
  });

  if (error) {
    if (error.code === "23505") {
      // Already following or pending
      return { success: true, pending: status === "pending" };
    }
    console.error("[followUser] Insert error:", error);
    return { error: "Failed to follow user" };
  }

  return { success: true, pending: status === "pending" };
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
  noStore();
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
    google_place_id: string;
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
      restaurant:restaurants!reviews_restaurant_id_fkey(id, google_place_id, name, city, photo_reference)
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

// ============================================
// FOLLOW REQUEST MANAGEMENT (Private Profiles)
// ============================================

export interface FollowRequest {
  id: string;
  follower_id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

// Get pending follow requests for current user
export async function getPendingFollowRequests(): Promise<{ requests: FollowRequest[]; total: number }> {
  noStore();
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { requests: [], total: 0 };

  const supabase = createAdminClient();

  const { data: follows, count } = await supabase
    .from("follows")
    .select("id, follower_id, created_at, follower:users!follows_follower_id_fkey(username, avatar_url, bio)", { count: "exact" })
    .eq("following_id", currentUserId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const requests: FollowRequest[] = (follows ?? []).map((f) => {
    const follower = Array.isArray(f.follower) ? f.follower[0] : f.follower;
    return {
      id: f.id,
      follower_id: f.follower_id,
      username: follower?.username ?? "",
      avatar_url: follower?.avatar_url ?? null,
      bio: follower?.bio ?? null,
      created_at: f.created_at,
    };
  });

  return { requests, total: count ?? 0 };
}

// Get count of pending requests (for badge)
export async function getPendingRequestCount(): Promise<number> {
  noStore();
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return 0;

  const supabase = createAdminClient();

  const { count } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", currentUserId)
    .eq("status", "pending");

  return count ?? 0;
}

// Accept a follow request
export async function acceptFollowRequest(
  followerId: string
): Promise<{ error?: string; success?: boolean }> {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("follows")
    .update({ status: "active" })
    .eq("follower_id", followerId)
    .eq("following_id", currentUserId)
    .eq("status", "pending");

  if (error) {
    console.error("[acceptFollowRequest] Error:", error);
    return { error: "Failed to accept request" };
  }

  return { success: true };
}

// Reject a follow request
export async function rejectFollowRequest(
  followerId: string
): Promise<{ error?: string; success?: boolean }> {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", currentUserId)
    .eq("status", "pending");

  if (error) {
    console.error("[rejectFollowRequest] Error:", error);
    return { error: "Failed to reject request" };
  }

  return { success: true };
}

// Remove an existing follower
export async function removeFollower(
  followerId: string
): Promise<{ error?: string; success?: boolean }> {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", currentUserId);

  if (error) {
    console.error("[removeFollower] Error:", error);
    return { error: "Failed to remove follower" };
  }

  return { success: true };
}

// Get follow status for multiple users (batch)
export async function getBatchFollowStatus(
  userIds: string[]
): Promise<Record<string, { isFollowing: boolean; isPending: boolean }>> {
  noStore();
  if (userIds.length === 0) return {};
  
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) {
    // Not logged in - return all false
    return userIds.reduce((acc, id) => {
      acc[id] = { isFollowing: false, isPending: false };
      return acc;
    }, {} as Record<string, { isFollowing: boolean; isPending: boolean }>);
  }

  const supabase = createAdminClient();

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id, status")
    .eq("follower_id", currentUserId)
    .in("following_id", userIds);

  const result: Record<string, { isFollowing: boolean; isPending: boolean }> = {};
  
  for (const userId of userIds) {
    const follow = follows?.find((f) => f.following_id === userId);
    result[userId] = {
      isFollowing: follow?.status === "active",
      isPending: follow?.status === "pending",
    };
  }

  return result;
}

// Cancel a pending follow request (as the requester)
export async function cancelFollowRequest(
  targetUserId: string
): Promise<{ error?: string; success?: boolean }> {
  const currentUserId = await getCurrentUserId();
  if (!currentUserId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", currentUserId)
    .eq("following_id", targetUserId)
    .eq("status", "pending");

  if (error) {
    console.error("[cancelFollowRequest] Error:", error);
    return { error: "Failed to cancel request" };
  }

  return { success: true };
}
