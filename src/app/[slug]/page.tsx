// app/artwork/[slug]/page.tsx
import { getArtworkBySlug, getArtworkData } from '@/lib/dataService'
import ArtworkContent from '@/components/Artworks/ArtworkContent'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const artwork = await getArtworkBySlug(slug)
  
  if (!artwork) {
    return {
      title: 'Artwork Not Found'
    }
  }

  return {
    title: `${artwork.title} - Bernard Bolter`,
    description: artwork.artworkFields.metadescription || 
      `${artwork.artworkFields.medium} from ${new Date(artwork.date).getFullYear()}`,
    keywords: artwork.artworkFields.metakeywords || undefined,
    alternates: {
      canonical: `/${artwork.slug}`
    },
    openGraph: {
      title: artwork.title,
      description: artwork.artworkFields.metadescription || undefined,
      images: artwork.artworkFields?.artworkImage?.node?.sourceUrl 
        ? [artwork.artworkFields.artworkImage.node.sourceUrl]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: artwork.title,
      description: artwork.artworkFields.metadescription || undefined,
      images: artwork.artworkFields?.artworkImage?.node?.sourceUrl 
        ? [artwork.artworkFields.artworkImage.node.sourceUrl]
        : [],
        creator: '@bernardbreaksdownart'
    }
  }
}

// Optional: Generate static paths for all artworks at build time
export async function generateStaticParams() {
  const allData = await getArtworkData()
  
  return allData.allArtwork.nodes.map((artwork) => ({
    slug: artwork.slug,
  }))
}

export default async function ArtworkPage({ params }: Props) {
  const { slug } = await params
  const artwork = await getArtworkBySlug(slug)
  // console.log("in page: ", artwork)

  if (!artwork) {
    notFound()
  }

  const isForSale = artwork.artworkFields?.forsale;
  
  const artworkSchema = {
      "@context": "https://schema.org",
      "@type": isForSale ? "Product" : "CreativeWork", // Use Product for better Rich Snippets if for sale
      "name": artwork.title,
      "image": artwork.artworkFields?.artworkImage?.node?.sourceUrl,
      "description": artwork.artworkFields.metadescription || artwork.content?.substring(0, 150) + "...",
      // Use your existing 'Person' schema as the creator reference
      "creator": {
          "@type": "Person",
          "name": "Bernard Bolter",
          "sameAs": "https://bernardbolter.com" // Link to the canonical URL of the person
      },
      "dateCreated": artwork.date,
      "keywords": artwork.artworkFields.metakeywords ? artwork.artworkFields.metakeywords.split(',').map((k: string) => k.trim()) : undefined,
      "material": artwork.artworkFields?.medium, // e.g., "Oil on Canvas"
      "height": {
          "@type": "Distance",
          "value": artwork.artworkFields?.height,
          "unitCode": artwork.artworkFields?.units === 'metric' ? "CM" : "IN" // Use the appropriate unit code (e.g., CM, IN)
      },
      "width": {
          "@type": "Distance",
          "value": artwork.artworkFields?.width,
          "unitCode": "CM" 
      },
      // Only include 'offers' if the artwork is for sale
      ...(isForSale && artwork.artworkFields?.price && {
          "offers": {
              "@type": "Offer",
              "priceCurrency": "EUR", // Change if needed
              "price": artwork.artworkFields.price,
              "itemCondition": "https://schema.org/NewCondition", // Or NewCondition
              "availability": "https://schema.org/InStock",
              "url": `https://bernardbolter.com/artwork/${artwork.slug}` // The canonical URL
          }
      })
  };

    return (
      <>
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(artworkSchema) }}
        />
        <ArtworkContent artwork={artwork} />
      </>
  )
}