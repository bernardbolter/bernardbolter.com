'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
// Assuming Artwork type includes artworkFields.orientation and artworkFields.size
import { Artwork } from '@/types/artworks' 

interface ArtworkDetailProps {
	artwork: Artwork,
    artworkContainerWidth: number,
    artworkContainerHeight: number
}

// Define the size factors for different orientations and size grades
const SIZE_FACTORS = {
    portrait: {
        xl: 0.95, // max height = 95% of container height
        l: 0.85,  // max height = 85% of container height
        m: 0.75,  // max height = 75% of container height
        sm: 0.65, // max height = 65% of container height
    },
    landscape: {
        xl: 0.95, // max width = 95% of container width
        l: 0.85,  // max width = 85% of container width
        m: 0.75,  // max width = 75% of container width
        sm: 0.65, // max width = 65% of container width
    },
    square: {
        xl: 0.90, // max dimension = 90% of MIN(container width, container height)
        l: 0.80,  // max dimension = 80% of MIN(container width, container height)
        m: 0.70,  // max dimension = 70% of MIN(container width, container height)
        sm: 0.60, // max dimension = 60% of MIN(container width, container height)
    },
} as const; // Use 'as const' for strong typing

type OrientationKey = keyof typeof SIZE_FACTORS;
type SizeKey = keyof typeof SIZE_FACTORS[OrientationKey];

const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ 
    artwork,
    artworkContainerWidth,
    artworkContainerHeight
}) => {
    // Access original image dimensions and aspect ratio
    const originalWidth = artwork.artworkFields?.artworkImage?.mediaDetails?.sizes[1]?.width || 1;
    const originalHeight = artwork.artworkFields?.artworkImage?.mediaDetails?.sizes[1]?.height || 1;
    const aspectRatio = (originalWidth as number) / (originalHeight as number);

    const { orientation, size } = artwork.artworkFields;

    const { displayWidth, displayHeight } = useMemo(() => {
        let maxDimension = 0;
        let displayW = 0;
        let displayH = 0;
        let factor: number;

        const isOrientationValid = orientation && (orientation in SIZE_FACTORS);
        const isSizeValid = size && isOrientationValid && (size in SIZE_FACTORS[orientation as OrientationKey]);

        // Safely retrieve the factor based on orientation and size
        if (isOrientationValid && isSizeValid) {
            // 2. **Type Assertion for safe access**
            // We assert 'orientation' and 'size' as valid keys because we just checked them.
            const orientationKey = orientation as OrientationKey;
            const sizeKey = size as SizeKey;

            // Access the nested structure safely
            factor = SIZE_FACTORS[orientationKey][sizeKey]; 
        } else {
            // Default to a safe size factor if data is missing or invalid
            factor = 0.8; 
            console.warn(`Missing or invalid orientation/size: ${orientation}/${size}. Using default factor: ${factor}`);
        }


        switch (orientation) {
            case 'portrait':
                // Max height is based on the container height
                maxDimension = artworkContainerHeight * factor;
                displayH = maxDimension;
                displayW = displayH * aspectRatio;

                // Ensure the calculated width doesn't exceed the container width
                if (displayW > artworkContainerWidth) {
                    displayW = artworkContainerWidth;
                    displayH = displayW / aspectRatio;
                }
                break;

            case 'landscape':
                // Max width is based on the container width
                maxDimension = artworkContainerWidth * factor;
                displayW = maxDimension;
                displayH = displayW / aspectRatio;

                // Ensure the calculated height doesn't exceed the container height
                if (displayH > artworkContainerHeight) {
                    displayH = artworkContainerHeight;
                    displayW = displayH * aspectRatio;
                }
                break;

            case 'square':
                // Max dimension is based on the smaller of the two container dimensions
                const minContainerDim = Math.min(artworkContainerWidth, artworkContainerHeight);
                maxDimension = minContainerDim * factor;
                
                // Set the smaller of the image's dimensions to the maxDimension, maintaining aspect ratio
                if (aspectRatio >= 1) { // Landscape or Square-ish (width >= height)
                    displayW = maxDimension;
                    displayH = displayW / aspectRatio;
                } else { // Portrait-ish (height > width)
                    displayH = maxDimension;
                    displayW = displayH * aspectRatio;
                }
                
                // Final check to ensure it doesn't exceed the container bounds (shouldn't happen with the current logic, but safe)
                if (displayW > artworkContainerWidth || displayH > artworkContainerHeight) {
                     // Recalculate based on container limits if the complex square logic failed
                     const containerAspectRatio = artworkContainerWidth / artworkContainerHeight;
                     if (aspectRatio > containerAspectRatio) {
                         displayW = artworkContainerWidth;
                         displayH = displayW / aspectRatio;
                     } else {
                         displayH = artworkContainerHeight;
                         displayW = displayH * aspectRatio;
                     }
                }

                break;

            default:
                // Fallback: fit to container while maintaining aspect ratio (e.g., using both dimensions)
                const containerRatio = artworkContainerWidth / artworkContainerHeight;
                if (aspectRatio > containerRatio) {
                    displayW = artworkContainerWidth * factor;
                    displayH = displayW / aspectRatio;
                } else {
                    displayH = artworkContainerHeight * factor;
                    displayW = displayH * aspectRatio;
                }
                break;
        }

        // Return dimensions as integers, as required by the next/image component
        return { displayWidth: Math.round(displayW), displayHeight: Math.round(displayH) };
    }, [artworkContainerWidth, artworkContainerHeight, orientation, size, aspectRatio]);


    // Logging for debugging
    // useEffect(() => {
    //     console.log(`Container: ${artworkContainerWidth}x${artworkContainerHeight}`);
    //     console.log(`Artwork: ${orientation}/${size}`);
    //     console.log(`Display: ${displayWidth}x${displayHeight}`);
    // }, [artworkContainerWidth, artworkContainerHeight, orientation, size, displayWidth, displayHeight]);


    // The 'width' and 'height' props are for the *rendered* dimensions
    // The 'src' should ideally point to an optimized source URL
    return (
        <Link
            href={`/${artwork.slug}`}
            className="artwork-detail__link"
        >
            <Image
                className="artwork-detail__image"
                src={artwork.artworkFields?.artworkImage?.mediaDetails?.sizes[1]?.sourceUrl || ''}
                alt={artwork.title}
                width={displayWidth} 
                height={displayHeight}
                // Add 'style' for centering or other layout needs
                style={{ objectFit: 'contain' }}
            />
        </Link>
    )
}

export default ArtworkDetail