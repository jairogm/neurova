import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/patients(.*)",
  "/schedule(.*)",
  "/notes(.*)",
  "/billing(.*)",
  "/profile(.*)",
  "/trash(.*)",
]);

// LOCAL DEV ONLY: set BYPASS_AUTH=true in .env.local to view protected routes
// without signing in. Defaults to OFF, so any environment without the flag
// (e.g. production) keeps full Clerk protection.
const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";

export default clerkMiddleware(async (auth, req) => {
  if (!BYPASS_AUTH && isProtectedRoute(req)) {
    // Clerk requires an absolute URL here; a relative path throws
    // "URL is malformed" in the edge runtime. Resolve it against the incoming
    // request so previews, custom domains and localhost all redirect to their
    // own origin.
    await auth.protect({
      unauthenticatedUrl: new URL("/auth/login", req.nextUrl.origin).toString(),
    });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
