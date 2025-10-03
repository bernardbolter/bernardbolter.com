'use client'

import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { ArtworksContext } from '@/providers/ArtworkProvider';
import ArtworkDetail from '@/components/Artworks/ArtworkDetail';
import ArtworkTitle from '@/components/Artworks/ArtworkTitle';

import LeftArrowSvg from '@/svgs/LeftArrowSvg';
import RightArrowSvg from '@/svgs/RightArrowSvg';

import useWindowSize from '@/hooks/useWindowSize';

import { Artwork } from '@/types/artworks';
import { SortingType } from '@/types/timline';
import {
    generateTimeline,
    generateSmallLines
} from '@/helpers/timeline';

interface ArtworksTimelineProps {
  filteredArtworks: Artwork[];
}

const ArtworksTimeline: React.FC<ArtworksTimelineProps> = ({ filteredArtworks = [] }) => {
    const [artworks, setArtworks] = useContext(ArtworksContext);
    
    const artworkTimelineRef = useRef<HTMLDivElement>(null);

    const vport = useWindowSize(); // Get the size of the viewport
    const [artworkContainerWidth, setArtworkContainerWidth] = useState<number>(0);
    const [artworkContainerHeight, setArtworkContainerHeight] = useState<number>(0);
    const [artworkDesktopSideWidth, setArtworkDektopSideWidth] = useState<number>(0);
    const [totalTimelineWidth, setTotalTimelineWidth] = useState<number>(0);
    const [totalTimelineHeight, setTotalTimelineHeight] = useState<number>(0);
 
    const isProgramScroll = useRef<boolean>(false);
    const hasUserScrolledRef = useRef<boolean>(false);

    // set width and height of each artwork container
    useEffect(() => {
        if (vport.width && vport.height) {
            if (vport.width > 767) {
                setArtworkContainerHeight(vport.height - 125)
                setArtworkContainerWidth(vport.height - 125)
                setArtworkDektopSideWidth(((vport.width) - (vport.height - 125))  / 2);
            } else {
                setArtworkContainerWidth(vport.width - 50);
                setArtworkContainerHeight(vport.width - 50);
                setArtworkDektopSideWidth(0);
            }
        }
    }, [vport])


    const formattedArtworks = useMemo(() => {
        return generateTimeline({
            artworks: filteredArtworks,
            sorting: artworks.sorting as SortingType,
            artworkContainerWidth,
            artworkContainerHeight,
            desktopSideWidth:artworkDesktopSideWidth,
            viewportWidth: vport.width || 0,
            viewportHeight: vport.height || 0
        });
    }, [filteredArtworks, artworks.sorting, artworkContainerWidth, artworkContainerHeight, artworkDesktopSideWidth, vport.width, vport.height]);

    console.log("Formatted artworks:", formattedArtworks);

    useEffect(() => {
        setTotalTimelineWidth(formattedArtworks.totalTimelineWidth);
        setTotalTimelineHeight(formattedArtworks.totalTimelineHeight);
    }, [formattedArtworks.totalTimelineWidth, formattedArtworks.totalTimelineHeight])

    // calculate scrollable dimensions
    // const totalTimelineWidth = useMemo(() => {
    //     return calculateTotalTimelineWidth(formattedArtworks, artworkContainerWidth, artworkDesktopSideWidth);
    // }, [formattedArtworks, artworkContainerWidth, artworkDesktopSideWidth]);

    // const totalTimelineHeight = useMemo(() => {
    //     return calculateTotalTimelineHeight(formattedArtworks, artworkContainerHeight);
    // }, [formattedArtworks, artworkContainerHeight]);

    // // calculate scroll points for centering artworks
    // const horizontalScrollPoints = useMemo(() => {
    //     return calculateHorizontalScrollPoints(formattedArtworks, artworkContainerWidth, artworkDesktopSideWidth, vport.width || 0 );
    // }, [formattedArtworks, artworkContainerWidth, artworkDesktopSideWidth, vport.width]);

    // const verticalScrollPoints = useMemo(() => {
    //     return calculateVerticalScrollPoints(formattedArtworks, artworkContainerHeight, vport.height || 0);
    // }, [formattedArtworks, artworkContainerHeight, vport.height]);




    const scrollToIndex = useCallback((index: number): void => {
        if (index < 0 || index >= formattedArtworks.artworksArray.length) return;

        isProgramScroll.current = true;

        if (index !== artworks.currentArtworkIndex) {
            setArtworks(state => ({ ...state, currentArtworkIndex: index }));
        }

        const isMobile = vport.width && vport.width <= 767;

        if (isMobile) {
            const scrollPosition = formattedArtworks.artworksArray[index].verticalScrollPoint;
            artworkTimelineRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth'});
        } else {
            const scrollPosition = formattedArtworks.artworksArray[index].horizontalScrollPoint;
            artworkTimelineRef.current?.scrollTo({ left: scrollPosition, behavior: 'smooth'});
        }
        setTimeout(() => {
            isProgramScroll.current = false; // Reset flag after scrolling completes
        }, 500);        
    }, [formattedArtworks.artworksArray.length, vport.width, formattedArtworks.artworksArray, setArtworks]);

    const scrollNext = (): void => {
        if (isProgramScroll.current) return; // Skip if scrolling is already in progress

        const nextIndex = artworks.currentArtworkIndex < formattedArtworks.artworksArray.length - 1 
            ? artworks.currentArtworkIndex + 1 
            : 0;
        
        console.log("Scrolling to next index:", nextIndex);
        scrollToIndex(nextIndex);
    };

    const scrollPrevious = (): void => {
        if (isProgramScroll.current) return; // Skip if scrolling is already in progress

        const prevIndex = artworks.currentArtworkIndex > 0 
            ? artworks.currentArtworkIndex - 1 
            : formattedArtworks.artworksArray.length - 1;
        
        console.log("Scrolling to previous index:", prevIndex);
        scrollToIndex(prevIndex);
    };

    // Effect to scroll to currentArtworkindex when the slideshow closes
    useEffect(() => {
        if (artworks.isTimelineScrollingProgamatically) {
            scrollToIndex(artworks.currentArtworkIndex);
            
            // Reset the flag after scrolling
            setTimeout(() => {
                setArtworks(prev => ({ ...prev, isTimelineScrollingProgamatically: false }));
            }, 500);
        }
    }, [artworks.isTimelineScrollingProgamatically, artworks.currentArtworkIndex, scrollToIndex, setArtworks]);
    
    const handleArtScroll = useCallback(() => {
        // Skip if programmatic scrolling is active
        if (isProgramScroll.current || artworks.isTimelineScrollingProgamatically) {
            return;
        }
        
        // This is manual user scrolling - update the current artwork index
        if (artworkTimelineRef.current) {
            const isMobile = vport.width && vport.width <= 767;
            let currentScrollPosition: number = 0;
            let artworkDimension: number = 0;
            let viewportDimension: number = 0;
            let sideOffset: number = 0;

            if (isMobile) {
                currentScrollPosition = artworkTimelineRef.current.scrollTop;
                viewportDimension = vport.height || 0;
                artworkDimension = artworkContainerHeight;
            } else {
                currentScrollPosition = artworkTimelineRef.current.scrollLeft;
                artworkDimension = artworkContainerWidth;
                viewportDimension = vport.width || 0;
                sideOffset = artworkDesktopSideWidth;
            }

            const viewportCenterAbsolute = currentScrollPosition + (viewportDimension / 2); 

            let bestIndex = 0
            let minDistance = Infinity;
            let accumulatedDimension = sideOffset;

            formattedArtworks.artworksArray.forEach((artwork, index) => {
                const artworkStart = accumulatedDimension;
                const artworkCenter = artworkStart + (artworkDimension / 2);
                const distance = Math.abs(artworkCenter - viewportCenterAbsolute);

                if (distance < minDistance) {
                    minDistance = distance;
                    bestIndex = index;
                }

                accumulatedDimension += artworkDimension;
                if (index < formattedArtworks.artworksArray.length - 1) {
                    if (isMobile) {
                        accumulatedDimension += artwork.marginBottom;
                    } else {
                        accumulatedDimension += artwork.marginRight;
                    }
                }
            });

            if (bestIndex !== artworks.currentArtworkIndex) {
                setArtworks(state => ({ ...state, currentArtworkIndex: bestIndex }));
            }
        }
    }, [vport, artworkContainerHeight, artworkContainerWidth, artworkDesktopSideWidth, formattedArtworks, artworks.currentArtworkIndex, artworks.isTimelineScrollingProgamatically, setArtworks]);

    useEffect(() => {
        // Only reset hasUserScrolledRef if the index change was programmatic
        if (isProgramScroll.current) {
            hasUserScrolledRef.current = false;
        }
    }, [artworks.currentArtworkIndex]);

    useEffect(() => {
        const currentElement = artworkTimelineRef.current;

        if (currentElement) {
            currentElement.addEventListener('scroll', handleArtScroll);
        }

        return () => {
            if (currentElement) {
                currentElement.removeEventListener('scroll', handleArtScroll);
            }
        };
    }, [handleArtScroll]);


    const smallLines = useMemo(() => {
        const isMobile: boolean = Boolean(vport.width && vport.width <= 767);
        
        return generateSmallLines({
            isMobile,
            totalTimelineHeight,
            totalTimelineWidth,
            artworkContainerHeight,
            artworkContainerWidth,
            artworkDesktopSideWidth,
            targetSpacing: 20 // Optional: customize spacing
        });
    }, [
        vport.width,
        totalTimelineHeight,
        totalTimelineWidth,
        artworkContainerHeight,
        artworkContainerWidth,
        artworkDesktopSideWidth
    ]);

    return (
        <div className="artworks-timeline__container">
            <ArtworkTitle formattedArtworks={formattedArtworks} />
            <div 
                className="artworks-timeline__artworks-container"
                ref={artworkTimelineRef}
                style={{ 
                    width: '100%',
                    height: vport.width && vport.height && vport.width > 767 ? `${vport.height}px` : '100vh'
                }}  
            >

                <div
                    className="artworks-timeline__artworks"
                    style={{
                        width: vport.width && vport.width > 767 ? `${formattedArtworks.totalTimelineWidth}px` : 'auto',
                        height: vport.width && vport.width <= 767 ? `${formattedArtworks.totalTimelineHeight}px` : 'auto',
                        paddingLeft: vport.width && vport.width > 767 ? `${artworkDesktopSideWidth}px` : '0px',
                        paddingRight: vport.width && vport.width > 767 ? `${artworkDesktopSideWidth}px` : '0px',
                    }}
                >
                    {formattedArtworks.artworksArray.map((artwork, index) => {
                        return (
                            <div
                                className="artworks-timeline__artwork-inside"
                                key={artwork.id}
                                style={{
                                    marginRight: vport.width && vport.width > 767 && index < filteredArtworks.length - 1 ? `${artwork.marginRight || 0}px` : '0px',
                                    marginBottom: vport.width && vport.width <= 767 && index < filteredArtworks.length - 1 ? `${artwork.marginBottom || 0}px` : '0px',
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
                        )
                    })}
                </div>

                <div
                    className="artworks-timeline__timeline-container"
                    style={{
                        width: vport.width && vport.width > 767 ? `${formattedArtworks.totalTimelineWidth - (artworkDesktopSideWidth * 2)}px` : '50px',
                        height: vport.width && vport.width <= 767 ? `${formattedArtworks.totalTimelineHeight}px` : '50px',
                        marginLeft: vport.width && vport.width > 767 ? `${artworkDesktopSideWidth}px` : '0px',
                        marginRight: vport.width && vport.width > 767 ? `${artworkDesktopSideWidth}px` : '0px',
                    }}
                >
                    <div
                        className="artworks-timeline__line"
                        style={{
                            width: vport.width && vport.width > 767 ? `${formattedArtworks.totalTimelineWidth - artworkContainerWidth - (artworkDesktopSideWidth * 2) }px` : '1px',
                            height: vport.width && vport.width > 767 ? '1px' :`${formattedArtworks.totalTimelineHeight - artworkContainerHeight}px`,
                            left: vport.width && vport.width > 767 ? `${artworkContainerWidth / 2}px` : '24px',
                            top: vport.width && vport.width > 767 ? '24px' : `${artworkContainerHeight / 2}px`,
                        }}
                    />
                    <div 
                        className="artworks-timeline__small-lines"
                        style={{
                            marginLeft: vport.width && vport.width > 767 ? `${artworkContainerWidth / 2}px` : '0px',
                            marginTop: vport.width && vport.width > 767 ?  '0px' : `${artworkContainerHeight / 2}px`,
                        }}    
                    >
                        {smallLines}
                    </div>
                    <div 
                        className="artworks-timeline__year-markers"
                        style={{
                            left: vport.width && vport.width > 767 ? `-${artworkContainerWidth / 2}px` : '0px',
                            top: vport.width && vport.width > 767 ? '0px' : `-${artworkContainerHeight / 2}px`,
                        }}
                    >
                        {formattedArtworks.timepointsArray.map(yearMarker => {
                            return (
                                <div
                                    key={yearMarker.id}
                                    className="artworks-timeline__year-marker"
                                    style={{
                                        left: vport.width && vport.width > 767 ? `${(artworkContainerWidth / 2) + yearMarker.distanceFromStart}px` : '0px',
                                        top: vport.width && vport.width <= 767 ? `${(artworkContainerHeight / 2) + yearMarker.distanceFromStart}px` : '0px',
                                    }}
                                >
                                    <div className="artworks-timeline__year-tick" />
                                    {yearMarker.isVisible && (
                                        <span className="artworks-timeline__year-label">{yearMarker.year}</span>
                                    )}
                                </div>
                            )})}
                    </div> 
                </div>
            </div>

            {vport.width && vport.width > 767 && (
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
            )}
            
        </div>
    )
}

export default ArtworksTimeline