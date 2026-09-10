import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "./_components/site-header";

export const metadata: Metadata = {
  title: "Boba — a Letterboxd for boba",
  description: "Log the boba you drink, rate it, and find your next cup.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
