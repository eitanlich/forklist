import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { OnboardingFlow } from "./OnboardingFlow";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const supabase = createAdminClient();
  
  // Check if user already completed onboarding
  const { data: user } = await supabase
    .from("users")
    .select("onboarding_completed, username")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  // If user completed onboarding, go to home
  if (user?.onboarding_completed) {
    redirect("/home");
  }

  return <OnboardingFlow initialUsername={user?.username} />;
}
