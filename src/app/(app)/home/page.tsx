import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import HomeContent from "./HomeContent";

export const dynamic = "force-dynamic";

interface ChecklistData {
  followingCount: number;
  hasReviews: boolean;
  hasLists: boolean;
  hasShared: boolean;
  lastReviewId: string | null;
  lastRestaurantName: string | null;
  isNewUser: boolean;
}

async function getHomeData(clerkId: string): Promise<ChecklistData> {
  const supabase = createAdminClient();
  
  // Get user with all needed data
  const { data: dbUser } = await supabase
    .from("users")
    .select("id, first_share_at, onboarding_completed")
    .eq("clerk_id", clerkId)
    .single();

  if (!dbUser) {
    return {
      followingCount: 0,
      hasReviews: false,
      hasLists: false,
      hasShared: false,
      lastReviewId: null,
      lastRestaurantName: null,
      isNewUser: true,
    };
  }

  // Get counts in parallel
  const [followsResult, reviewsResult, listsResult, lastReviewResult] = await Promise.all([
    supabase
      .from("follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", dbUser.id)
      .eq("status", "active"),
    supabase
      .from("reviews")
      .select("*", { count: "exact", head: true })
      .eq("user_id", dbUser.id),
    supabase
      .from("lists")
      .select("*", { count: "exact", head: true })
      .eq("user_id", dbUser.id),
    supabase
      .from("reviews")
      .select("id, restaurant:restaurants!reviews_restaurant_id_fkey(name)")
      .eq("user_id", dbUser.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const lastReview = lastReviewResult.data as { id: string; restaurant: { name: string } | null } | null;

  return {
    followingCount: followsResult.count ?? 0,
    hasReviews: (reviewsResult.count ?? 0) > 0,
    hasLists: (listsResult.count ?? 0) > 0,
    hasShared: !!dbUser.first_share_at,
    lastReviewId: lastReview?.id ?? null,
    lastRestaurantName: lastReview?.restaurant?.name ?? null,
    isNewUser: !dbUser.onboarding_completed,
  };
}

export default async function HomePage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  const homeData = clerkId ? await getHomeData(clerkId) : {
    followingCount: 0,
    hasReviews: false,
    hasLists: false,
    hasShared: false,
    lastReviewId: null,
    lastRestaurantName: null,
    isNewUser: true,
  };

  return (
    <HomeContent 
      firstName={firstName} 
      followingCount={homeData.followingCount}
      checklistData={homeData}
    />
  );
}
