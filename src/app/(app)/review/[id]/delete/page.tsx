import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import DeleteReviewForm from "./DeleteReviewForm";
import type { ReviewWithRestaurant } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DeleteReviewPage({ params }: PageProps) {
  const { id } = await params;
  const { userId: clerkId } = await auth();

  if (!clerkId) redirect("/sign-in");

  const supabase = createAdminClient();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) redirect("/sign-in");

  // Get review with restaurant
  const { data: review } = await supabase
    .from("reviews")
    .select("*, restaurant:restaurants(*)")
    .eq("id", id)
    .single();

  if (!review) notFound();
  if (review.user_id !== user.id) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">Delete Review</h1>
      <DeleteReviewForm review={review as ReviewWithRestaurant} />
    </div>
  );
}
