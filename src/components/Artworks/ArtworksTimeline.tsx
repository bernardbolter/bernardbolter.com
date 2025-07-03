'use client'

import React, { useState, useEffect, useRef } from 'react';
import ArtworkDetail from '@/components/Artworks/ArtworkDetail'

import { Artwork } from '@/types/artworks';

interface ArtworksTimelineProps {
  artworks: Artwork[];
}

const ArtworksTimeline: React.FC<ArtworksTimelineProps> = ({ artworks = [] }) => {
    const [isMobile, setIsmobile] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0); // State to track the current index of the artwork being displayed 
    const timelineRef = useRef<HTMLDivElement>(null);

    return (
        <div className="artworks-timeline-container">
            {artworks.map(artwork => {
                // console.log("artwork", artwork.title)
                return <ArtworkDetail key={artwork.slug} artwork={artwork} />
            })}
        </div>
    )
}

export default ArtworksTimeline