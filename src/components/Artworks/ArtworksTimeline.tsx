'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import ArtworkDetail from '@/components/Artworks/ArtworkDetail'
import ArtworkTitle from '@/components/Artworks/ArtworkTitle'
import Loading from '@/components/Loading'

import LeftArrowSvg from '@/svgs/LeftArrowSvg'
import RightArrowSvg from '@/svgs/RightArrowSvg'

import useWindowSize from '@/hooks/useWindowSize'

import { SortingType } from '@/types/timlineTypes'
import {
    generateTimeline,
    generateSmallLines
} from '@/helpers/timeline'

const ArtworksTimeline = () => {
    const [artworks, setArtworks] = useArtworks()
    
    const artworkTimelineRef = useRef<HTMLDivElement>(null)

    const vport = useWindowSize()
    const [artworkContainerWidth, setArtworkContainerWidth] = useState<number>(0)
    const [artworkContainerHeight, setArtworkContainerHeight] = useState<number>(0)
    const [artworkDesktopSideWidth, setArtworkDektopSideWidth] = useState<number>(0)
    const [totalTimelineWidth, setTotalTimelineWidth] = useState<number>(0)
    const [totalTimelineHeight, setTotalTimelineHeight] = useState<number>(0)
    const [isReady, setIsReady] = useState<boolean>(false)
 
    const isProgramScroll = useRef<boolean>(false)
    const hasUserScrolledRef = useRef<boolean>(false)

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
            artworks: artworks.filtered,
            sorting: artworks.sorting as SortingType,
            artworkContainerWidth,
            artworkContainerHeight,
            desktopSideWidth: artworkDesktopSideWidth,
            viewportWidth: vport.width || 0,
            viewportHeight: vport.height || 0
        });
    }, [artworks.filtered, artworks.sorting, artworkContainerWidth, artworkContainerHeight, artworkDesktopSideWidth, vport.width, vport.height]);

    useEffect(() => {
        setTotalTimelineWidth(formattedArtworks.totalTimelineWidth);
        setTotalTimelineHeight(formattedArtworks.totalTimelineHeight);
    }, [formattedArtworks.totalTimelineWidth, formattedArtworks.totalTimelineHeight])

    // Check if everything is ready to display
    useEffect(() => {
        const hasArtworks = formattedArtworks.artworksArray.length > 0;
        const hasDimensions = artworkContainerWidth > 0 && artworkContainerHeight > 0;
        const hasViewport = vport.width && vport.height;
        
        if (hasArtworks && hasDimensions && hasViewport) {
            setIsReady(true);
        } else {
            setIsReady(false);
        }
    }, [formattedArtworks.artworksArray.length, artworkContainerWidth, artworkContainerHeight, vport.width, vport.height]);

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
            isProgramScroll.current = false;
        }, 500);        
    }, [artworks.currentArtworkIndex, vport.width, formattedArtworks.artworksArray, setArtworks]);

    const scrollNext = (): void => {
        if (isProgramScroll.current) return;

        const nextIndex = artworks.currentArtworkIndex < formattedArtworks.artworksArray.length - 1 
            ? artworks.currentArtworkIndex + 1 
            : 0;
        
        scrollToIndex(nextIndex);
    };

    const scrollPrevious = (): void => {
        if (isProgramScroll.current) return;

        const prevIndex = artworks.currentArtworkIndex > 0 
            ? artworks.currentArtworkIndex - 1 
            : formattedArtworks.artworksArray.length - 1;
        
        scrollToIndex(prevIndex);
    };

    useEffect(() => {
        if (artworks.isTimelineScrollingProgamatically) {
            scrollToIndex(artworks.currentArtworkIndex);
            
            setTimeout(() => {
                setArtworks(prev => ({ ...prev, isTimelineScrollingProgamatically: false }));
            }, 500);
        }
    }, [artworks.isTimelineScrollingProgamatically, artworks.currentArtworkIndex, scrollToIndex, setArtworks]);
    
    const handleArtScroll = useCallback(() => {
        if (isProgramScroll.current || artworks.isTimelineScrollingProgamatically) {
            return;
        }
        
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
            targetSpacing: 20
        });
    }, [
        vport.width,
        totalTimelineHeight,
        totalTimelineWidth,
        artworkContainerHeight,
        artworkContainerWidth,
        artworkDesktopSideWidth
    ]);

    if (!isReady) {
        return <Loading />;
    }

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
                                    marginRight: vport.width && vport.width > 767 && index < artworks.filtered.length - 1 ? `${artwork.marginRight || 0}px` : '0px',
                                    marginBottom: vport.width && vport.width <= 767 && index < artworks.filtered.length - 1 ? `${artwork.marginBottom || 0}px` : '0px',
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
                            width: vport.width && vport.width > 767 ? `${formattedArtworks.totalTimelineWidth - artworkContainerWidth - (artworkDesktopSideWidth * 2)}px` : '1px',
                            height: vport.width && vport.width > 767 ? '1px' : `${formattedArtworks.totalTimelineHeight - artworkContainerHeight}px`,
                            left: vport.width && vport.width > 767 ? `${artworkContainerWidth / 2}px` : '24px',
                            top: vport.width && vport.width > 767 ? '24px' : `${artworkContainerHeight / 2}px`,
                        }}
                    />
                    <div 
                        className="artworks-timeline__small-lines"
                        style={{
                            marginLeft: vport.width && vport.width > 767 ? `${artworkContainerWidth / 2}px` : '0px',
                            marginTop: vport.width && vport.width > 767 ? '0px' : `${artworkContainerHeight / 2}px`,
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
                        onClick={scrollPrevious}    
                    >
                        <LeftArrowSvg />
                    </div>
                    <div 
                        className="artworks-timeline__control"
                        onClick={scrollNext}    
                    >
                        <RightArrowSvg />
                    </div>
                </div>
            )}
        </div>
    )
}

export default ArtworksTimeline