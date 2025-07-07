import React, { useState, useEffect, useRef, useContext } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider';

// import ArtworkDetail from './ArtworkDetail';

import { Artwork } from '@/types/artworks'

interface ArtworksSlideshowProps {
  filteredArtworks: Artwork[];
  initialIndex?: number;
  autoPlayInterval?: number; // in milliseconds
  onClose?: () => void; 
}

const ArtworksSlideshow: React.FC<ArtworksSlideshowProps> = ({ 
    filteredArtworks, 
    initialIndex = 0, 
    autoPlayInterval = 5000
}) => {
    const [artworks, setArtworks] = useContext(ArtworksContext);
    const [currentIndex, setCurrentIndex] = useState<number>(initialIndex)
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<number | null>(null); // Store the animation frame ID here
    const startTimeRef = useRef<number>(0);
    const pausedProgressRef = useRef<number>(0); // Store paused progress

    // Initialize start time when slideshow starts for the first time or when image changes
    useEffect(() => {
        if (artworks.slideshowPlaying && imageLoaded) {
            // Calculate adjusted start time based on paused progress
            const adjustedStartTime = Date.now() - (pausedProgressRef.current / 100) * autoPlayInterval;
            startTimeRef.current = adjustedStartTime;
        }
    }, [artworks.slideshowPlaying, imageLoaded, autoPlayInterval]);

    // Update Progress
    const updateProgress = () => {
        if (!artworks.slideshowPlaying) return;
        
        const now = Date.now();
        const elapsed = now - startTimeRef.current;
        const newProgress = Math.min((elapsed / autoPlayInterval) * 100, 100);
        
        // setProgress(newProgress);
        pausedProgressRef.current = newProgress; // Always update paused progress

        // Update context with current progress
        setArtworks(prevState => ({
            ...prevState,
            slideshowTimerProgress: newProgress
        }));
        
        if (newProgress < 100) {
            animationRef.current = requestAnimationFrame(updateProgress);
        }
    };

    // Handle progress animation
    useEffect(() => {
        if (artworks.slideshowPlaying && imageLoaded) {
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
    }, [artworks.slideshowPlaying, imageLoaded ]);

    // Auto-play functionality - advance to next image
    useEffect(() => {
        if (artworks.slideshowPlaying && filteredArtworks.length > 1 && imageLoaded) {
            const remainingTime = autoPlayInterval - (pausedProgressRef.current / 100) * autoPlayInterval;
            
            intervalRef.current = setTimeout(() => {
                setCurrentIndex((prevIndex) => 
                    prevIndex === filteredArtworks.length - 1 ? 0 : prevIndex + 1
                );
            }, remainingTime);
        }

        return () => {
            if (intervalRef.current) {
                clearTimeout(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [artworks.slideshowPlaying, filteredArtworks.length, autoPlayInterval, imageLoaded, currentIndex]);

    // Reset progress only when index changes (new image)
    useEffect(() => {
        setImageLoaded(false);
        pausedProgressRef.current = 0; // Reset paused progress for new image
        
        // Reset progress in context when image changes
        setArtworks(prevState => ({
            ...prevState,
            slideshowProgress: 0
        }));
    }, [currentIndex, setArtworks]);

    // Update context progress when paused (so circle animation shows current position)
    useEffect(() => {
        if (!artworks.slideshowPlaying) {
            setArtworks(prevState => ({
                ...prevState,
                slideshowProgress: pausedProgressRef.current
            }));
        }
    }, [artworks.slideshowPlaying, setArtworks]);

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const currentArtwork = filteredArtworks[currentIndex];

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
