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
    const [imageLoaded, setImageLoaded] = useState<boolean>(false)
    const vport = useWindowSize()
    const [artworkContainerWidth, setArtworkContainerWidth] = useState<number>(0);
    const [artworkContainerHeight, setArtworkContainerHeight] = useState<number>(0);

    const currentIndexRef = useRef<number>(artworks.currentArtworkIndex)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const animationRef = useRef<number | null>(null)
    const startTimeRef = useRef<number>(0)
    const pausedProgressRef = useRef<number>(0)

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

        // Throttle updates to reduce re-renders
        setArtworks(prevState => {
            if (Math.abs(newProgress - prevState.slideshowTimerProgress) > 1) {
                return {
                    ...prevState,
                    slideshowTimerProgress: newProgress
                };
            }
            return prevState;
        });
        
        if (newProgress < 100) {
            animationRef.current = requestAnimationFrame(updateProgress);
        } else {
            animationRef.current = null;
        }
    }, [autoPlayInterval, setArtworks]);

    // Reset progress when slideshow opens or index changes
    useEffect(() => {
        setImageLoaded(false);
        pausedProgressRef.current = 0;
        
        setArtworks(prevState => ({
            ...prevState,
            slideshowTimerProgress: 0
        }));
    }, [artworks.currentArtworkIndex, setArtworks]);

    // Handle progress animation
    useEffect(() => {
        // Clean up any existing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        if (artworks.slideshowPlaying && imageLoaded) {
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
    }, [artworks.slideshowPlaying, imageLoaded, autoPlayInterval, updateProgress]);

    // Auto-play functionality - advance to next image
    useEffect(() => {
        // Clear any existing timeout
        if (intervalRef.current) {
            clearTimeout(intervalRef.current);
            intervalRef.current = null;
        }

        if (artworks.slideshowPlaying && artworks.filtered.length > 1 && imageLoaded) {
            const remainingTime = autoPlayInterval - (pausedProgressRef.current / 100) * autoPlayInterval;
            
            intervalRef.current = setTimeout(() => {
                const nextIndex = currentIndexRef.current === artworks.filtered.length - 1 
                    ? 0 
                    : currentIndexRef.current + 1;
                
                setArtworks(state => ({
                    ...state,
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
    }, [artworks.slideshowPlaying, artworks.filtered.length, imageLoaded, autoPlayInterval, setArtworks, artworks.currentArtworkIndex]);

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
        setImageLoaded(true);
    }, []);

    const currentArtwork = artworks.filtered[artworks.currentArtworkIndex];
    
    const { displayWidth, displayHeight } = useArtworkDimensions({
        artwork: currentArtwork,
        artworkContainerWidth,
        artworkContainerHeight
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
                src={imageSrc}
                {...(imageSrcSet && { srcSet: imageSrcSet })}
                alt={artworkTitle}
                width={displayWidth || artworkContainerWidth * .7} 
                height={displayHeight || artworkContainerHeight * .7}
                style={{ objectFit: 'contain' }}
                onLoad={handleImageLoad}
            />
        </div>
    )
}

export default ArtworksSlideshow