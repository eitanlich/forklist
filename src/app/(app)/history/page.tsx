import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ReviewWithRestaurant } from "@/types";
import HistoryContent from "./HistoryContent";

// Don't cache this page - always fetch fresh data
export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const { userId: clerkId } = await auth();

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId!)
    .single();

  const reviews: ReviewWithRestaurant[] = [];

  if (user) {
    const { data } = await supabase
      .from("reviews")
      .select("*, restaurant:restaurants(*)")
      .eq("user_id", user.id)
      .order("visited_at", { ascending: false });

    if (data) reviews.push(...(data as ReviewWithRestaurant[]));
  }

  return <HistoryContent reviews={reviews} />;
}
