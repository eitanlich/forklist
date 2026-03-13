import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  
  // Get restaurants with most reviews in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: trending, error } = await supabase
    .from("reviews")
    .select(`
      restaurant_id,
      restaurants (
        id,
        name,
        google_place_id,
        city,
        photo_reference
      )
    `)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aggregate by restaurant and count reviews + calculate avg rating
  const restaurantMap = new Map<string, {
    id: string;
    name: string;
    placeId: string;
    city: string | null;
    photoReference: string | null;
    reviewCount: number;
  }>();

  for (const review of trending || []) {
    const r = review.restaurants as any;
    if (!r) continue;
    
    const existing = restaurantMap.get(r.id);
    if (existing) {
      existing.reviewCount++;
    } else {
      restaurantMap.set(r.id, {
        id: r.id,
        name: r.name,
        placeId: r.google_place_id,
        city: r.city,
        photoReference: r.photo_reference,
        reviewCount: 1,
      });
    }
  }

  // Sort by review count and take top 20
  const sorted = Array.from(restaurantMap.values())
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 20);

  return NextResponse.json({ restaurants: sorted });
}
