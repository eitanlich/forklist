import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "all";

  const supabase = createAdminClient();

  // Calculate date filter based on period
  let dateFilter: string | null = null;
  const now = new Date();
  
  if (period === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    dateFilter = monthStart.toISOString();
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    
    if (review.cuisine_type) {
      cuisineCounts[review.cuisine_type] = (cuisineCounts[review.cuisine_type] || 0) + 1;
    }
    
    if (review.occasion) {
      occasionCounts[review.occasion] = (occasionCounts[review.occasion] || 0) + 1;
    }
  }

  const topCuisine = Object.entries(cuisineCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  
  const topOccasion = Object.entries(occasionCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  // Get total likes
  const reviewIds = (reviews ?? []).map((r) => r.id);
  let totalLikes = 0;
  
  if (reviewIds.length > 0) {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .in("review_id", reviewIds);
    totalLikes = count ?? 0;
  }

  const reviewCount = reviews?.length ?? 0;

  return NextResponse.json({
    totalReviews: reviewCount,
    totalRestaurants: restaurantIds.size,
    averageRating: reviewCount ? Math.round((totalRating / reviewCount) * 10) / 10 : 0,
    topCuisine,
    topOccasion,
    totalLikesReceived: totalLikes,
    totalCities: cities.size,
  });
}
