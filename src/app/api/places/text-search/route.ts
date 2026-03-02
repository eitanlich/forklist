import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");
  const country = req.nextUrl.searchParams.get("country");
  const pageToken = req.nextUrl.searchParams.get("pageToken");

  if (!q || q.trim().length < 2) return NextResponse.json({ results: [] });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey)
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });

  // Build request body
  const requestBody: Record<string, unknown> = {
    textQuery: `${q} restaurant`,
    includedType: "restaurant",
    pageSize: 10,
  };

  // Add location bias if coordinates provided
  if (lat && lng) {
    requestBody.locationBias = {
      circle: {
        center: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
        },
        radius: 50000,
      },
    };
  }

  // Add country restriction via text query
  if (country) {
    requestBody.textQuery = `${q} restaurant in ${country}`;
  }

  // Add page token for pagination
  if (pageToken) {
    requestBody.pageToken = pageToken;
  }

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.photos,places.rating,places.userRatingCount,places.priceLevel,places.location,nextPageToken",
    },
    body: JSON.stringify(requestBody),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Text search error:", await res.text());
    return NextResponse.json({ results: [] });
  }

  const data = await res.json();

  const results = (data.places ?? []).map((place: any) => ({
    placeId: place.id,
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? "",
    rating: place.rating ?? null,
    ratingCount: place.userRatingCount ?? 0,
    priceLevel: place.priceLevel ?? null,
    photoReference: place.photos?.[0]?.name ?? null,
    lat: place.location?.latitude ?? null,
    lng: place.location?.longitude ?? null,
  }));

  return NextResponse.json({
    results,
    nextPageToken: data.nextPageToken ?? null,
  });
}
