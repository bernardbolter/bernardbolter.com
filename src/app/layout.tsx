import type { Metadata } from "next";
import { Geist, Staatliches, Sofia_Sans_Extra_Condensed, Manrope } from "next/font/google";
import ArtworksProvider from "@/providers/ArtworkProvider";
import '@/styles/index.scss'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin']
})

const staatliches = Staatliches({
  weight: ['400'],
  subsets: ["latin"],
});

const sofiaSansExtraCondensed = Sofia_Sans_Extra_Condensed({
  weight: ['300', '400', '500', '600', '700'],
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
      <body className={`${geistSans.variable} ${manrope.variable} ${staatliches.className} ${sofiaSansExtraCondensed.className}`}>
        <ArtworksProvider>
          {children}
        </ArtworksProvider>
      </body>
    </html>
  );
}
