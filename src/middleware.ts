import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require authentication (app routes)
const isProtectedRoute = createRouteMatcher([
  "/home(.*)",
  "/history(.*)",
  "/add(.*)",
  "/lists(.*)",
  "/search(.*)",
  "/explore(.*)",
  "/notifications(.*)",
  "/requests(.*)",
  "/settings(.*)",
  "/edit-review(.*)",
  "/delete-review(.*)",
  "/restaurant(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect specific app routes - everything else is public (including 404)
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|json)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

