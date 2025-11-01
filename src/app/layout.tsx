// app/layout.tsx
import type { Metadata } from 'next';
import AnimationWrapper from './AnimationWrapper';
import { Staatliches, Sofia_Sans_Extra_Condensed, Barlow_Condensed } from 'next/font/google';
import { getArtworkData } from '@/lib/dataService';
import ArtworksProvider from '@/providers/ArtworkProvider';
import { AllData } from '@/types/artworkProviderTypes';
import { ApolloProvider } from '@/lib/apollo-provider';
import KlaroComponent from '@/components/Klaro';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import '@/styles/index.scss';

const barlow = Barlow_Condensed({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap'
});

const staatliches = Staatliches({
  weight: ['400'],
  subsets: ['latin'],
  display: 'swap'
});

const sofiaSansExtraCondensed = Sofia_Sans_Extra_Condensed({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: {
    default: "Bernard Bolter's Web Portal",
    template: "%s | Bernard Bolter",
  },
  description: "Explore Bernard Bolter's cityscape artworks: a timeline of paintings, drawings, and mixed media from 1992 to present. Original art for sale and exhibitions.",
  keywords: ['Bernard Bolter', 'digital art', 'meixed media art', 'contemporary painting', 'artist portfolio', 'original artwork', 'San Francisco artist', 'cityscape art'],
  metadataBase: new URL('https://bernardbolter.com'),
  alternates: { canonical: '/' },
  openGraph: {
    title: "Bernard Bolter's Art Portfolio",
    description: "Timeline of cityscape artworks by Bernard Bolter.",
    url: 'https://bernardbolter.com',
    siteName: 'Bernard Bolter Art',
    images: [{ url: '/bernard_bolter_portrait.jpeg', width: 811, height: 539, alt: 'Bernard Bolter Cityscape Artwork' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bernard Bolter's Art Portfolio",
    description: "Explore abstract artworks from 1980 to present.",
    images: ['/bernard_bolter_portrait.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  verification: {
    google: 'YOUR_GOOGLE_SITE_VERIFICATION_CODE', // From Google Search Console
  },
};

export const revalidate = 3600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const allData: AllData = await getArtworkData()

  return (
    <html lang="en">
      <head>
        <link rel="preload" href={barlow.style.fontFamily} as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href={staatliches.style.fontFamily} as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href={sofiaSansExtraCondensed.style.fontFamily} as="font" type="font/woff2" crossOrigin="" />
        <script
          type="text/plain"
          data-type="text/javascript"
          data-name="googleAnalytics"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          async
        />
        <script
          type="text/plain"
          data-type="text/javascript"
          data-name="googleAnalytics"
          dangerouslySetInnerHTML={{
            __html: `
              // This is a fallback – Klaro callback does the real init
              console.log('GA script placeholder');
            `,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "Bernard Bolter",
          "jobTitle": "Mixed Media and Digital Artist",
          "url": "https://bernardbolter.com",
          "description": "San Francisco born, Berlin based, mixed media and digital artist.",
          "image": "https://bernardbolter.com/bernard-bolter-portrait.jpeg",
          "sameAs": [
            "https://instagram.com/bernardbolter",
          ] // Add social links
        }) }} />
      </head>
      <body
        className={`${barlow.className} ${staatliches.className} ${sofiaSansExtraCondensed.className}`}
      >
        <ApolloProvider>
          <ArtworksProvider allData={allData}>
            <AnimationWrapper>
              <KlaroComponent />
              <GoogleAnalytics />
              {children}
            </AnimationWrapper>
          </ArtworksProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}