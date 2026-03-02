import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lng = req.nextUrl.searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ city: "Near you" });
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=locality|administrative_area_level_1`
    );

    const data = await res.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      
      // Extract city name from address components
      let city = "";
      let country = "";
      
      for (const component of result.address_components || []) {
        if (component.types.includes("locality")) {
          city = component.long_name;
        }
        if (component.types.includes("administrative_area_level_1") && !city) {
          city = component.long_name;
        }
        if (component.types.includes("country")) {
          country = component.short_name;
        }
      }

      return NextResponse.json({
        city: city || "Near you",
        country,
        formattedAddress: result.formatted_address,
      });
    }

    return NextResponse.json({ city: "Near you" });
  } catch {
    return NextResponse.json({ city: "Near you" });
  }
}
