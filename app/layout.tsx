import type { Metadata } from "next";
import "./globals.css";
import CustomNavbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "IEEE Admin",
  description: "IEEE Admin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <CustomNavbar />
        {children}
      </body>
    </html>
  );
}
