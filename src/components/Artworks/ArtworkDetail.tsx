'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { Artwork } from '@/types/artworks'

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

    useEffect(() => {
        console.log(artworkContainerWidth, artworkContainerHeight)
    }, [artworkContainerWidth, artworkContainerHeight])

    return (
        <Image
            src={artwork.artworkFields?.artworkImage?.mediaDetails.sizes[2].sourceUrl || ''}
            alt={artwork.title}
            width={artwork.artworkFields?.artworkImage.mediaDetails.sizes[2].width || 200} 
            height={artwork.artworkFields?.artworkImage.mediaDetails.sizes[2].height || 200}
        />
    )
}

export default ArtworkDetail