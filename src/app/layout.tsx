import type { Metadata } from "next";
import { Geist, Staatliches } from "next/font/google";
import ArtworksProvider from "@/providers/ArtworkProvider";
import '@/styles/index.scss'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const staatliches = Staatliches({
  weight: ['400'],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bernard Bolter's Web Portal",
  description: "A timline of Bernard Bolter's artwork from the begining",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${staatliches.className}`}>
        <ArtworksProvider>
          {children}
        </ArtworksProvider>
      </body>
    </html>
  );
}
