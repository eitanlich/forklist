import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  
  // Clear Clerk session cookies and redirect to home
  const response = NextResponse.redirect(new URL("/", baseUrl));
  
  // Clear Clerk session cookies
  response.cookies.delete("__session");
  response.cookies.delete("__client_uat");
  
  return response;
}
