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

  // Get reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
      rating_overall,
      comment,
      visited_at,
      user:users!reviews_user_id_fkey (
        id,
        username,
        avatar_url
      )
    `)
    .eq("restaurant_id", restaurant.id)
    .order("visited_at", { ascending: false });

  if (!reviews || reviews.length === 0) {
    return NextResponse.json({ reviews: [], avgRating: null });
  }

  // Get like counts
  const reviewIds = reviews.map((r) => r.id);
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

  // Format reviews
  const formattedReviews = reviews.map((r) => ({
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
