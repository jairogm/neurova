import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/patients(.*)"]);

// LOCAL DEV ONLY: set BYPASS_AUTH=true in .env.local to view protected routes
// without signing in. Defaults to OFF, so any environment without the flag
// (e.g. production) keeps full Clerk protection.
const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";

export default clerkMiddleware(async (auth, req) => {
  if (!BYPASS_AUTH && isProtectedRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: "/auth/login",
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
