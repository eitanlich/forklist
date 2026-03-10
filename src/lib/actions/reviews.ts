"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewSchema, updateReviewSchema, type ReviewInput, type UpdateReviewInput } from "@/lib/validations/review";
import { getCurrentUserId } from "./user";

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
        // New fields
        instagram: parsed.data.restaurant_instagram ?? null,
        phone: parsed.data.restaurant_phone ?? null,
        price_level: parsed.data.restaurant_price_level ?? null,
        opening_hours: parsed.data.restaurant_opening_hours ?? null,
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
    meal_type: parsed.data.meal_type ?? null,
    visited_at: parsed.data.visited_at,
  });

  if (reviewError) return { error: "Failed to save review" };

  return { success: true };
}

export async function updateReview(
  reviewId: string,
  data: UpdateReviewInput
): Promise<{ error: string } | { success: true }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const parsed = updateReviewSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Validation error:", parsed.error.issues);
    return { error: "Invalid form data: " + parsed.error.issues.map(i => i.message).join(", ") };
  }

  const supabase = createAdminClient();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { error: "User not found" };

  // Verify review belongs to user
  const { data: review } = await supabase
    .from("reviews")
    .select("id, user_id")
    .eq("id", reviewId)
    .single();

  if (!review) return { error: "Review not found" };
  if (review.user_id !== user.id) return { error: "Not authorized" };

  // Update the review
  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      rating_overall: parsed.data.rating_overall,
      rating_food: parsed.data.rating_food,
      rating_service: parsed.data.rating_service,
      rating_ambiance: parsed.data.rating_ambiance,
      rating_price: parsed.data.rating_price,
      comment: parsed.data.comment ?? null,
      occasion: parsed.data.occasion ?? null,
      meal_type: parsed.data.meal_type ?? null,
      visited_at: parsed.data.visited_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (updateError) return { error: "Failed to update review" };

  return { success: true };
}

export async function deleteReview(
  reviewId: string
): Promise<{ error: string } | { success: true }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { error: "User not found" };

  // Verify review belongs to user
  const { data: review } = await supabase
    .from("reviews")
    .select("id, user_id")
    .eq("id", reviewId)
    .single();

  if (!review) return { error: "Review not found" };
  if (review.user_id !== user.id) return { error: "Not authorized" };

  // Delete the review
  const { error: deleteError } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (deleteError) return { error: "Failed to delete review" };

  return { success: true };
}

export async function getPublicReview(reviewId: string) {
  const supabase = createAdminClient();

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
      user:users (
        id,
        username,
        avatar_url,
        is_private
      ),
      restaurant:restaurants (
        id,
        name,
        address,
        city,
        photo_reference,
        cuisine_type,
        google_maps_url,
        website
      )
    `)
    .eq("id", reviewId)
    .single();

  if (!review) return null;

  // If user is private, check if viewer is owner or approved follower
  const user = review.user as any;
  if (user?.is_private) {
    const currentUserId = await getCurrentUserId();
    
    // Owner can always see their own reviews
    if (currentUserId === review.user_id) {
      return review;
    }
    
    // Check if current user is an approved follower
    if (currentUserId) {
      const { data: follow } = await supabase
        .from("follows")
        .select("status")
        .eq("follower_id", currentUserId)
        .eq("following_id", review.user_id)
        .eq("status", "active")
        .single();
      
      if (follow) {
        return review;
      }
    }
    
    // Not authorized to view
    return null;
  }

  return review;
}
