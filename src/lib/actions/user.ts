"use server";

import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Get current user's Supabase ID with auto-sync fallback.
 * If the user exists in Clerk but not in Supabase (webhook failed),
 * this will automatically create the user record.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const supabase = createAdminClient();
  
  // Try to find existing user
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();

  if (user?.id) return user.id;

  // User not found - webhook probably failed. Try to sync from Clerk.
  console.log("[getCurrentUserId] User not in DB, attempting auto-sync for:", clerkId);
  
  try {
    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    let clerkUser;
    try {
      clerkUser = await client.users.getUser(clerkId);
    } catch (clerkErr: unknown) {
      // User doesn't exist in Clerk either - account was fully deleted
      // Return null so the app can redirect to sign-out
      console.log("[getCurrentUserId] User not found in Clerk either, likely deleted account");
      return null;
    }
    
    if (clerkUser) {
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      // Generate username from Clerk or email prefix
      let username = clerkUser.username;
      if (!username && email) {
        // Use email prefix as username (e.g., "john" from "john@example.com")
        username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9._-]/g, "");
      }
      
      const { data: newUser, error } = await supabase
        .from("users")
        .insert({
          clerk_id: clerkId,
          email,
          username: username || `user_${Date.now()}`, // Fallback to unique id
        })
        .select("id")
        .single();
      
      if (error) {
        // Maybe race condition - try to fetch again
        if (error.code === "23505") {
          const { data: existingUser } = await supabase
            .from("users")
            .select("id")
            .eq("clerk_id", clerkId)
            .single();
          return existingUser?.id ?? null;
        }
        console.error("[getCurrentUserId] Failed to auto-sync user:", error);
        return null;
      }
      
      console.log("[getCurrentUserId] Auto-synced user:", newUser?.id);
      return newUser?.id ?? null;
    }
  } catch (err) {
    console.error("[getCurrentUserId] Error during auto-sync:", err);
  }

  return null;
}

/**
 * Get current user's full Supabase record with auto-sync fallback.
 */
export async function getCurrentUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const supabase = createAdminClient();
  
  // Try to find existing user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (user) return user;

  // Auto-sync and return
  const userId = await getCurrentUserId();
  if (!userId) return null;
  
  const { data: newUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  
  return newUser;
}
