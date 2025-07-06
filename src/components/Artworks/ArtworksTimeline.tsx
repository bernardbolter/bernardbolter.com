'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ArtworkDetail from '@/components/Artworks/ArtworkDetail';

import LeftArrowSvg from '@/svgs/LeftArrowSvg';
import RightArrowSvg from '@/svgs/RightArrowSvg';

import useWindowSize from '@/hooks/useWindowSize';

import { Artwork } from '@/types/artworks';
import { formatFilteredArtworkWithTimeDIff } from '@/helpers'; 

interface ArtworksTimelineProps {
  artworks: Artwork[];
}

const ArtworksTimeline: React.FC<ArtworksTimelineProps> = ({ artworks = [] }) => {
    const [currentIndex, setCurrentIndex] = useState<number>(0); // State to track the current index of the artwork being displayed
    const timelineRef = useRef<HTMLDivElement>(null);
    const vport = useWindowSize(); // Get the size of the viewport
    const [artworkContainerWidth, setArtworkContainerWidth] = useState<number>(0);
    const [artworkContainerHeight, setArtworkContainerHeight] = useState<number>(0);
    const [artworkDesktopSideWidth, setArtworkDektopSideWidth] = useState<number>(0);
    const isScrollingProgrammatically = useRef(false);


    // set width and height of each artwork container
    useEffect(() => {
        if (vport.width && vport.height) {
            if (vport.width > 767) {
                setArtworkContainerHeight(vport.height - 125)
                setArtworkContainerWidth(vport.height - 125)
                setArtworkDektopSideWidth(((vport.width) - (vport.height - 125))  / 2);
            } else {
                setArtworkContainerWidth(vport.width * .9);
                setArtworkContainerHeight(vport.width * .9);
                setArtworkDektopSideWidth(0);
            }
        }
    }, [vport])

    const formattedArtworks = useMemo(() => {
        return formatFilteredArtworkWithTimeDIff(artworks, vport)
    }, [artworks, vport])

    // Calculate scroll position for a specific index
    const getScrollPosition = (index: number): number => {
        return index * (artworkContainerWidth);
    };

    // Scroll to specific index
    const scrollToIndex = (index: number): void => {
        if (timelineRef.current && index >= 0 && index < formattedArtworks.length) {
        const scrollPosition = getScrollPosition(index);
        timelineRef.current.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        setCurrentIndex(index);
        }
    };

    // Scroll to next image
    const scrollNext = (): void => {
        const nextIndex = currentIndex < formattedArtworks.length - 1 ? currentIndex + 1 : 0;
        scrollToIndex(nextIndex);
    };

    // Scroll to previous image
    const scrollPrevious = (): void => {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : formattedArtworks.length - 1;
        scrollToIndex(prevIndex);
    };

    // Keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.key === 'ArrowLeft') {
            console.log("key left")
            event.preventDefault();
            scrollPrevious();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            scrollNext();
        }
    };

     // Handle manual scroll detection
    const handleScroll = (): void => {
        if (timelineRef.current && !isScrollingProgrammatically.current) {
            const scrollLeft = timelineRef.current.scrollLeft;
            const containerWidth = timelineRef.current.clientWidth;
            const sideWidth = artworkDesktopSideWidth || 0;
            
            // Adjust scroll position to account for desktop side width
            const adjustedScrollLeft = scrollLeft - sideWidth;
            
            // Calculate which artwork is most visible
            let mostVisibleIndex = 0;
            let maxVisibleArea = 0;
            
            formattedArtworks.forEach((_, index) => {
                const artworkStart = index * artworkContainerWidth;
                const artworkEnd = artworkStart + artworkContainerWidth;
                
                // Calculate visible area of this artwork
                const visibleStart = Math.max(adjustedScrollLeft, artworkStart);
                const visibleEnd = Math.min(adjustedScrollLeft + containerWidth, artworkEnd);
                const visibleArea = Math.max(0, visibleEnd - visibleStart);
                
                if (visibleArea > maxVisibleArea) {
                    maxVisibleArea = visibleArea;
                    mostVisibleIndex = index;
                }
            });
            
            if (mostVisibleIndex !== currentIndex) {
                setCurrentIndex(mostVisibleIndex);
            }
        }
    };

    // Set up scroll event listener
    useEffect(() => {
        const scrollContainer = timelineRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll);
            handleScroll(); // Initial check
            
            return () => {
                scrollContainer.removeEventListener('scroll', handleScroll);
            };
        }
    }, [currentIndex, artworkContainerWidth, artworkDesktopSideWidth, formattedArtworks.length]);


    return (
        <div className="artworks-timeline__container">
            {formattedArtworks.length > 0 && (
                <div className="artworks-timeline__title-container">
                    <h1>{formattedArtworks[currentIndex].title}</h1>
                </div>
            )}
            <div
                ref={timelineRef}
                className="artwork-timeline__artworks"
                onKeyDown={handleKeyDown}
           >
                {(artworkDesktopSideWidth !== 0) && (
                    <div 
                        className="artwork-timeline__desktop-side"
                        style={{
                            minWidth: `${artworkDesktopSideWidth}px`,
                            minHeight: `${artworkContainerHeight}px`
                        }}    
                    >
                        <h1>Begining</h1>
                    </div>
                )}
                {formattedArtworks.map(artwork => {
                    return (
                        <div 
                            className="artworks-timeline__artwork-inside"
                            key={artwork.id}
                        >
                            <div
                                className="artworks-timeline__artwork--container"
                                style={{
                                    minWidth: `${artworkContainerWidth}px`,
                                    minHeight: `${artworkContainerHeight}px`,
                                }}
                            >
                                <ArtworkDetail 
                                    artwork={artwork} 
                                    artworkContainerWidth={artworkContainerWidth}
                                    artworkContainerHeight={artworkContainerHeight}   
                                />
                            </div>
                            <div 
                                className="artworks-timeline__timepoint" 
                                style={{
                                    width: `${artworkContainerWidth}px`
                                }}
                            >
                                <h3>2009</h3>
                            </div>
                        </div>
                    )
                })}
                 {(artworkDesktopSideWidth !== 0) && (
                    <div 
                        className="artwork-timeline__desktop-side"
                        style={{
                            minWidth: `${artworkDesktopSideWidth}px`,
                            minHeight: `${artworkContainerHeight}px`
                        }}    
                    >
                        <h1>end</h1>
                    </div>
                )}
            </div>

            <div className="artworks-timeline__controls-container">
                <div 
                    className="artworks-timeline__control"
                    onClick={() => {
                        console.log("left")
                        scrollPrevious()
                    }}    
                >
                    <LeftArrowSvg />
                </div>
                <div 
                    className="artworks-timeline__control"
                    onClick={() => {
                        console.log("right")
                        scrollNext()
                    }}    
                >
                    <RightArrowSvg />
                </div>
            </div>
        </div>
    )
}

export default ArtworksTimeline