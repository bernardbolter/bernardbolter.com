'use client'

import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { ArtworksContext } from '@/providers/ArtworkProvider';
import ArtworkDetail from '@/components/Artworks/ArtworkDetail';

import LeftArrowSvg from '@/svgs/LeftArrowSvg';
import RightArrowSvg from '@/svgs/RightArrowSvg';

import useWindowSize from '@/hooks/useWindowSize';

import { Artwork } from '@/types/artworks';
import { formatFilteredArtworkWithTimeMargin } from '@/helpers'; 

interface ArtworksTimelineProps {
  filteredArtworks: Artwork[];
}

const ArtworksTimeline: React.FC<ArtworksTimelineProps> = ({ filteredArtworks = [] }) => {
    const [artworks, setArtworks] = useContext(ArtworksContext);
    
    // const [currentIndex, setCurrentIndex] = useState<number>(0); // State to track the current index of the artwork being displayed
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
    const availableWidth = vport.width ? vport.width - (artworkDesktopSideWidth * 2) : undefined;
    return formatFilteredArtworkWithTimeMargin(filteredArtworks, availableWidth);
}, [filteredArtworks, vport, artworkDesktopSideWidth]);

    // Calculate timeline data for year display
    const timelineData = useMemo(() => {
        const data: Array<{
            year: string;
            isFirstOfYear: boolean;
            artworkIndex: number;
            rightPadding: number | null;
        }> = [];

        let previousYear = '';
        
        formattedArtworks.forEach((artwork, index) => {
            // Extract year from artwork data - adjust this based on your artwork data structure
            const currentYear = typeof artwork.date === "string" ? artwork.date.split('-')[0] : new Date(artwork.date).getFullYear().toString();
            const isFirstOfYear = currentYear !== previousYear;
            
            data.push({
                year: currentYear,
                isFirstOfYear,
                artworkIndex: index,
                rightPadding: formattedArtworks[index]?.timeMargin || 0
            });
            
            previousYear = currentYear;
        });

        return data;
    }, [formattedArtworks]);

    // Calculate scroll position for a specific index including margins
    const getScrollPosition = (index: number): number => {
        if (index < 0 || index >= formattedArtworks.length) return 0;
        
        const viewportWidth = vport.width || 0;
        const viewportCenter = viewportWidth / 2;
        const sideWidth = artworkDesktopSideWidth || 0;
        
        // Calculate the absolute position where the artwork's center should be
        let artworkCenterPosition = sideWidth; // Start after the left side panel
        
        // Add up all widths and margins before the target artwork
        for (let i = 0; i < index; i++) {
            // Add margin (only for artworks after the first one)
            if (i > 0) {
                artworkCenterPosition += formattedArtworks[i].timeMargin || 0;
            }
            // Add full width of this artwork
            artworkCenterPosition += artworkContainerWidth;
        }
        
        // Add margin for the target artwork (if it's not the last)
        if (index <formattedArtworks.length - 1) {
            artworkCenterPosition += formattedArtworks[index].timeMargin || 0;
        }
        
        // Add half width of target artwork to get to its center
        artworkCenterPosition += artworkContainerWidth / 2;
        
        // Calculate how much to scroll to center this artwork in the viewport
        const scrollPosition = artworkCenterPosition - viewportCenter;
        
        // Ensure we don't scroll to negative positions
        return Math.max(0, scrollPosition);
    };

    const getScrollPositionVertical = (index: number): number => {
        if (index < 0 || index >= formattedArtworks.length) return 0;

        const viewportHeight = vport.height || 0;
        const viewportCenter = viewportHeight / 2

        // Calculate the absolute position where the artwork's center should be
        let artworkCenterPosition = 0;

        // Add up all heights and margins before the target artwork
        for (let i = 0; i < index; i++) {
            artworkCenterPosition += artworkContainerHeight;
            if ( i < formattedArtworks.length - 1 ) {
                artworkCenterPosition += formattedArtworks[i].timeMargin || 0;
            }   
        }

        // Add half height of target artwork to get to its center
        artworkCenterPosition += artworkContainerHeight / 2;

        // Calculate how much to scroll to center this artwork in the viewport
        const scrollPosition = artworkCenterPosition - viewportCenter;

         return Math.max(0, scrollPosition); 
    }

    // Scroll to specific index
    const scrollToIndex = (index: number): void => {
        if (timelineRef.current && index >= 0 && index < formattedArtworks.length) {
            isScrollingProgrammatically.current = true;

            setArtworks(state => ({ ...state, currentArtworkIndex: index }))

            // const scrollPosition = getScrollPositionDebug(index); // Use debug version
            const isMobile = vport.width && vport.width <= 767;

            if (isMobile) {
                const scrollPosition = getScrollPositionVertical(index);
                timelineRef.current.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
            } else {
                const scrollPosition = getScrollPosition(index);
                timelineRef.current.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                })
            }
        }

        setTimeout(() => {
            isScrollingProgrammatically.current = false; // Reset flag after scrolling completes
        }, 500);
    };

    // Scroll to next image
    const scrollNext = (): void => {
        const nextIndex = artworks.currentArtworkIndex < formattedArtworks.length - 1 
            ? artworks.currentArtworkIndex + 1 
            : 0;
        
        console.log("Scrolling to next index:", nextIndex);
        scrollToIndex(nextIndex);
    };

    // Scroll to previous image
    const scrollPrevious = (): void => {
        const prevIndex = artworks.currentArtworkIndex > 0 
            ? artworks.currentArtworkIndex - 1 
            : formattedArtworks.length - 1;
        
        console.log("Scrolling to previous index:", prevIndex);
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

    useEffect(() => {
    // Only scroll if we're not already scrolling programmatically
        if (!isScrollingProgrammatically.current && timelineRef.current) {
            isScrollingProgrammatically.current = true;
            const scrollPosition = getScrollPosition(artworks.currentArtworkIndex);
            
            timelineRef.current.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
            
            setTimeout(() => {
                isScrollingProgrammatically.current = false;
            }, 500);
        }
    }, [artworks.currentArtworkIndex, vport.width]);

     // Handle manual scroll detection
    const handleScroll = (): void => {
        if (timelineRef.current && !isScrollingProgrammatically.current) {
            const isMobile = vport.width && vport.width <= 767;
            if (isMobile) {
                // handle vertical scroll
                const scrollTop = timelineRef.current.scrollTop;
                const viewportCenter = (vport.height || 0) / 2;
                const targetPosition = scrollTop + viewportCenter;

                let bestIndex = 0;
                let bestDistance = Infinity;
                let currentPosition = 0; // Start at the beginning

                for (let i = 0; i < formattedArtworks.length; i++) {
                    // calculate the center position of this artwork
                    const artworkCenterPosition = currentPosition + (artworkContainerHeight / 2);
                    // Calculate distance from target position
                    const distance = Math.abs(artworkCenterPosition - targetPosition);

                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestIndex = i;
                    }

                    // Move to next position
                    currentPosition += artworkContainerHeight;
                    // add margin for current artwork (skip for last artwork)
                    if (i < formattedArtworks.length - 1) {
                        currentPosition += formattedArtworks[i].timeMargin || 0;
                    }
                }

                // Only update the index, don't scroll to center
                if (bestIndex !== artworks.currentArtworkIndex) {
                    setArtworks(state => ({ ...state, currentArtworkIndex: bestIndex }));
                }
            } else {
                // handle horizontal scroll
                const scrollLeft = timelineRef.current.scrollLeft;
                const sideWidth = artworkDesktopSideWidth || 0;
                const viewportCenter = (vport.width || 0) / 2;
                // The position we're looking for in the absolute coordinate system
                const targetPosition = scrollLeft + viewportCenter;

                let bestIndex = 0;
                let bestDistance = Infinity;
                let currentPosition = sideWidth; // Start after the left side panel

                for (let i = 0; i < formattedArtworks.length; i++) {
                    // Add margin for current artwork (skip for last artwork)
                    if (i < formattedArtworks.length - 1) {
                        currentPosition += formattedArtworks[i].timeMargin || 0;
                    }
                    // Calculate the center position of this artwork
                    const artworkCenterPosition = currentPosition + (artworkContainerWidth / 2);

                    // Calculate distance from target position
                    const distance = Math.abs(artworkCenterPosition - targetPosition);

                    if (distance < bestDistance) {
                        bestDistance = distance;
                        bestIndex = i;
                    }
                    // Move to the next artwork position
                    currentPosition += artworkContainerWidth;
                }  
                // Only update the index, don't scroll to center
                if (bestIndex !== artworks.currentArtworkIndex) {
                    setArtworks(state => ({ ...state, currentArtworkIndex: bestIndex }));
                }
            }
        }
    };
    // Throttle the scroll handler to improve performance
    const throttledHandleScroll = () => {
        if (!isScrollingProgrammatically.current) {
            requestAnimationFrame(handleScroll);
        }
    };

    // Set up scroll event listener
    useEffect(() => {
        const scrollContainer = timelineRef.current;
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', throttledHandleScroll);
            
            return () => {
                scrollContainer.removeEventListener('scroll', throttledHandleScroll);
            };
        }
    }, [timelineRef.current, artworkContainerWidth, formattedArtworks.length]);

       // Generate small tick marks for timeline
    const renderSmallTicks = (isFirst: boolean, isLast: boolean) => {
        const tickCount = 10; // Number of small ticks between major points
        const ticks = [];
        const isMobile = vport.width && vport.width <= 767;
        
        for (let i = 0; i < tickCount; i++) {
            // Skip first half for first item and last half for last item
            if ((isFirst && i < tickCount/2) || (isLast && i >= tickCount/2)) {
                continue;
            }
            
            const position = (i + 1) * (100 / (tickCount + 1));
            const positionStyle = isMobile ? { top: `${position}%` } : { left: `${position}%` };
            ticks.push(
                <div 
                    key={`tick-${i}`} 
                    className="timeline-small-tick"
                    style={positionStyle}
                />
            );
        }
        
        return ticks;
    };

    return (
        <div className="artworks-timeline__container">
            {formattedArtworks.length > 0 && (
                <div className="artworks-timeline__title-container">
                    <h1>{formattedArtworks[artworks.currentArtworkIndex].title}</h1>
                </div>
            )}
            <div
                ref={timelineRef}
                className="artwork-timeline__artworks"
                onKeyDown={handleKeyDown}
                tabIndex={0}
           >
                {(artworkDesktopSideWidth !== 0) && (
                    <div 
                        className="artwork-timeline__desktop-side"
                        style={{
                            minWidth: `${artworkDesktopSideWidth}px`,
                            minHeight: `${artworkContainerHeight}px`
                        }}    
                    >
                        <h1>Beginning</h1>
                    </div>
                )}
                {formattedArtworks.map((artwork, index) => {
                    const timelineItem = timelineData[index];
                    const isFirst = index === 0;
                    const isLast = index === formattedArtworks.length - 1;

                    return (
                        <div 
                            className="artworks-timeline__artwork-inside"
                            key={artwork.id}
                            style={{
                                marginRight: vport.width && vport.width > 767 && index < filteredArtworks.length - 1 ? `${artwork.timeMargin || 0}px` : '0px',
                                marginBottom: vport.width && vport.width <= 767 && index < filteredArtworks.length - 1 ? `${artwork.timeMargin || 0}px` : '0px',
                            }}
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
                                    paddingRight: vport.width && vport.width > 767 ? `${timelineItem.rightPadding || 0}px` : '0px',
                                    paddingBottom: vport.width && vport.width <= 767 ? `${timelineItem.rightPadding || 0}px` : '0px',
                                }}    
                            >
                                <div 
                                    className={
                                        isFirst ? 'timeline-line-first' :
                                        isLast ? 'timeline-line-last' :
                                        'timeline-line'
                                    } 
                                />
                                {renderSmallTicks(isFirst, isLast)}
                                <div className="timeline-marker">
                                    <div className={`timeline-tick ${timelineItem.isFirstOfYear ? 'is-year-start' : ''}`}>
                                        {timelineItem.isFirstOfYear && (
                                            <span className="timeline-year">{timelineItem.year}</span>
                                        )}
                                    </div>
                                </div>
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