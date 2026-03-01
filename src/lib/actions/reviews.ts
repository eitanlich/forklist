"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewSchema, type ReviewInput } from "@/lib/validations/review";

export async function createReview(
  data: ReviewInput
): Promise<{ error: string } | { success: true }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const parsed = reviewSchema.safeParse(data);
  if (!parsed.success) return { error: "Invalid form data" };

  const supabase = createAdminClient();

  // Find user in Supabase. If missing (webhook not yet configured), create on the fly.
  let { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return { error: "Not authenticated" };

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({ clerk_id: clerkId, email, username: clerkUser.username ?? null })
      .select("id")
      .single();

    if (createError || !newUser) return { error: "Failed to create user profile" };
    user = newUser;
  }

  // Upsert restaurant — insert if new, update metadata if it already exists
  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .upsert(
      {
        google_place_id: parsed.data.google_place_id,
        name: parsed.data.restaurant_name,
        address: parsed.data.restaurant_address ?? null,
        city: parsed.data.restaurant_city ?? null,
        lat: parsed.data.restaurant_lat ?? null,
        lng: parsed.data.restaurant_lng ?? null,
        photo_reference: parsed.data.restaurant_photo_reference ?? null,
        cuisine_type: parsed.data.restaurant_cuisine_type ?? null,
        website: parsed.data.restaurant_website ?? null,
        google_maps_url: parsed.data.restaurant_google_maps_url ?? null,
      },
      { onConflict: "google_place_id" }
    )
    .select("id")
    .single();

  if (restaurantError || !restaurant)
    return { error: "Failed to save restaurant" };

  // Insert the review
  const { error: reviewError } = await supabase.from("reviews").insert({
    user_id: user.id,
    restaurant_id: restaurant.id,
    rating_overall: parsed.data.rating_overall,
    rating_food: parsed.data.rating_food,
    rating_service: parsed.data.rating_service,
    rating_ambiance: parsed.data.rating_ambiance,
    rating_price: parsed.data.rating_price,
    comment: parsed.data.comment ?? null,
    occasion: parsed.data.occasion ?? null,
    visited_at: parsed.data.visited_at,
  });

  if (reviewError) return { error: "Failed to save review" };

  return { success: true };
}
