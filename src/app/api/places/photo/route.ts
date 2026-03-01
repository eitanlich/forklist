import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return new Response("ref required", { status: 400 });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return new Response("API key not configured", { status: 500 });

  // skipHttpRedirect=true returns JSON with the CDN photoUri instead of a direct redirect.
  // This keeps the API key server-side only.
  const res = await fetch(
    `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=800&skipHttpRedirect=true&key=${apiKey}`
  );

  if (!res.ok) return new Response("Failed to fetch photo", { status: 500 });

  const data = await res.json();
  const photoUri: string | undefined = data.photoUri;

  if (!photoUri) return new Response("No photo found", { status: 404 });

  // Redirect to the CDN URL — it's a temporary lh3.googleusercontent.com URL, no API key needed
  return Response.redirect(photoUri, 302);
}
