"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

// Username validation
const USERNAME_REGEX = /^[a-z0-9._]{3,20}$/;

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

  const { userId: clerkId } = await auth();
  if (!clerkId) return { available: false, error: "Not authenticated" };
  
  const supabase = createAdminClient();
  
  // First, get the current user's ID
  const { data: currentUser } = await supabase
    .from("users")
    .select("id, username")
    .eq("clerk_id", clerkId)
    .maybeSingle();
  
  // If this is the user's current username, it's available
  console.log("[checkUsername] currentUser:", currentUser?.username, "normalized:", normalized, "match:", currentUser?.username === normalized);
  if (currentUser?.username === normalized) {
    return { available: true };
  }
  
  // Check if username exists for someone else
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", normalized)
    .maybeSingle();

  // If no one has this username, it's available
  if (!existingUser) return { available: true };
  
  // If someone else has it, or it exists but isn't ours
  if (currentUser && existingUser.id !== currentUser.id) {
    return { available: false };
  }
  
  // Edge case: existingUser.id === currentUser.id means it's ours
  return { available: true };
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
}): Promise<{ error?: string; success?: boolean; approvedCount?: number }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  // Validate bio length
  if (data.bio && data.bio.length > 160) {
    return { error: "Bio must be 160 characters or less" };
  }

  // Get current user to check if switching from private to public
  const { data: currentUser } = await supabase
    .from("users")
    .select("id, is_private")
    .eq("clerk_id", clerkId)
    .single();

  if (!currentUser) return { error: "User not found" };

  const { error } = await supabase
    .from("users")
    .update({
      bio: data.bio ?? null,
      is_private: data.is_private ?? false,
    })
    .eq("clerk_id", clerkId);

  if (error) return { error: "Failed to update profile" };

  // Auto-approve pending follow requests when switching from private to public
  let approvedCount = 0;
  if (currentUser.is_private && data.is_private === false) {
    const { data: approved, error: approveError } = await supabase
      .from("follows")
      .update({ status: "active" })
      .eq("following_id", currentUser.id)
      .eq("status", "pending")
      .select("id");

    if (!approveError && approved) {
      approvedCount = approved.length;
    }
  }

  revalidatePath("/settings/profile");
  return { success: true, approvedCount };
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
  const filePath = fileName;

  // Upload to Supabase Storage
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage
    .from("avatars")
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
    .from("avatars")
    .getPublicUrl(filePath);

  const avatarUrl = urlData.publicUrl;

  // Delete old avatar if exists
  if (user.avatar_url) {
    // Extract filename from URL like .../avatars/uuid-timestamp.jpg
    const oldPath = user.avatar_url.split("/avatars/")[1];
    if (oldPath) {
      await supabase.storage.from("avatars").remove([oldPath]);
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

export async function removeAvatar(): Promise<{ error?: string; success?: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("id, avatar_url")
    .eq("clerk_id", clerkId)
    .single();

  if (!user) return { error: "User not found" };
  if (!user.avatar_url) return { success: true }; // Already no avatar

  // Delete from storage
  const oldPath = user.avatar_url.split("/avatars/")[1];
  if (oldPath) {
    await supabase.storage.from("avatars").remove([oldPath]);
  }

  // Clear avatar_url in DB
  const { error: updateError } = await supabase
    .from("users")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (updateError) return { error: "Failed to remove avatar" };

  revalidatePath("/settings/profile");
  return { success: true };
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

export async function deleteAccount(): Promise<{ error?: string; success?: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  // Best practice: Delete from Clerk FIRST
  // The user.deleted webhook will handle Supabase cleanup
  // This ensures we never have orphaned Clerk sessions
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    await client.users.deleteUser(clerkId);
  } catch (err) {
    console.error("Error deleting from Clerk:", err);
    return { error: "Failed to delete account" };
  }

  // Backup: Also delete from Supabase directly in case webhook is slow/fails
  // This is idempotent - webhook will just find nothing to delete
  const supabase = createAdminClient();
  
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (user) {
    // Delete all user data
    await supabase.from("reviews").delete().eq("user_id", user.id);
    await supabase.from("lists").delete().eq("user_id", user.id);
    await supabase.from("follows").delete().eq("follower_id", user.id);
    await supabase.from("follows").delete().eq("following_id", user.id);
    await supabase.from("likes").delete().eq("user_id", user.id);
    await supabase.from("notifications").delete().eq("user_id", user.id);
    await supabase.from("notifications").delete().eq("actor_id", user.id);
    await supabase.from("review_comments").delete().eq("user_id", user.id);
    await supabase.from("users").delete().eq("id", user.id);
  }

  return { success: true };
}

export type ProfileResult = 
  | { status: "not_found" }
  | { status: "private"; username: string }
  | { status: "public"; profile: PublicProfile };

interface PublicProfile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  is_private: boolean;
  follower_count: number;
  following_count: number;
  reviews: any[];
}

export async function getPublicProfile(
  username: string,
  currentUserId?: string | null
): Promise<ProfileResult> {
  noStore();
  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, username, bio, avatar_url, is_private, follower_count, following_count")
    .eq("username", username.toLowerCase())
    .single();

  if (!user) return { status: "not_found" };
  
  // Allow owner to view their own private profile
  const isOwner = currentUserId && currentUserId === user.id;
  
  // Check if current user is an approved follower
  let isApprovedFollower = false;
  if (user.is_private && !isOwner && currentUserId) {
    const { data: followRecord } = await supabase
      .from("follows")
      .select("status")
      .eq("follower_id", currentUserId)
      .eq("following_id", user.id)
      .eq("status", "active")
      .single();
    isApprovedFollower = !!followRecord;
  }
  
  if (user.is_private && !isOwner && !isApprovedFollower) {
    return { status: "private", username: user.username };
  }

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
    status: "public",
    profile: {
      ...user,
      reviews: reviews ?? [],
    },
  };
}

export async function completeOnboarding(): Promise<{ error?: string; success?: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return { error: "Not authenticated" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("users")
    .update({ onboarding_completed: true })
    .eq("clerk_id", clerkId);

  if (error) {
    console.error("Error completing onboarding:", error);
    return { error: "Failed to complete onboarding" };
  }

  return { success: true };
}

export async function markFirstShare(): Promise<{ success?: boolean }> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return {};

  const supabase = createAdminClient();

  // Only update if first_share_at is null
  await supabase
    .from("users")
    .update({ first_share_at: new Date().toISOString() })
    .eq("clerk_id", clerkId)
    .is("first_share_at", null);

  return { success: true };
}
