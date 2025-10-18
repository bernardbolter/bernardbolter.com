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
    openGraph: {
      title: artwork.title,
      description: artwork.artworkFields.metadescription || undefined,
      images: artwork.artworkFields?.artworkImage?.node?.sourceUrl 
        ? [artwork.artworkFields.artworkImage.node.sourceUrl]
        : [],
    },
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

  if (!artwork) {
    notFound()
  }

  return <ArtworkContent artwork={artwork} />
}