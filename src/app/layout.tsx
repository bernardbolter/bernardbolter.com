// app/layout.tsx
import type { Metadata } from 'next';
import AnimationWrapper from './AnimationWrapper';
import { Geist, Staatliches, Sofia_Sans_Extra_Condensed, Manrope, Barlow_Condensed } from 'next/font/google';
import { getArtworkData } from '@/lib/dataService';
import ArtworksProvider from '@/providers/ArtworkProvider';
import { AllData } from '@/types/artworkProviderTypes';
import { ApolloProvider } from '@/lib/apollo-provider';
import '@/styles/index.scss';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const barlow = Barlow_Condensed({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

const staatliches = Staatliches({
  weight: ['400'],
  subsets: ['latin'],
});

const sofiaSansExtraCondensed = Sofia_Sans_Extra_Condensed({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "Bernard Bolter's Web Portal",
  description: "A timeline of Bernard Bolter's artwork from the beginning",
};

export const revalidate = 100;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const allData: AllData = await getArtworkData()

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${manrope.variable} ${barlow.className} ${staatliches.className} ${sofiaSansExtraCondensed.className}`}
      >
        <ApolloProvider>
          <ArtworksProvider allData={allData}>
            <AnimationWrapper>{children}</AnimationWrapper>
          </ArtworksProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}