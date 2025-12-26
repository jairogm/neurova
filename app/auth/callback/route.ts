import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Auth callback received:", {
    code: code ? "present" : "missing",
    error,
    error_description,
    origin,
    next
  });

  // If there's an error from the OAuth provider, log it and redirect to error page
  if (error) {
    console.error("OAuth error:", error, error_description);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error_description || error)}`);
  }

  if (code) {
    const supabase = await createClient();
    console.log("Attempting to exchange code for session...");
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log("Exchange result:", {
      hasData: !!data,
      hasUser: !!data?.user,
      userId: data?.user?.id,
      userEmail: data?.user?.email,
      error: error?.message
    });

    if (!error && data?.user) {
      console.log("Successfully authenticated user:", data.user.email);
      
      // Create redirect response
      const redirectUrl = `${origin}${next}`;
      console.log("Redirecting to:", redirectUrl);
      
      return NextResponse.redirect(redirectUrl);
    } else if (error) {
      console.error("Failed to exchange code for session:", error.message);
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
    }
  }

  console.log("No code provided, redirecting to error page");
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}