import React, { useState, useEffect, useRef, useContext } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider';

import ArtworkDetail from './ArtworkDetail';

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
    autoPlayInterval = 3000, 
    onClose 
}) => {
    const [artworks, setArtworks] = useContext(ArtworksContext);
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [isPlaying, setIsPlaying] = useState(true); // Add state for autoplay control
    const [imageLoaded, setImageLoaded] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-play functionality
  useEffect(() => {
        if (isPlaying && filteredArtworks.length > 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => 
                prevIndex === filteredArtworks.length - 1 ? 0 : prevIndex + 1
                );
            }, autoPlayInterval);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, filteredArtworks.length, autoPlayInterval]);

     // Reset image loaded state when index changes
    useEffect(() => {
        setImageLoaded(false);
    }, [currentIndex]);

    const togglePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const currentArtwork = filteredArtworks[currentIndex];

    return (
        <div className="artworks-slideshow-container">
            {/* Render the slideshow content */}
        </div>
    )
    
}

export default ArtworksSlideshow
