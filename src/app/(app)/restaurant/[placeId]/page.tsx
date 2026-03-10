import { notFound } from "next/navigation";
import RestaurantPageContent from "./RestaurantPageContent";

interface Props {
  params: Promise<{ placeId: string }>;
}

async function getRestaurantData(googlePlaceId: string) {
  // Fetch from Google Places API
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  const fieldMask = [
    "displayName",
    "formattedAddress",
    "location",
    "photos",
    "types",
    "websiteUri",
    "googleMapsUri",
    "addressComponents",
    "internationalPhoneNumber",
    "nationalPhoneNumber",
    "regularOpeningHours",
    "currentOpeningHours",
    "priceLevel",
  ].join(",");

  const res = await fetch(
    `https://places.googleapis.com/v1/places/${googlePlaceId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!res.ok) return null;

  const data = await res.json();

  // Extract city
  const cityComponent = (data.addressComponents ?? []).find((c: any) =>
    c.types?.includes("locality") ||
    c.types?.includes("administrative_area_level_1")
  );

  // Extract cuisine type
  const FOOD_TYPES = [
    "italian_restaurant", "japanese_restaurant", "mexican_restaurant",
    "chinese_restaurant", "french_restaurant", "greek_restaurant",
    "indian_restaurant", "thai_restaurant", "american_restaurant",
    "mediterranean_restaurant", "pizza_restaurant", "sushi_restaurant",
    "seafood_restaurant", "steak_house", "vegetarian_restaurant",
    "vegan_restaurant", "burger_restaurant", "cafe", "bakery",
    "ramen_restaurant", "korean_restaurant", "vietnamese_restaurant",
  ];
  
  const cuisine = (data.types ?? [])
    .find((t: string) => FOOD_TYPES.includes(t))
    ?.replace(/_restaurant$/, "")
    ?.replace(/_/g, " ");

  // Parse price level
  const priceLevelMap: Record<string, number> = {
    "PRICE_LEVEL_FREE": 0,
    "PRICE_LEVEL_INEXPENSIVE": 1,
    "PRICE_LEVEL_MODERATE": 2,
    "PRICE_LEVEL_EXPENSIVE": 3,
    "PRICE_LEVEL_VERY_EXPENSIVE": 4,
  };

  // Parse opening hours
  const openingHours = data.regularOpeningHours ? {
    open_now: data.currentOpeningHours?.openNow ?? null,
    weekday_text: data.regularOpeningHours.weekdayDescriptions ?? [],
  } : null;

  return {
    google_place_id: googlePlaceId,
    name: data.displayName?.text ?? "",
    address: data.formattedAddress ?? "",
    city: cityComponent?.longText ?? null,
    lat: data.location?.latitude ?? null,
    lng: data.location?.longitude ?? null,
    photo_reference: data.photos?.[0]?.name ?? null,
    cuisine_type: cuisine ?? null,
    website: data.websiteUri ?? null,
    google_maps_url: data.googleMapsUri ?? null,
    phone: data.internationalPhoneNumber ?? data.nationalPhoneNumber ?? null,
    price_level: priceLevelMap[data.priceLevel] ?? null,
    opening_hours: openingHours,
  };
}

async function extractInstagram(websiteUrl: string | null): Promise<string | null> {
  if (!websiteUrl) return null;

  // Case 1: Website IS Instagram
  const igDirectMatch = websiteUrl.match(/instagram\.com\/([a-zA-Z0-9_.]+)/i);
  if (igDirectMatch) {
    const handle = igDirectMatch[1].toLowerCase();
    if (!["p", "reel", "stories", "explore", "accounts"].includes(handle)) {
      return handle;
    }
  }

  // Case 2: Scrape the website
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ForkListBot/1.0)" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();
    const igMatch = html.match(/(?:instagram\.com|instagr\.am)\/([a-zA-Z0-9_.]+)/i);
    if (igMatch) {
      const handle = igMatch[1].toLowerCase();
      if (!["p", "reel", "stories", "explore", "accounts", ""].includes(handle)) {
        return handle;
      }
    }
  } catch {
    // Timeout or network error
  }

  return null;
}

export default async function RestaurantPage({ params }: Props) {
  const { placeId } = await params;
  
  const googleData = await getRestaurantData(placeId);
  if (!googleData) {
    notFound();
  }

  // Extract Instagram (async)
  const instagram = await extractInstagram(googleData.website);

  return (
    <RestaurantPageContent
      googlePlaceId={placeId}
      googleData={{ ...googleData, instagram }}
    />
  );
}
