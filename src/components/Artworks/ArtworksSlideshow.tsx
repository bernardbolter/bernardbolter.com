// ArtworksSlideshow.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import useWindowSize from '@/hooks/useWindowSize'
import { useArtworkDimensions } from '@/hooks/useArtworkDimensions'
import Image from 'next/image'

interface ArtworksSlideshowProps {
  autoPlayInterval?: number;
}

const ArtworksSlideshow: React.FC<ArtworksSlideshowProps> = ({ 
    autoPlayInterval = 5000
}) => {
    const [artworks, setArtworks] = useArtworks();
    const [loadedIndex, setLoadedIndex] = useState<number>(-1); // New: Track loaded index
    const vport = useWindowSize()
    const [artworkContainerWidth, setArtworkContainerWidth] = useState<number>(0);
    const [artworkContainerHeight, setArtworkContainerHeight] = useState<number>(0);

    const currentIndexRef = useRef<number>(artworks.currentArtworkIndex)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const animationRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)
    const pausedProgressRef = useRef<number>(0)

    const isImageLoaded = loadedIndex === artworks.currentArtworkIndex; // Derived from loadedIndex

    useEffect(() => {
        if (vport.width && vport.height) {
            if (vport.width > 767) {
                setArtworkContainerHeight(vport.height - 125)
                setArtworkContainerWidth(vport.height - 125)
            } else {
                setArtworkContainerWidth(vport.width - 50);
                setArtworkContainerHeight(vport.width - 50);
            }
        }
    }, [vport])

    // Keep the ref in sync with context
    useEffect(() => {
        currentIndexRef.current = artworks.currentArtworkIndex;
    }, [artworks.currentArtworkIndex]);

    // Stable updateProgress function using useCallback
    const updateProgress = useCallback(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const newProgress = Math.min((elapsed / autoPlayInterval) * 100, 100);
        
        pausedProgressRef.current = newProgress;

        // Update every frame (remove throttling for now to ensure smooth resets)
        setArtworks(prevState => ({
            ...prevState,
            slideshowTimerProgress: newProgress
        }));
        
        if (newProgress < 100) {
            animationRef.current = requestAnimationFrame(updateProgress);
        } else {
            animationRef.current = null;
        }
    }, [autoPlayInterval, setArtworks]);

    // Reset progress and loadedIndex when index changes
    useEffect(() => {
        pausedProgressRef.current = 0;
        
        setArtworks(prevState => ({
            ...prevState,
            slideshowTimerProgress: 0
        }));

        setLoadedIndex(-1); // Reset loaded index to force wait for new onLoad
    }, [artworks.currentArtworkIndex, setArtworks]);

    // Handle progress animation
    useEffect(() => {
        // Clean up any existing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        if (artworks.slideshowPlaying && isImageLoaded) {
            // Reset start time when starting/resuming
            startTimeRef.current = Date.now() - (pausedProgressRef.current / 100) * autoPlayInterval;
            animationRef.current = requestAnimationFrame(updateProgress);
        }
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [artworks.slideshowPlaying, isImageLoaded, autoPlayInterval, updateProgress, artworks.currentArtworkIndex]); // Added index to deps

    // Auto-play functionality - advance to next image
    useEffect(() => {
        // Clear any existing timeout
        if (intervalRef.current) {
            clearTimeout(intervalRef.current);
            intervalRef.current = null;
        }

        if (artworks.slideshowPlaying && artworks.filtered.length > 1 && isImageLoaded) {
            const remainingTime = autoPlayInterval - (pausedProgressRef.current / 100) * autoPlayInterval;
            
            intervalRef.current = setTimeout(() => {
                const nextIndex = currentIndexRef.current === artworks.filtered.length - 1 
                    ? 0 
                    : currentIndexRef.current + 1;
                
                pausedProgressRef.current = 0; // Reset ref sync
                
                setArtworks(state => ({
                    ...state,
                    slideshowTimerProgress: 0, // Reset in same update
                    currentArtworkIndex: nextIndex
                }));
            }, remainingTime);
        }

        return () => {
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [artworks.slideshowPlaying, artworks.filtered.length, isImageLoaded, autoPlayInterval, setArtworks, artworks.currentArtworkIndex]); // Added index to deps

    // Update context progress when paused
    useEffect(() => {
        if (!artworks.slideshowPlaying && pausedProgressRef.current > 0) {
            setArtworks(prevState => ({
                ...prevState,
                slideshowTimerProgress: pausedProgressRef.current
            }));
        }
    }, [artworks.slideshowPlaying, setArtworks]);

    const handleImageLoad = useCallback(() => {
        setLoadedIndex(artworks.currentArtworkIndex); // Set to current index on load
    }, [artworks.currentArtworkIndex]);

    const currentArtwork = artworks.filtered[artworks.currentArtworkIndex];
    
    // Extract image dimensions from artwork
    const imageWidth = currentArtwork?.artworkFields?.artworkImage?.node?.mediaDetails?.width || 800;
    const imageHeight = currentArtwork?.artworkFields?.artworkImage?.node?.mediaDetails?.height || 800;
    const artworkSize = 'lg'; // Default size, as not provided in artwork object

    const { displayWidth, displayHeight } = useArtworkDimensions({
        imageWidth,
        imageHeight,
        artworkSize,
        artworkContainerWidth,
        artworkContainerHeight,
        useImageFactors: false
    });
    
    if (!currentArtwork) {
        return null;
    }

    const imageNode = currentArtwork.artworkFields?.artworkImage?.node; 
    const imageSrc = imageNode?.sourceUrl || '';
    const imageSrcSet = imageNode?.srcSet || '';
    const artworkTitle = currentArtwork.title || 'Artwork Image';

    return (
        <div className="artworks-slideshow__container">
            <Image 
                key={artworks.currentArtworkIndex} // Key ensures remount on index change
                src={imageSrc}
                {...(imageSrcSet && { srcSet: imageSrcSet })}
                alt={artworkTitle}
                width={displayWidth || Number(artworkContainerWidth) * .7} 
                height={displayHeight || Number(artworkContainerHeight) * .7}
                style={{ objectFit: 'contain' }}
                onLoad={handleImageLoad}
            />
        </div>
    )
}

export default ArtworksSlideshow