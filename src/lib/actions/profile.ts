"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

// Username validation
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export async function checkUsernameAvailable(
  username: string
): Promise<{ available: boolean; error?: string }> {
  if (!username) return { available: false, error: "Username is required" };
  
  const normalized = username.toLowerCase().trim();
  
  if (!USERNAME_REGEX.test(normalized)) {
    return { 
      available: false, 
      error: "Username must be 3-20 characters, lowercase letters, numbers, and underscores only" 
    };
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("users")
    .select("id")
    .eq("username", normalized)
    .single();

  return { available: !data };
}

export async function claimUsername(
  username: string
): Promise<{ error?: string; success?: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const normalized = username.toLowerCase().trim();
  
  if (!USERNAME_REGEX.test(normalized)) {
    return { 
      error: "Username must be 3-20 characters, lowercase letters, numbers, and underscores only" 
    };
  }

  const supabase = createAdminClient();

  // Check if username is taken
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", normalized)
    .single();

  if (existing) return { error: "Username is already taken" };

  // Find or create user
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
      .insert({ clerk_id: clerkId, email, username: normalized })
      .select("id")
      .single();

    if (createError) return { error: "Failed to create profile" };
    user = newUser;
  } else {
    // Update existing user
    const { error: updateError } = await supabase
      .from("users")
      .update({ username: normalized })
      .eq("clerk_id", clerkId);

    if (updateError) return { error: "Failed to save username" };
  }

  revalidatePath("/settings/profile");
  return { success: true };
}

export async function updateProfile(data: {
  bio?: string;
  is_private?: boolean;
}): Promise<{ error?: string; success?: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  // Validate bio length
  if (data.bio && data.bio.length > 160) {
    return { error: "Bio must be 160 characters or less" };
  }

  const { error } = await supabase
    .from("users")
    .update({
      bio: data.bio ?? null,
      is_private: data.is_private ?? false,
    })
    .eq("clerk_id", clerkId);

  if (error) return { error: "Failed to update profile" };

  revalidatePath("/settings/profile");
  return { success: true };
}

export async function uploadAvatar(
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const file = formData.get("avatar") as File | null;
  if (!file) return { error: "No file provided" };

  // Validate file type
  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image" };
  }

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return { error: "Image must be less than 2MB" };
  }

  const supabase = createAdminClient();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id, avatar_url")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { error: "User not found" };

  // Generate unique filename
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${user.id}-${Date.now()}.${ext}`;
  const filePath = `avatars/${fileName}`;

  // Upload to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("public")
    .upload(filePath, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    return { error: "Failed to upload image" };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("public")
    .getPublicUrl(filePath);

  const avatarUrl = urlData.publicUrl;

  // Delete old avatar if exists
  if (user.avatar_url) {
    const oldPath = user.avatar_url.split("/public/public/")[1];
    if (oldPath) {
      await supabase.storage.from("public").remove([oldPath]);
    }
  }

  // Update user record
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) return { error: "Failed to save avatar" };

  revalidatePath("/settings/profile");
  return { url: avatarUrl };
}

export async function getCurrentUserProfile() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, username, bio, avatar_url, is_private, follower_count, following_count")
    .eq("clerk_id", clerkId)
    .single();

  return user;
}

export async function getPublicProfile(username: string) {
  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, username, bio, avatar_url, is_private, follower_count, following_count")
    .eq("username", username.toLowerCase())
    .single();

  if (!user || user.is_private) return null;

  // Get public reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
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
        photo_reference,
        cuisine_type,
        google_maps_url
      )
    `)
    .eq("user_id", user.id)
    .order("visited_at", { ascending: false })
    .limit(50);

  return {
    ...user,
    reviews: reviews ?? [],
  };
}
