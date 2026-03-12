import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { OnboardingFlow } from "./OnboardingFlow";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const supabase = createAdminClient();
  
  // Check if user already has username (completed onboarding)
  const { data: user } = await supabase
    .from("users")
    .select("username")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  // If user has username, they've completed onboarding
  if (user?.username) {
    redirect("/home");
  }

  return <OnboardingFlow />;
}
