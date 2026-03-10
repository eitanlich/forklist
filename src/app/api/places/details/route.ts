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
  "korean_restaurant",
  "vietnamese_restaurant",
  "spanish_restaurant",
  "brazilian_restaurant",
  "peruvian_restaurant",
  "argentinian_restaurant",
  "turkish_restaurant",
  "lebanese_restaurant",
  "middle_eastern_restaurant",
  "african_restaurant",
  "caribbean_restaurant",
  "food_court",
  "fast_food_restaurant",
  "fine_dining_restaurant",
  "bar",
  "pub",
  "wine_bar",
  "cocktail_bar",
  "ice_cream_shop",
  "dessert_shop",
  "brunch_restaurant",
  "breakfast_restaurant",
];

/**
 * Extract Instagram handle from a website URL
 * - If the URL is already instagram.com, extract handle directly
 * - Otherwise, scrape the website HTML for Instagram links
 */
async function extractInstagram(websiteUrl: string | null): Promise<string | null> {
  if (!websiteUrl) return null;

  try {
    // Case 1: Website IS Instagram
    const igDirectMatch = websiteUrl.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
    if (igDirectMatch) {
      const handle = igDirectMatch[1].toLowerCase();
      // Filter out generic paths
      if (!["p", "reel", "stories", "explore", "accounts"].includes(handle)) {
        return handle;
      }
    }

    // Case 2: Scrape the website for Instagram links
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(websiteUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ForkListBot/1.0)",
        "Accept": "text/html",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    
    // Look for Instagram links in the HTML
    const igMatch = html.match(/(?:instagram\.com|instagr\.am)\/([a-zA-Z0-9_.]+)/i);
    if (igMatch) {
      const handle = igMatch[1].toLowerCase();
      // Filter out generic paths
      if (!["p", "reel", "stories", "explore", "accounts", ""].includes(handle)) {
        return handle;
      }
    }

    return null;
  } catch {
    // Timeout or network error - fail silently
    return null;
  }
}

/**
 * Convert Google's priceLevel to a number (1-4)
 */
function parsePriceLevel(priceLevel: string | undefined): number | null {
  if (!priceLevel) return null;
  const mapping: Record<string, number> = {
    "PRICE_LEVEL_FREE": 0,
    "PRICE_LEVEL_INEXPENSIVE": 1,
    "PRICE_LEVEL_MODERATE": 2,
    "PRICE_LEVEL_EXPENSIVE": 3,
    "PRICE_LEVEL_VERY_EXPENSIVE": 4,
  };
  return mapping[priceLevel] ?? null;
}

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

  // Expanded FieldMask to get more data
  const fieldMask = [
    "displayName",
    "formattedAddress",
    "location",
    "photos",
    "types",
    "websiteUri",
    "googleMapsUri",
    "addressComponents",
    // New fields
    "internationalPhoneNumber",
    "nationalPhoneNumber",
    "regularOpeningHours",
    "currentOpeningHours",
    "priceLevel",
  ].join(",");

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
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

  // Extract Instagram (async, but don't block response if it fails)
  const websiteUrl = data.websiteUri ?? null;
  const instagram = await extractInstagram(websiteUrl);

  // Parse opening hours
  const openingHours = data.regularOpeningHours ? {
    open_now: data.currentOpeningHours?.openNow ?? null,
    weekday_text: data.regularOpeningHours.weekdayDescriptions ?? [],
    periods: data.regularOpeningHours.periods ?? [],
  } : null;

  return NextResponse.json({
    place_id: placeId,
    name: data.displayName?.text ?? "",
    formatted_address: data.formattedAddress ?? "",
    city: cityComponent?.longText ?? null,
    lat: data.location?.latitude ?? null,
    lng: data.location?.longitude ?? null,
    photo_reference: data.photos?.[0]?.name ?? null,
    cuisine_type: cuisine ?? null,
    website: websiteUrl,
    google_maps_url: data.googleMapsUri ?? null,
    // New fields
    instagram,
    phone: data.internationalPhoneNumber ?? data.nationalPhoneNumber ?? null,
    price_level: parsePriceLevel(data.priceLevel),
    opening_hours: openingHours,
  });
}
