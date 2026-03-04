"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface SearchUser {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export async function searchUsers(
  query: string,
  limit = 20
): Promise<{ users: SearchUser[]; error?: string }> {
  if (!query || query.trim().length < 2) {
    return { users: [] };
  }

  const supabase = createAdminClient();
  const searchTerm = query.trim().toLowerCase();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, bio, avatar_url, is_private")
    .not("username", "is", null)
    .eq("is_private", false) // Only show public profiles
    .ilike("username", `%${searchTerm}%`)
    .limit(limit);

  if (error) {
    return { users: [], error: "Failed to search users" };
  }

  return { users: users ?? [] };
}
