'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Artwork } from '@/types/artworksTypes' 

interface ArtworkDetailProps {
	artwork: Artwork,
    artworkContainerWidth: number,
    artworkContainerHeight: number
}

// Define common factors for portrait/landscape
const COMMON_FACTORS = {
    xl: 0.95,
    lg: 0.85,
    md: 0.75,
    sm: 0.65,
};

// Define the size factors for different orientations and size grades
const SIZE_FACTORS = {
    portrait: COMMON_FACTORS, 
    landscape: COMMON_FACTORS,
    square: {
        xl: 0.90, 
        lg: 0.80, 
        md: 0.70, 
        sm: 0.60,
    },
} as const;

type OrientationKey = keyof typeof SIZE_FACTORS;
type SizeKey = keyof typeof COMMON_FACTORS; // Base type on common factors

const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ 
    artwork,
    artworkContainerWidth,
    artworkContainerHeight
}) => {
    
    const { orientation, size } = artwork.artworkFields;

    // (1) Orientation: Safely derive and assert type for currentOrientation
    const rawOrientationKey = Array.isArray(orientation) && orientation[0] ? orientation[0] : 'square';
    const currentOrientation = rawOrientationKey.toLowerCase() as OrientationKey;

    // (2) Size: Safely derive and assert type for currentSize
    const rawSizeKey = Array.isArray(size) && size[0] ? size[0] : (typeof size === 'string' ? size : 'l');
    const currentSize = rawSizeKey.toLowerCase() as SizeKey; 

    const { displayWidth, displayHeight } = useMemo(() => {
        
        // --- 1. Aspect Ratio Calculation ---
        const mediaWidth = artwork.artworkFields?.artworkImage?.node?.mediaDetails?.width;
        const mediaHeight = artwork.artworkFields?.artworkImage?.node?.mediaDetails?.height;
        
        const aspectRatio = (mediaWidth && mediaHeight && mediaHeight > 0 && mediaWidth > 0) 
            ? mediaWidth / mediaHeight 
            : (artwork.artworkFields?.proportion && artwork.artworkFields.proportion > 0
                ? artwork.artworkFields.proportion
                : 1);

        console.log(currentOrientation, currentSize)
        const factor = SIZE_FACTORS[currentOrientation][currentSize];
        console.log(factor, aspectRatio)

        // --- 2. Calculate Maximum Available Space (Based on Factor) ---
        let maxW = 0;
        let maxH = 0;

        switch (currentOrientation) {
            case 'portrait':
                // Maximize height based on factor
                maxH = artworkContainerHeight * factor;
                maxW = artworkContainerWidth; 
                break;
            case 'landscape':
                // Maximize width based on factor
                maxW = artworkContainerWidth * factor;
                maxH = artworkContainerHeight; 
                break;
            case 'square':
            default:
                // Maximize both based on the * minimum * container dimension
                const minContainerDim = Math.min(artworkContainerWidth, artworkContainerHeight);
                maxW = minContainerDim * factor;
                maxH = minContainerDim * factor;
                break;
        }

        // --- 3. Fit Image into Max Space while preserving Aspect Ratio ---
        // Start by fitting to max allowed width
        let displayW = maxW;
        let displayH = displayW / aspectRatio;

        // If the resulting height exceeds max allowed height, recalculate based on maxH
        if (displayH > maxH) {
            displayH = maxH;
            displayW = displayH * aspectRatio;
        }
        
        // Final check against actual container size (should only trigger if factor > 1)
        if (displayW > artworkContainerWidth) {
             displayW = artworkContainerWidth;
             displayH = displayW / aspectRatio;
        }
        if (displayH > artworkContainerHeight) {
             displayH = artworkContainerHeight;
             displayW = displayH * aspectRatio;
        }

        // Return dimensions as integers
        return { displayWidth: Math.round(displayW), displayHeight: Math.round(displayH) };
        }, [artworkContainerWidth, 
            artworkContainerHeight,
            currentOrientation, 
            currentSize, 
            artwork.artworkFields?.artworkImage?.node?.mediaDetails?.height,
            artwork.artworkFields?.artworkImage?.node?.mediaDetails?.width,
            artwork.artworkFields.proportion
        ]); // Dependencies remain on raw fields
    
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