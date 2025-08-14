import type { Metadata } from "next";
import "./globals.css";
import CustomNavbar from "@/components/navbar";
import { createClient } from "@/utils/supabase/server";
import { JwtClaims } from "@/types/supabase";

export const metadata: Metadata = {
  title: "IEEE Admin",
  description: "IEEE Admin",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const { data } = await supabase.auth.getClaims();
  let user = null;

  if (!data) {
    user = null;
  } else {
    user = data.claims as JwtClaims;
  }

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <CustomNavbar user={user} />
        {children}
      </body>
    </html>
  );
}
