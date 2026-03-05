"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export interface SearchUser {
  id: string;
  username: string | null;
  email: string | null;
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
  
  // Check if query looks like an email
  const isEmailSearch = searchTerm.includes("@");

  let users: any[] = [];

  if (isEmailSearch) {
    // Search by exact email match (for finding friends)
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, bio, avatar_url, is_private")
      .eq("is_private", false)
      .ilike("email", searchTerm)
      .limit(limit);

    if (error) {
      return { users: [], error: "Failed to search users" };
    }
    users = data ?? [];
  } else {
    // Search by username
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, bio, avatar_url, is_private")
      .eq("is_private", false)
      .ilike("username", `%${searchTerm}%`)
      .limit(limit);

    if (error) {
      return { users: [], error: "Failed to search users" };
    }
    users = data ?? [];
  }

  // Return users, masking email for privacy (only show first part)
  return {
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email ? maskEmail(u.email) : null,
      bio: u.bio,
      avatar_url: u.avatar_url,
    })),
  };
}

// Mask email for privacy: "john.doe@gmail.com" -> "joh***@gmail.com"
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  
  const visibleChars = Math.min(3, local.length);
  const masked = local.slice(0, visibleChars) + "***";
  return `${masked}@${domain}`;
}
