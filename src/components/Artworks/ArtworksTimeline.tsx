'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import ArtworkDetail from '@/components/Artworks/ArtworkDetail'
import ArtworkTitle from '@/components/Artworks/ArtworkTitle'
import Loading from '@/components/Loading'

import LeftArrowSvg from '@/svgs/LeftArrowSvg'
import RightArrowSvg from '@/svgs/RightArrowSvg'

import useWindowSize from '@/hooks/useWindowSize'

import { generateSmallLines } from '@/helpers/timeline'

const ArtworksTimeline = () => {
    const [artworks, setArtworks] = useArtworks()
    
    const artworkTimelineRef = useRef<HTMLDivElement>(null)

    const vport = useWindowSize()
    const [isReady, setIsReady] = useState<boolean>(false)
 
    const isProgramScroll = useRef<boolean>(false)
    const hasUserScrolledRef = useRef<boolean>(false)
    
    // Use refs to avoid recreating handleArtScroll on every state change
    const artworksRef = useRef(artworks)
    const vportRef = useRef(vport)
    
    // Keep refs in sync with state
    useEffect(() => {
        artworksRef.current = artworks
    }, [artworks])
    
    useEffect(() => {
        vportRef.current = vport
    }, [vport])

    // Update viewport dimensions in provider when they change
    useEffect(() => {
        if (vport.width && vport.height) {
            const viewportWidth = vport.width;
            const viewportHeight = vport.height;
            let artworkContainerWidth = 0;
            let artworkContainerHeight = 0;
            let artworkDesktopSideWidth = 0;

            if (viewportWidth > 767) {
                artworkContainerHeight = viewportHeight - 125;
                artworkContainerWidth = viewportHeight - 125;
                artworkDesktopSideWidth = Number((viewportWidth) - (viewportHeight - 125)) / 2;
            } else {
                artworkContainerWidth = Number(viewportWidth - 50);
                artworkContainerHeight = Number(viewportWidth - 50);
                artworkDesktopSideWidth = 0;
            }

            // Only update if values have actually changed to prevent unnecessary recalculations
            setArtworks(prev => {
                if (
                    prev.viewportWidth === viewportWidth &&
                    prev.viewportHeight === viewportHeight &&
                    prev.artworkContainerWidth === artworkContainerWidth &&
                    prev.artworkContainerHeight === artworkContainerHeight &&
                    prev.artworkDesktopSideWidth === artworkDesktopSideWidth
                ) {
                    return prev;
                }
                
                return {
                    ...prev,
                    viewportWidth,
                    viewportHeight,
                    artworkContainerWidth,
                    artworkContainerHeight,
                    artworkDesktopSideWidth
                };
            });
        }
    }, [vport, setArtworks])

    // Check if everything is ready to display
    useEffect(() => {
        const hasFormattedArtworks = artworks.formattedArtworks !== null;
        const hasArtworks = artworks.formattedArtworks?.artworksArray.length || 0 > 0;
        const hasDimensions = artworks.artworkContainerWidth > 0 && artworks.artworkContainerHeight > 0;
        const hasViewport = vport.width && vport.height;
        
        console.log("Ready check:", {
            hasFormattedArtworks,
            hasArtworks,
            hasDimensions,
            hasViewport,
            formattedArtworks: artworks.formattedArtworks
        });
        
        if (hasFormattedArtworks && hasArtworks && hasDimensions && hasViewport) {
            setIsReady(true);
        } else {
            setIsReady(false);
        }
    }, [artworks.formattedArtworks, artworks.artworkContainerWidth, artworks.artworkContainerHeight, vport.width, vport.height]);

    // Restore saved timeline position when returning to timeline view
    useEffect(() => {
        if (isReady && artworks.artworkViewTimeline && artworks.savedTimelineIndex > 0) {
            // Restore the saved index and scroll to it
            setArtworks(prev => ({
                ...prev,
                currentArtworkIndex: prev.savedTimelineIndex,
                isTimelineScrollingProgamatically: true
            }));
        }
    }, [isReady, artworks.artworkViewTimeline, artworks.savedTimelineIndex, setArtworks]);

    // Save timeline position when leaving timeline view
    useEffect(() => {
        return () => {
            // On unmount, save current position if we're in timeline view
            if (artworks.artworkViewTimeline && artworks.currentArtworkIndex > 0) {
                setArtworks(prev => ({
                    ...prev,
                    savedTimelineIndex: prev.currentArtworkIndex
                }));
            }
        };
    }, []);

    const scrollToIndex = useCallback((index: number): void => {
        if (!artworks.formattedArtworks || index < 0 || index >= artworks.formattedArtworks.artworksArray.length) return;

        isProgramScroll.current = true;

        if (index !== artworks.currentArtworkIndex) {
            setArtworks(state => ({ ...state, currentArtworkIndex: index }));
        }

        const isMobile = vport.width && vport.width <= 767;

        if (isMobile) {
            const scrollPosition = artworks.formattedArtworks.artworksArray[index].verticalScrollPoint;
            artworkTimelineRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth'});
        } else {
            const scrollPosition = artworks.formattedArtworks.artworksArray[index].horizontalScrollPoint;
            artworkTimelineRef.current?.scrollTo({ left: scrollPosition, behavior: 'smooth'});
        }
        setTimeout(() => {
            isProgramScroll.current = false;
        }, 500);        
    }, [artworks.currentArtworkIndex, artworks.formattedArtworks, vport.width, setArtworks]);

    const scrollNext = (): void => {
        if (isProgramScroll.current || !artworks.formattedArtworks) return;

        const nextIndex = artworks.currentArtworkIndex < artworks.formattedArtworks.artworksArray.length - 1 
            ? artworks.currentArtworkIndex + 1 
            : 0;
        
        scrollToIndex(nextIndex);
    };

    const scrollPrevious = (): void => {
        if (isProgramScroll.current || !artworks.formattedArtworks) return;

        const prevIndex = artworks.currentArtworkIndex > 0 
            ? artworks.currentArtworkIndex - 1 
            : artworks.formattedArtworks.artworksArray.length - 1;
        
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
        const currentArtworks = artworksRef.current;
        const currentVport = vportRef.current;
        
        console.log("in handle scroll")
        
        if (isProgramScroll.current || currentArtworks.isTimelineScrollingProgamatically || !currentArtworks.formattedArtworks) {
            return;
        }
        
        if (artworkTimelineRef.current) {
            const isMobile = currentVport.width && currentVport.width <= 767;
            let currentScrollPosition: number = 0;
            let artworkDimension: number = 0;
            let viewportDimension: number = 0;
            let sideOffset: number = 0;

            if (isMobile) {
                currentScrollPosition = artworkTimelineRef.current.scrollTop;
                viewportDimension = currentVport.height || 0;
                artworkDimension = currentArtworks.artworkContainerHeight;
            } else {
                currentScrollPosition = artworkTimelineRef.current.scrollLeft;
                artworkDimension = currentArtworks.artworkContainerWidth;
                viewportDimension = currentVport.width || 0;
                sideOffset = currentArtworks.artworkDesktopSideWidth;
            }

            const viewportCenterAbsolute = currentScrollPosition + (viewportDimension / 2); 
            
            console.log("Scroll calc:", {
                scrollPosition: currentScrollPosition,
                viewportDimension,
                viewportCenter: viewportCenterAbsolute,
                artworkDimension,
                sideOffset
            });

            let bestIndex = 0
            let minDistance = Infinity;
            let accumulatedDimension = sideOffset;

            currentArtworks.formattedArtworks.artworksArray.forEach((artwork, index) => {
                const artworkStart = accumulatedDimension;
                const artworkCenter = artworkStart + (artworkDimension / 2);
                const distance = Math.abs(artworkCenter - viewportCenterAbsolute);

                if (distance < minDistance) {
                    minDistance = distance;
                    bestIndex = index;
                }

                accumulatedDimension += artworkDimension;
                if (index < currentArtworks.formattedArtworks!.artworksArray.length - 1) {
                    if (isMobile) {
                        accumulatedDimension += artwork.marginBottom;
                    } else {
                        accumulatedDimension += artwork.marginRight;
                    }
                }
            });

            console.log("best index: ", bestIndex, "current index:", currentArtworks.currentArtworkIndex)
            
            if (bestIndex !== currentArtworks.currentArtworkIndex) {
                console.log("Updating index from", currentArtworks.currentArtworkIndex, "to", bestIndex);
                setArtworks(state => ({ ...state, currentArtworkIndex: bestIndex }));
            } else {
                console.log("Index unchanged, still at", bestIndex);
            }
        }
    }, [setArtworks]);

    useEffect(() => {
        if (isProgramScroll.current) {
            hasUserScrolledRef.current = false;
        }
    }, [artworks.currentArtworkIndex]);

    useEffect(() => {
        const currentElement = artworkTimelineRef.current;

        if (currentElement && isReady) {
            console.log("Adding scroll listener - isReady is true");
            console.log("Element scroll dimensions:", {
                scrollWidth: currentElement.scrollWidth,
                scrollHeight: currentElement.scrollHeight,
                clientWidth: currentElement.clientWidth,
                clientHeight: currentElement.clientHeight,
                scrollLeft: currentElement.scrollLeft,
                scrollTop: currentElement.scrollTop
            });
            
            currentElement.addEventListener('scroll', handleArtScroll);
            
            // Immediately calculate the correct index based on current scroll position
            // This handles cases where the page is already scrolled when component mounts
            // handleArtScroll();
        }

        return () => {
            if (currentElement) {
                console.log("Removing scroll listener");
                currentElement.removeEventListener('scroll', handleArtScroll);
            }
        };
    }, [handleArtScroll, isReady]);

    const smallLines = useMemo(() => {
        if (!artworks.formattedArtworks) return null;

        const isMobile: boolean = Boolean(vport.width && vport.width <= 767);
        
        return generateSmallLines({
            isMobile,
            totalTimelineHeight: artworks.formattedArtworks.totalTimelineHeight,
            totalTimelineWidth: artworks.formattedArtworks.totalTimelineWidth,
            artworkContainerHeight: artworks.artworkContainerHeight,
            artworkContainerWidth: artworks.artworkContainerWidth,
            artworkDesktopSideWidth: artworks.artworkDesktopSideWidth,
            targetSpacing: 20
        });
    }, [
        vport.width,
        artworks.formattedArtworks,
        artworks.artworkContainerHeight,
        artworks.artworkContainerWidth,
        artworks.artworkDesktopSideWidth
    ]);

    if (!isReady || !artworks.formattedArtworks) {
        return <Loading />;
    }

    return (
        <div className="artworks-timeline__container">
            <ArtworkTitle />
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
                        width: vport.width && vport.width > 767 ? `${artworks.formattedArtworks.totalTimelineWidth}px` : 'auto',
                        height: vport.width && vport.width <= 767 ? `${artworks.formattedArtworks.totalTimelineHeight}px` : 'auto',
                        paddingLeft: vport.width && vport.width > 767 ? `${artworks.artworkDesktopSideWidth}px` : '0px',
                        paddingRight: vport.width && vport.width > 767 ? `${artworks.artworkDesktopSideWidth}px` : '0px',
                    }}
                >
                    {artworks.formattedArtworks.artworksArray.map((artwork, index) => {
                        return (
                            <div
                                className="artworks-timeline__artwork-inside"
                                key={artwork.id}
                                style={{
                                    marginRight: vport.width && vport.width > 767 && index < artworks.filtered.length - 1 ? `${artwork.marginRight || 0}px` : '0px',
                                    marginBottom: vport.width && vport.width <= 767 && index < artworks.filtered.length - 1 ? `${artwork.marginBottom || 0}px` : '0px',
                                    minWidth: `${artworks.artworkContainerWidth}px`,
                                    minHeight: `${artworks.artworkContainerHeight}px`,
                                }}
                            >
                                <ArtworkDetail
                                    artwork={artwork}
                                    artworkContainerWidth={artworks.artworkContainerWidth}
                                    artworkContainerHeight={artworks.artworkContainerHeight}
                                />
                            </div>
                        )
                    })}
                </div>

                <div
                    className="artworks-timeline__timeline-container"
                    style={{
                        width: vport.width && vport.width > 767 ? `${Number(artworks.formattedArtworks.totalTimelineWidth - (artworks.artworkDesktopSideWidth * 2))}px` : '50px',
                        height: vport.width && vport.width <= 767 ? `${artworks.formattedArtworks.totalTimelineHeight}px` : '50px',
                        marginLeft: vport.width && vport.width > 767 ? `${artworks.artworkDesktopSideWidth}px` : '0px',
                        marginRight: vport.width && vport.width > 767 ? `${artworks.artworkDesktopSideWidth}px` : '0px',
                    }}
                >
                    <div
                        className="artworks-timeline__line"
                        style={{
                            width: vport.width && vport.width > 767 ? `${Number(artworks.formattedArtworks.totalTimelineWidth - artworks.artworkContainerWidth - (artworks.artworkDesktopSideWidth * 2))}px` : '1px',
                            height: vport.width && vport.width > 767 ? '1px' : `${artworks.formattedArtworks.totalTimelineHeight - artworks.artworkContainerHeight}px`,
                            left: vport.width && vport.width > 767 ? `${Number(artworks.artworkContainerWidth / 2)}px` : '24px',
                            top: vport.width && vport.width > 767 ? '24px' : `${Number(artworks.artworkContainerHeight / 2)}px`,
                        }}
                    />
                    <div 
                        className="artworks-timeline__small-lines"
                        style={{
                            marginLeft: vport.width && vport.width > 767 ? `${Number(artworks.artworkContainerWidth / 2)}px` : '0px',
                            marginTop: vport.width && vport.width > 767 ? '0px' : `${Number(artworks.artworkContainerHeight / 2)}px`,
                        }}    
                    >
                        {smallLines}
                    </div>
                    <div 
                        className="artworks-timeline__year-markers"
                        style={{
                            left: vport.width && vport.width > 767 ? `-${Number(artworks.artworkContainerWidth / 2)}px` : '0px',
                            top: vport.width && vport.width > 767 ? '0px' : `-${Number(artworks.artworkContainerHeight / 2)}px`,
                        }}
                    >
                        {artworks.formattedArtworks.timepointsArray.map(yearMarker => {
                            return (
                                <div
                                    key={yearMarker.id}
                                    className="artworks-timeline__year-marker"
                                    style={{
                                        left: vport.width && vport.width > 767 ? `${(Number(artworks.artworkContainerWidth) / 2) + Number(yearMarker.distanceFromStart)}px`  : '0px',
                                        top: vport.width && vport.width <= 767 ? `${(Number(artworks.artworkContainerHeight) / 2) + Number(yearMarker.distanceFromStart)}px` : '0px',
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