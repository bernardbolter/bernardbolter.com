'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { useArtworkDimensions } from '@/hooks/useArtworkDimensions'

import PlayButtonSvg from '@/svgs/PlayButtonSvg'

import { Artwork } from '@/types/artworkTypes'
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
    const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false)

    const { displayWidth, displayHeight } = useArtworkDimensions({
        artwork,
        artworkContainerWidth,
        artworkContainerHeight
    });

    const isVideo = !artwork.artworkFields?.artworkImage && !!artwork.artworkFields?.videoPoster;
    
    // Choose the source: main image for artwork, poster image for video
    const imageSource = isVideo 
        ? artwork.artworkFields?.videoPoster 
        : artwork.artworkFields?.artworkImage;
    
    const imageNode = imageSource?.node; 
    const imageSrc = imageNode?.sourceUrl || '';
    const imageSrcSet = imageNode?.srcSet || '';

    return (
        <Link
            href={`/${artwork.slug}`}
            className="artwork-detail__link"
        >
            <div 
                className="artwork-detail__image-container"
                style={{ width: displayWidth, height: displayHeight}}    
            >
                {!isImageLoaded && <div className="artwork-detail__placeholder" />}
                {isVideo && <PlayButtonSvg />}

                <Image
                    className={`artwork-detail__image ${isImageLoaded ? 'is-loaded' : ''}`}
                    src={imageSrc} 
                    {...(imageSrcSet && { srcSet: imageSrcSet })} 
                    alt={artwork.title}
                    width={displayWidth} 
                    height={displayHeight}
                    style={{ objectFit: 'contain' }}
                    placeholder="empty"
                    onLoad={() => {
                        setIsImageLoaded(true)
                    }}
                />
            </div>
        </Link>
    )
}

export default ArtworkDetail