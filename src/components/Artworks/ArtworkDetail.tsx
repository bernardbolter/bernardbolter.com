'use client'

import Image from 'next/image'
import Link from 'next/link'

import { useArtworkDimensions } from '@/hooks/useArtworkDimensions'

import { Artwork } from '@/types/artworksTypes' 

interface ArtworkDetailProps {
	artwork: Artwork,
    artworkContainerWidth: number,
    artworkContainerHeight: number
}


const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ 
    artwork,
    artworkContainerWidth,
    artworkContainerHeight
}) => {

    const { displayWidth, displayHeight } = useArtworkDimensions({
        artwork,
        artworkContainerWidth,
        artworkContainerHeight
    });
    
    // --- Image Source Retrieval (Unchanged) ---
    const imageNode = artwork.artworkFields?.artworkImage?.node; 
    const imageSrc = imageNode?.sourceUrl || '';
    const imageSrcSet = imageNode?.srcSet || '';

    return (
        <Link
            href={`/${artwork.slug}`}
            className="artwork-detail__link"
        >
            <Image
                className="artwork-detail__image"
                src={imageSrc} 
                {...(imageSrcSet && { srcSet: imageSrcSet })} 
                alt={artwork.title}
                width={displayWidth} 
                height={displayHeight}
                style={{ objectFit: 'contain' }}
            />
        </Link>
    )
}

export default ArtworkDetail