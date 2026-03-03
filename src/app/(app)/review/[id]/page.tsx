import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReviewDetailContent } from "./ReviewDetailContent";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  
  const { data: review } = await supabase
    .from("reviews")
    .select("restaurant:restaurants(name)")
    .eq("id", id)
    .single();

  const restaurant = review?.restaurant as { name: string } | { name: string }[] | null;
  const restaurantName = Array.isArray(restaurant) 
    ? restaurant[0]?.name 
    : restaurant?.name;

  return {
    title: restaurantName ? `${restaurantName} - Review` : "Review",
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const { userId: clerkId } = await auth();
  
  if (!clerkId) redirect("/sign-in");

  const supabase = createAdminClient();

  // Get current user
  const { data: currentUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!currentUser) redirect("/sign-in");

  // Get review with full details
  const { data: review } = await supabase
    .from("reviews")
    .select(`
      id,
      user_id,
      rating_overall,
      rating_food,
      rating_service,
      rating_ambiance,
      rating_price,
      comment,
      occasion,
      meal_type,
      visited_at,
      created_at,
      restaurant:restaurants (
        id,
        name,
        address,
        city,
        country,
        photo_reference,
        cuisine_type,
        google_maps_url,
        website
      )
    `)
    .eq("id", id)
    .single();

  if (!review) notFound();

  const isOwner = review.user_id === currentUser.id;

  return (
    <ReviewDetailContent 
      review={review} 
      isOwner={isOwner} 
    />
  );
}
