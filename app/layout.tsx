import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Playable Ads Studio",
  description: "Bright local no-code builder for UA playable ads, templates, validation, preview, export, video MVP, and AI MVP."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
