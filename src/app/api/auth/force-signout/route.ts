import { NextResponse } from "next/server";

export async function GET() {
  // Redirect to Clerk's sign-out then back to home
  // This clears the Clerk session cookie
  const signOutUrl = `/sign-in?redirect_url=${encodeURIComponent("/")}`;
  
  // Create response that clears any session cookies and redirects
  const response = NextResponse.redirect(new URL(signOutUrl, process.env.NEXT_PUBLIC_APP_URL || "https://forklist.app"));
  
  // Clear Clerk session cookies
  response.cookies.delete("__session");
  response.cookies.delete("__client_uat");
  
  return response;
}
