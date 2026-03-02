import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import HomeContent from "./HomeContent";

// Don't cache this page - always fetch fresh data
export const dynamic = "force-dynamic";

interface UserStats {
  totalReviews: number;
  uniqueRestaurants: number;
  avgRating: number | null;
  topOccasion: string | null;
  topCuisine: string | null;
}

async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = createAdminClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating_overall, occasion, restaurant_id, restaurant:restaurants(cuisine_type)")
    .eq("user_id", userId);

  if (!reviews || reviews.length === 0) {
    return {
      totalReviews: 0,
      uniqueRestaurants: 0,
      avgRating: null,
      topOccasion: null,
      topCuisine: null,
    };
  }

  const totalReviews = reviews.length;
  const uniqueRestaurantIds = new Set(reviews.map((r) => r.restaurant_id));
  const uniqueRestaurants = uniqueRestaurantIds.size;
  const avgRating = reviews.reduce((sum, r) => sum + r.rating_overall, 0) / totalReviews;

  const occasionCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    if (r.occasion) {
      occasionCounts[r.occasion] = (occasionCounts[r.occasion] || 0) + 1;
    }
  });
  const topOccasion = Object.entries(occasionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const cuisineCounts: Record<string, number> = {};
  reviews.forEach((r) => {
    const restaurant = Array.isArray(r.restaurant) ? r.restaurant[0] : r.restaurant;
    const cuisine = (restaurant as { cuisine_type: string | null } | null)?.cuisine_type;
    if (cuisine) {
      cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
    }
  });
  const topCuisine = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { totalReviews, uniqueRestaurants, avgRating, topOccasion, topCuisine };
}

export default async function HomePage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  const supabase = createAdminClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId!)
    .single();

  const stats = dbUser
    ? await getUserStats(dbUser.id)
    : { totalReviews: 0, uniqueRestaurants: 0, avgRating: null, topOccasion: null, topCuisine: null };

  return <HomeContent firstName={firstName} stats={stats} />;
}
