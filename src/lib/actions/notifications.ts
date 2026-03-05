"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "./user";
import { unstable_noStore as noStore } from "next/cache";

export interface LikeNotification {
  id: string;
  type: "like";
  createdAt: string;
  review: {
    id: string;
    placeName: string;
  };
  user: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
  };
}

export interface FollowNotification {
  id: string;
  type: "follow";
  createdAt: string;
  user: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
  };
}

export type ActivityNotification = LikeNotification | FollowNotification;

export async function getActivityNotifications(limit = 50): Promise<{
  notifications: ActivityNotification[];
  error?: string;
}> {
  noStore();
  
  const userId = await getCurrentUserId();
  if (!userId) {
    return { notifications: [], error: "Not authenticated" };
  }

  const supabase = createServerClient();

  // Get recent likes on user's reviews
  const { data: likes, error: likesError } = await supabase
    .from("likes")
    .select(`
      id,
      created_at,
      user_id,
      review_id,
      reviews!inner (
        id,
        user_id,
        places (
          name
        )
      ),
      users!likes_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq("reviews.user_id", userId)
    .neq("user_id", userId) // Exclude self-likes
    .order("created_at", { ascending: false })
    .limit(limit);

  if (likesError) {
    console.error("Error fetching likes:", likesError);
    return { notifications: [], error: likesError.message };
  }

  // Get recent new followers
  const { data: follows, error: followsError } = await supabase
    .from("follows")
    .select(`
      id,
      created_at,
      follower_id,
      users!follows_follower_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq("following_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (followsError) {
    console.error("Error fetching follows:", followsError);
    return { notifications: [], error: followsError.message };
  }

  // Transform and combine
  const likeNotifications: LikeNotification[] = (likes || []).map((like: any) => ({
    id: `like-${like.id}`,
    type: "like" as const,
    createdAt: like.created_at,
    review: {
      id: like.review_id,
      placeName: like.reviews?.places?.name || "Unknown place",
    },
    user: {
      id: like.users?.id || like.user_id,
      username: like.users?.username || null,
      avatarUrl: like.users?.avatar_url || null,
    },
  }));

  const followNotifications: FollowNotification[] = (follows || []).map((follow: any) => ({
    id: `follow-${follow.id}`,
    type: "follow" as const,
    createdAt: follow.created_at,
    user: {
      id: follow.users?.id || follow.follower_id,
      username: follow.users?.username || null,
      avatarUrl: follow.users?.avatar_url || null,
    },
  }));

  // Combine and sort by date
  const notifications: ActivityNotification[] = [
    ...likeNotifications,
    ...followNotifications,
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { notifications: notifications.slice(0, limit) };
}

export async function getNotificationCounts(): Promise<{
  totalCount: number;
  requestsCount: number;
}> {
  noStore();
  
  const userId = await getCurrentUserId();
  if (!userId) {
    return { totalCount: 0, requestsCount: 0 };
  }

  const supabase = createServerClient();

  // Get pending follow requests count
  const { count: requestsCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId)
    .eq("status", "pending");

  // Get user's last seen timestamp (column may not exist yet)
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("last_notifications_seen_at")
    .eq("id", userId)
    .single();

  // If column doesn't exist or no data, use epoch
  const lastSeen = (!userError && user?.last_notifications_seen_at) 
    ? user.last_notifications_seen_at 
    : "1970-01-01T00:00:00Z";

  // Count new likes since last seen
  const { count: newLikesCount } = await supabase
    .from("likes")
    .select("id, reviews!inner(user_id)", { count: "exact", head: true })
    .eq("reviews.user_id", userId)
    .neq("user_id", userId)
    .gt("created_at", lastSeen);

  // Count new followers since last seen
  const { count: newFollowersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", userId)
    .eq("status", "active")
    .gt("created_at", lastSeen);

  const activityCount = (newLikesCount || 0) + (newFollowersCount || 0);
  const totalCount = activityCount + (requestsCount || 0);

  return {
    totalCount,
    requestsCount: requestsCount || 0,
  };
}

export async function markNotificationsAsSeen(): Promise<{ success: boolean }> {
  noStore();
  
  const userId = await getCurrentUserId();
  if (!userId) return { success: false };

  const supabase = createServerClient();
  
  // Try to update - will fail silently if column doesn't exist
  const { error } = await supabase
    .from("users")
    .update({ last_notifications_seen_at: new Date().toISOString() })
    .eq("id", userId);

  return { success: !error };
}
