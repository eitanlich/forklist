import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Get ForkList ratings for multiple restaurants by google_place_id
export async function POST(req: NextRequest) {
  const { placeIds } = await req.json();
  
  if (!placeIds || !Array.isArray(placeIds) || placeIds.length === 0) {
    return NextResponse.json({ ratings: {} });
  }

  const supabase = createAdminClient();

  // Get restaurants with their reviews
  const { data: restaurants } = await supabase
    .from("restaurants")
    .select(`
      google_place_id,
      reviews (
        rating_overall
      )
    `)
    .in("google_place_id", placeIds);

  if (!restaurants) {
    return NextResponse.json({ ratings: {} });
  }

  // Calculate average rating for each restaurant
  const ratings: Record<string, { avg: number; count: number }> = {};
  
  for (const r of restaurants) {
    const reviews = r.reviews as { rating_overall: number }[] | null;
    if (reviews && reviews.length > 0) {
      const sum = reviews.reduce((acc, review) => acc + review.rating_overall, 0);
      ratings[r.google_place_id] = {
        avg: Math.round((sum / reviews.length) * 10) / 10, // Round to 1 decimal
        count: reviews.length,
      };
    }
  }

  return NextResponse.json({ ratings });
}
