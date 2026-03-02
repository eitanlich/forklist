import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      google_place_id,
      name,
      address,
      city,
      lat,
      lng,
      photo_reference,
      cuisine_type,
      website,
      google_maps_url,
    } = body;

    if (!google_place_id || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: restaurant, error } = await supabase
      .from("restaurants")
      .upsert(
        {
          google_place_id,
          name,
          address: address ?? null,
          city: city ?? null,
          lat: lat ?? null,
          lng: lng ?? null,
          photo_reference: photo_reference ?? null,
          cuisine_type: cuisine_type ?? null,
          website: website ?? null,
          google_maps_url: google_maps_url ?? null,
        },
        { onConflict: "google_place_id" }
      )
      .select("id")
      .single();

    if (error || !restaurant) {
      console.error("Failed to upsert restaurant:", error);
      return NextResponse.json(
        { error: "Failed to save restaurant" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: restaurant.id });
  } catch (error) {
    console.error("Error upserting restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
