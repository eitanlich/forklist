import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUserId } from "@/lib/actions/user";

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");
  if (!placeId) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const currentUserId = await getCurrentUserId();

  // Find restaurant by google_place_id
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("google_place_id", placeId)
    .single();

  if (!restaurant) {
    // No restaurant in our DB = no reviews
    return NextResponse.json({ reviews: [], avgRating: null });
  }

  // Get reviews with user privacy info
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
      rating_overall,
      comment,
      visited_at,
      user_id,
      user:users!reviews_user_id_fkey (
        id,
        username,
        avatar_url,
        is_private
      )
    `)
    .eq("restaurant_id", restaurant.id)
    .order("visited_at", { ascending: false });

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ reviews: [], avgRating: null });
  }

  // Get approved follows for current user (to see private users' reviews)
  let approvedFollowingIds = new Set<string>();
  if (currentUserId) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", currentUserId)
      .eq("status", "active");
    
    if (follows) {
      approvedFollowingIds = new Set(follows.map(f => f.following_id));
    }
  }

  // Filter out private users' reviews unless viewer is owner or approved follower
  const visibleReviews = reviews.filter((r) => {
    const user = Array.isArray(r.user) ? r.user[0] : r.user;
    if (!user?.is_private) return true; // Public user, always visible
    if (currentUserId === r.user_id) return true; // Own review
    if (approvedFollowingIds.has(r.user_id)) return true; // Approved follower
    return false; // Private user, not authorized
  });

  if (visibleReviews.length === 0) {
    return NextResponse.json({ reviews: [], avgRating: null });
  }

  // Get like counts
  const reviewIds = visibleReviews.map((r) => r.id);
  const { data: likes } = await supabase
    .from("likes")
    .select("review_id")
    .in("review_id", reviewIds);

  const likeCounts: Record<string, number> = {};
  if (likes) {
    for (const like of likes) {
      likeCounts[like.review_id] = (likeCounts[like.review_id] ?? 0) + 1;
    }
  }

  // Get current user's likes
  let userLikes = new Set<string>();
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

  // Format reviews (only visible ones)
  const formattedReviews = visibleReviews.map((r) => ({
    id: r.id,
    rating_overall: r.rating_overall,
    comment: r.comment,
    visited_at: r.visited_at,
    user: Array.isArray(r.user) ? r.user[0] : r.user,
    like_count: likeCounts[r.id] ?? 0,
    liked_by_me: userLikes.has(r.id),
  }));

  // Calculate average rating
  const ratings = formattedReviews.map((r) => r.rating_overall);
  const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

  return NextResponse.json({
    reviews: formattedReviews,
    avgRating,
  });
}
