import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) return NextResponse.json({ suggestions: [] });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );

  const res = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: q,
        includedPrimaryTypes: ["restaurant"],
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) return NextResponse.json({ suggestions: [] });

  const data = await res.json();

  const suggestions = (data.suggestions ?? [])
    .map((s: any) => ({
      placeId: s.placePrediction?.placeId,
      name:
        s.placePrediction?.structuredFormat?.mainText?.text ??
        s.placePrediction?.text?.text ??
        "",
      address:
        s.placePrediction?.structuredFormat?.secondaryText?.text ?? "",
    }))
    .filter((s: any) => s.placeId && s.name);

  return NextResponse.json({ suggestions });
}
