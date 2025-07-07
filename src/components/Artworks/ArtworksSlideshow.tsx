import React, { useState, useEffect, useRef, useContext } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider';

// import ArtworkDetail from './ArtworkDetail';

import { Artwork } from '@/types/artworks'

interface ArtworksSlideshowProps {
  filteredArtworks: Artwork[];
  autoPlayInterval?: number;
}

const ArtworksSlideshow: React.FC<ArtworksSlideshowProps> = ({ 
    filteredArtworks, 
    autoPlayInterval = 5000
}) => {
    const [artworks, setArtworks] = useContext(ArtworksContext);
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    const currentIndexRef = useRef<number>(artworks.currentArtworkIndex)
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<number | null>(null); // Store the animation frame ID here
    const startTimeRef = useRef<number>(0);
    const pausedProgressRef = useRef<number>(0); // Store paused progress
    const progressRef = useRef<number>(0); // Store progress value

    // Keep the ref in sync with context
    useEffect(() => {
        currentIndexRef.current = artworks.currentArtworkIndex;
    }, [artworks.currentArtworkIndex]);

    // Initialize start time when slideshow starts for the first time or when image changes
    useEffect(() => {
        // When slideshow is first shown, ensure it starts with the current index
        if (artworks.showSlideshow) {
            // Reset progress for the current image
            pausedProgressRef.current = 0;
            progressRef.current = 0;
            setImageLoaded(false);
            
            // Update progress in context
            setArtworks(prevState => ({
                ...prevState,
                slideshowTimerProgress: 0
            }));
        }
    }, [artworks.showSlideshow]);

    // Update Progress
    const updateProgress = () => {
        if (!artworks.slideshowPlaying) return;
        
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const newProgress = Math.min((elapsed / autoPlayInterval) * 100, 100);
        
        // Store progress in refs
        pausedProgressRef.current = newProgress;
        progressRef.current = newProgress

        // Update context with current progress - but throttle updates to reduce re-renders
        if (Math.abs(newProgress - artworks.slideshowTimerProgress) > 1) {
            setArtworks(prevState => ({
                ...prevState,
                slideshowTimerProgress: newProgress
            }));
        }
        
        if (newProgress < 100) {
            animationRef.current = requestAnimationFrame(updateProgress);
        } else {
            animationRef.current = null;
        }
    };

    // Handle progress animation
    useEffect(() => {
        if (artworks.slideshowPlaying && imageLoaded) {
            startTimeRef.current = Date.now() - (pausedProgressRef.current / 100) * autoPlayInterval;
            animationRef.current = requestAnimationFrame(updateProgress);
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        }
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = null;
            }
        };
    }, [artworks.slideshowPlaying, imageLoaded]);

    // Auto-play functionality - advance to next image
    useEffect(() => {
        if (artworks.slideshowPlaying && filteredArtworks.length > 1 && imageLoaded) {
            const remainingTime = autoPlayInterval - (pausedProgressRef.current / 100) * autoPlayInterval;
            
            intervalRef.current = setTimeout(() => {
                // Calculate next index using the ref
                const nextIndex = currentIndexRef.current === filteredArtworks.length - 1 
                    ? 0 
                    : currentIndexRef.current + 1;
                
                // Update context with new index
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
    }, [artworks.slideshowPlaying, filteredArtworks.length, imageLoaded]);

    // Reset progress only when index changes (new image)
    useEffect(() => {
        setImageLoaded(false);
        pausedProgressRef.current = 0; // Reset paused progress for new image
        progressRef.current = 0;

        // Reset progress in context when image changes
        setArtworks(prevState => ({
            ...prevState,
            slideshowTimerProgress: 0
        }));
    }, [artworks.currentArtworkIndex]);

    // Update context progress when paused
    useEffect(() => {
        if (!artworks.slideshowPlaying) {
            setArtworks(prevState => ({
                ...prevState,
                slideshowTimerProgress: pausedProgressRef.current
            }));
        }
    }, [artworks.slideshowPlaying]);

    const handleImageLoad = () => {
        setImageLoaded(true);
        startTimeRef.current = Date.now(); // Reset start time when image loads
    };

    const currentArtwork = filteredArtworks[artworks.currentArtworkIndex];

    return (
        <div className="artworks-slideshow__container">
            {/* Render the slideshow content */}
            <img 
                src={currentArtwork.artworkFields.artworkImage.mediaItemUrl}
                style={{
                    width: 300,
                    height: 300
                }}
                onLoad={handleImageLoad}
            />
        </div>
    )
    
}

export default ArtworksSlideshow
