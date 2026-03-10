import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ users: [] });
  }

  const supabase = createAdminClient();
  const searchTerm = query.trim().toLowerCase();

  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, bio, avatar_url, is_private")
    .or(`username.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order("username")
    .limit(20);

  if (error) {
    return NextResponse.json({ users: [] });
  }

  return NextResponse.json({ users: users ?? [] });
}
