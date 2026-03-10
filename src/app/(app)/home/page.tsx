import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import HomeContent from "./HomeContent";

export const dynamic = "force-dynamic";

async function getFollowingCount(clerkId: string) {
  const supabase = createAdminClient();
  
  // Get user
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!dbUser) {
    return 0;
  }

  // Get following count
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", dbUser.id)
    .eq("status", "active");

  return followingCount ?? 0;
}

export default async function HomePage() {
  const { userId: clerkId } = await auth();
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  const followingCount = clerkId ? await getFollowingCount(clerkId) : 0;

  return (
    <HomeContent 
      firstName={firstName} 
      followingCount={followingCount}
    />
  );
}
