// hooks/useArtworkDimensions.ts

import { useMemo } from 'react';

// --- FACTOR CONSTANTS ---
const COMMON_FACTORS = {
    xl: 0.95,
    lg: 0.85,
    md: 0.75,
    sm: 0.65,
};

const DEFAULT_SIZE_FACTORS = {
    portrait: COMMON_FACTORS,
    landscape: COMMON_FACTORS,
    square: {
        xl: 0.90,
        lg: 0.80,
        md: 0.70,
        sm: 0.60,
    },
} as const;

const IMAGE_FACTORS_COMMON = {
    xl: 0.95,
    lg: 0.90,
    md: 0.85,
    sm: 0.80,
};

const IMAGE_SIZE_FACTORS = {
    portrait: IMAGE_FACTORS_COMMON,
    landscape: IMAGE_FACTORS_COMMON,
    square: IMAGE_FACTORS_COMMON
} as const

// --- TYPES ---
type OrientationKey = keyof typeof DEFAULT_SIZE_FACTORS;
type SizeKey = keyof typeof COMMON_FACTORS;

interface Dimensions {
    displayWidth: number;
    displayHeight: number;
}
interface UseArtworkDimensionsProps {
    imageWidth: number;
    imageHeight: number;
    artworkContainerWidth: number;
    artworkContainerHeight: number;
    artworkSize: string;
    useImageFactors?: boolean;
}

/**
 * Custom hook to calculate the display width and height of an artwork image
 * based on its orientation, size factor, and container dimensions.
 */
export const useArtworkDimensions = ({
    artworkContainerWidth,
    artworkContainerHeight,
    useImageFactors = false,
    imageWidth,
    imageHeight,
    artworkSize
}: UseArtworkDimensionsProps): Dimensions => {
    const FALLBACK_DIM = 800
    const FALLBACK_SIZE: SizeKey = 'lg'

    const mediaWidth = (imageWidth > 0) ? imageWidth : FALLBACK_DIM
    const mediaHeight = (imageHeight > 0) ? imageHeight : FALLBACK_DIM

    const aspectRatio = mediaWidth / mediaHeight

    let currentOrientation: OrientationKey

    if (mediaWidth > mediaHeight) {
        currentOrientation = 'landscape'
    } else if (mediaWidth < mediaHeight) {
        currentOrientation = 'portrait'
    } else {
        currentOrientation = 'square'
    }

    const currentSize: SizeKey = (artworkSize as SizeKey) ?? FALLBACK_SIZE
    const selectedSizeFactors = useImageFactors ? IMAGE_SIZE_FACTORS : DEFAULT_SIZE_FACTORS
    const factor = selectedSizeFactors[currentOrientation][currentSize]

    return useMemo(() => {
        let maxW: number
        let maxH: number

        switch (currentOrientation) {
            case 'portrait':
            case 'landscape':
                maxW = artworkContainerWidth * factor
                maxH = artworkContainerHeight * factor
                break
            case 'square':
                const minContainerDim = Math.min(artworkContainerWidth, artworkContainerHeight)
                maxW = minContainerDim * factor
                maxH = minContainerDim * factor
                break
            default:
                maxW = artworkContainerWidth * factor
                maxH = artworkContainerHeight * factor
                break
        }

        let displayW = maxW
        let displayH = maxW / aspectRatio

        if (displayH > maxH) {
            displayH = maxH
            displayW = displayH * aspectRatio
        }

        if (displayW > artworkContainerWidth) {
             displayW = artworkContainerWidth;
             displayH = displayW / aspectRatio;
        }
        if (displayH > artworkContainerHeight) {
             displayH = artworkContainerHeight;
             displayW = displayH * aspectRatio;
        }

        return { displayWidth: Math.round(displayW), displayHeight: Math.round(displayH) }
    }, [
        artworkContainerWidth, 
        artworkContainerHeight, 
        currentOrientation,
        aspectRatio,
        factor
    ])
};