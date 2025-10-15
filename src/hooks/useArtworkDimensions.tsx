// hooks/useArtworkDimensions.ts

import { useMemo } from 'react';
import { Artwork } from '@/types/artworkTypes';

// --- FACTOR CONSTANTS ---
// Consolidate size factors and use 'lg' for consistency with 'md'
const COMMON_FACTORS = {
    xl: 0.95,
    lg: 0.85, // Note: changed from 'l' in previous context to 'lg'
    md: 0.75,
    sm: 0.65,
};

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

// --- TYPES ---
type OrientationKey = keyof typeof SIZE_FACTORS;
type SizeKey = keyof typeof COMMON_FACTORS;

interface Dimensions {
    displayWidth: number;
    displayHeight: number;
}

interface UseArtworkDimensionsProps {
    artwork: Artwork;
    artworkContainerWidth: number;
    artworkContainerHeight: number;
}

/**
 * Custom hook to calculate the display width and height of an artwork image
 * based on its orientation, size factor, and container dimensions.
 */
export const useArtworkDimensions = ({
    artwork,
    artworkContainerWidth,
    artworkContainerHeight,
}: UseArtworkDimensionsProps): Dimensions => {
    
    // --- KEY DERIVATION & NORMALIZATION ---
    
    const { orientation, size } = artwork.artworkFields;

    const currentOrientation: OrientationKey = useMemo(() => {
        // (1) Orientation: Safely derive and assert type, default to 'square'
        const rawKey = Array.isArray(orientation) && orientation[0] ? orientation[0] : 'square';
        return rawKey.toLowerCase().trim() as OrientationKey;
    }, [orientation]);

    const currentSize: SizeKey = useMemo(() => {
        // (2) Size: Safely derive and assert type. Fallback changed from 'l' to 'lg'.
        const rawKey = Array.isArray(size) && size[0] ? size[0] : (typeof size === 'string' ? size : 'lg');
        
        const normalizedSize = rawKey.toLowerCase().trim();

        // Map 'md' from data to 'md' key (already correct, but good to ensure no 'm' is missed)
        // If data sends 'm' but factors use 'md', you'd map here (e.g., if (normalizedSize === 'm') normalizedSize = 'md';)
        // Assuming your data now sends keys that match 'xl', 'lg', 'md', 'sm'.
        
        // CRITICAL FIX: The fallback must be a valid key. The size 'l' is invalid, use 'lg'.
        const validKeys = Object.keys(COMMON_FACTORS) as SizeKey[];
        
        if (!validKeys.includes(normalizedSize as SizeKey)) {
            return 'lg'; // Use 'lg' as the default/fallback size
        }

        return normalizedSize as SizeKey; 
    }, [size]);


    return useMemo(() => {
        
        // --- 1. Aspect Ratio Calculation ---
        const mediaWidth = artwork.artworkFields?.artworkImage?.node?.mediaDetails?.width;
        const mediaHeight = artwork.artworkFields?.artworkImage?.node?.mediaDetails?.height;
        
        // Ensure aspect ratio is a positive, non-zero number
        const aspectRatio = (mediaWidth && mediaHeight && mediaHeight > 0 && mediaWidth > 0) 
            ? mediaWidth / mediaHeight 
            : (artwork.artworkFields?.proportion && artwork.artworkFields.proportion > 0
                ? artwork.artworkFields.proportion
                : 1); // Fallback to 1 (square)

        const factor = SIZE_FACTORS[currentOrientation][currentSize];

        // --- 2. Calculate Maximum Available Space (Based on Factor) ---
        let maxW = 0;
        let maxH = 0;

        switch (currentOrientation) {
            case 'portrait':
            case 'landscape':
                // For portrait, maximize height; for landscape, maximize width.
                // Square and default will maximize based on the smaller container dimension.
                if (artworkContainerWidth / artworkContainerHeight > aspectRatio) {
                    // Container is wider than aspect ratio (height is the limiting factor)
                    maxH = artworkContainerHeight * factor;
                    maxW = artworkContainerWidth; 
                } else {
                    // Container is taller than aspect ratio (width is the limiting factor)
                    maxW = artworkContainerWidth * factor;
                    maxH = artworkContainerHeight;
                }
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
        
        // Final sanity check against actual container size (should only be needed if factors > 1)
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
    }, [
        artworkContainerWidth, 
        artworkContainerHeight, 
        currentOrientation, 
        currentSize,
        artwork.artworkFields?.artworkImage?.node?.mediaDetails?.height,
        artwork.artworkFields?.artworkImage?.node?.mediaDetails?.width,
        artwork.artworkFields.proportion,
    ]);
};