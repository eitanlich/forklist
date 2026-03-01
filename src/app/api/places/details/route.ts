import { NextRequest, NextResponse } from "next/server";

const FOOD_TYPES = [
  "italian_restaurant",
  "japanese_restaurant",
  "mexican_restaurant",
  "chinese_restaurant",
  "french_restaurant",
  "greek_restaurant",
  "indian_restaurant",
  "thai_restaurant",
  "american_restaurant",
  "mediterranean_restaurant",
  "pizza_restaurant",
  "sushi_restaurant",
  "seafood_restaurant",
  "steak_house",
  "vegetarian_restaurant",
  "vegan_restaurant",
  "burger_restaurant",
  "cafe",
  "bakery",
  "ramen_restaurant",
];

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");
  if (!placeId)
    return NextResponse.json({ error: "placeId required" }, { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "displayName,formattedAddress,location,photos,types,websiteUri,googleMapsUri,addressComponents",
      },
      cache: "no-store",
    }
  );

  if (!res.ok)
    return NextResponse.json(
      { error: "Failed to fetch place details" },
      { status: res.status }
    );

  const data = await res.json();

  // Extract city from address components
  const cityComponent = (data.addressComponents ?? []).find((c: any) =>
    c.types?.includes("locality") ||
    c.types?.includes("administrative_area_level_1")
  );

  // Extract cuisine type from place types
  const cuisine = (data.types ?? [])
    .find((t: string) => FOOD_TYPES.includes(t))
    ?.replace(/_restaurant$/, "")
    ?.replace(/_/g, " ");

  return NextResponse.json({
    place_id: placeId,
    name: data.displayName?.text ?? "",
    formatted_address: data.formattedAddress ?? "",
    city: cityComponent?.longText ?? null,
    lat: data.location?.latitude ?? null,
    lng: data.location?.longitude ?? null,
    photo_reference: data.photos?.[0]?.name ?? null,
    cuisine_type: cuisine ?? null,
    website: data.websiteUri ?? null,
    google_maps_url: data.googleMapsUri ?? null,
  });
}
