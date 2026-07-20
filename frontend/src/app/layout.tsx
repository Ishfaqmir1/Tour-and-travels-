import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "react-photo-view/dist/react-photo-view.css";
import { Providers } from "@/lib/providers";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "THE VICEROY TOUR & TRAVELS - Explore. Discover. Travel.",
  description:
    "Discover destinations, hire local tour guides, and create unforgettable memories with THE VICEROY TOUR & TRAVELS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
