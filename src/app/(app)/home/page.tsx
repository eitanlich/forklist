import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import HomeContent from "./HomeContent";

export const dynamic = "force-dynamic";

interface UserStats {
  totalReviews: number;
  uniqueRestaurants: number;
  avgRating: number | null;
}

async function getUserData(clerkId: string) {
  const supabase = createAdminClient();
  
  // Get user
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!dbUser) {
    return { 
      userId: null, 
      followingCount: 0, 
      stats: { totalReviews: 0, uniqueRestaurants: 0, avgRating: null } 
    };
  }

  // Get following count
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", dbUser.id)
    .eq("status", "active");

  // Get user stats
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating_overall, restaurant_id")
    .eq("user_id", dbUser.id);

  const totalReviews = reviews?.length ?? 0;
  const uniqueRestaurants = new Set(reviews?.map((r) => r.restaurant_id)).size;
  const avgRating = totalReviews > 0
    ? reviews!.reduce((sum, r) => sum + r.rating_overall, 0) / totalReviews
    : null;

  return {
    userId: dbUser.id,
    followingCount: followingCount ?? 0,
    stats: { totalReviews, uniqueRestaurants, avgRating },
  };
}

export default async function HomePage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  const { userId, followingCount, stats } = clerkId 
    ? await getUserData(clerkId)
    : { userId: null, followingCount: 0, stats: { totalReviews: 0, uniqueRestaurants: 0, avgRating: null } };

  return (
    <HomeContent 
      firstName={firstName} 
      stats={stats}
      followingCount={followingCount}
    />
  );
}
