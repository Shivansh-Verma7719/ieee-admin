import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");

  // if "next" is in param, use it in the redirect URL
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const { data } = await supabase.auth.getClaims();

      if (data?.claims.email) {
        // Check if user email exists in people table and has can_login set to true
        const { data: personData, error: personError } = await supabase
          .from("people")
          .select("can_login")
          .eq("email", data.claims.email)
          .single();

        if (personError || !personData || !personData.can_login) {
          // User doesn't exist in people table or doesn't have login permission
          // Sign out the user and redirect to restricted page
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/auth/auth-restricted`);
        }
      } else {
        // No email found, redirect to restricted page
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/auth/auth-error`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
