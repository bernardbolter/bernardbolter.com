'use client'

import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { ArtworksContext } from '@/providers/ArtworkProvider';
import ArtworkDetail from '@/components/Artworks/ArtworkDetail';

import LeftArrowSvg from '@/svgs/LeftArrowSvg';
import RightArrowSvg from '@/svgs/RightArrowSvg';

import useWindowSize from '@/hooks/useWindowSize';

import { Artwork } from '@/types/artworks';
import {
    formatFilteredArtworkWithTimeMargin,
    calculateTotalTimelineWidth,
    calculateTotalTimelineHeight,
    calculateHorizontalScrollPoints,
    calculateVerticalScrollPoints,
    generateSmallLines,
    generateYearMarkers
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
        return formatFilteredArtworkWithTimeMargin(filteredArtworks);
    }, [filteredArtworks]);

    // calculate scrollable dimensions
    const totalTimelineWidth = useMemo(() => {
        return calculateTotalTimelineWidth(formattedArtworks, artworkContainerWidth, artworkDesktopSideWidth);
    }, [formattedArtworks, artworkContainerWidth, artworkDesktopSideWidth]);

    const totalTimelineHeight = useMemo(() => {
        return calculateTotalTimelineHeight(formattedArtworks, artworkContainerHeight);
    }, [formattedArtworks, artworkContainerHeight]);

    // calculate scroll points for centering artworks
    const horizontalScrollPoints = useMemo(() => {
        return calculateHorizontalScrollPoints(formattedArtworks, artworkContainerWidth, artworkDesktopSideWidth, vport.width || 0 );
    }, [formattedArtworks, artworkContainerWidth, artworkDesktopSideWidth, vport.width]);

    const verticalScrollPoints = useMemo(() => {
        return calculateVerticalScrollPoints(formattedArtworks, artworkContainerHeight, vport.height || 0);
    }, [formattedArtworks, artworkContainerHeight, vport.height]);

    const scrollToIndex = useCallback((index: number): void => {
        if (index < 0 || index >= formattedArtworks.length) return;

        isProgramScroll.current = true;

        if (index !== artworks.currentArtworkIndex) {
            setArtworks(state => ({ ...state, currentArtworkIndex: index }));
        }

        const isMobile = vport.width && vport.width <= 767;

        if (isMobile) {
            const scrollPosition = verticalScrollPoints[index];
            artworkTimelineRef.current?.scrollTo({ top: scrollPosition, behavior: 'smooth'});
        } else {
            const scrollPosition = horizontalScrollPoints[index];
            artworkTimelineRef.current?.scrollTo({ left: scrollPosition, behavior: 'smooth'});
        }
        setTimeout(() => {
            isProgramScroll.current = false; // Reset flag after scrolling completes
        }, 500);        
    }, [formattedArtworks.length, vport.width, horizontalScrollPoints, verticalScrollPoints, setArtworks]);

    const scrollNext = (): void => {
        if (isProgramScroll.current) return; // Skip if scrolling is already in progress

        const nextIndex = artworks.currentArtworkIndex < formattedArtworks.length - 1 
            ? artworks.currentArtworkIndex + 1 
            : 0;
        
        console.log("Scrolling to next index:", nextIndex);
        scrollToIndex(nextIndex);
    };

    const scrollPrevious = (): void => {
        if (isProgramScroll.current) return; // Skip if scrolling is already in progress

        const prevIndex = artworks.currentArtworkIndex > 0 
            ? artworks.currentArtworkIndex - 1 
            : formattedArtworks.length - 1;
        
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

            formattedArtworks.forEach((artwork, index) => {
                const artworkStart = accumulatedDimension;
                const artworkCenter = artworkStart + (artworkDimension / 2);
                const distance = Math.abs(artworkCenter - viewportCenterAbsolute);

                if (distance < minDistance) {
                    minDistance = distance;
                    bestIndex = index;
                }

                accumulatedDimension += artworkDimension;
                if (index < formattedArtworks.length - 1) {
                    accumulatedDimension += artwork.timeMargin;
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

    
    // Render year markers for gaps between artworks
    // const renderYearMarkers = (artwork: ArtworkWithTimeMargin, isMobile: boolean) => {
    //     if (!artwork.hasYearBreak || !artwork.missingYears) return null;

    //     const PIXELS_PER_YEAR = 120;
    //     const markers: React.ReactNode[] = [];

    //     artwork.missingYears.forEach((year, index) => {
    //         const markerPosition = (index + 1) * PIXELS_PER_YEAR;
    //         const positionStyle = isMobile 
    //             ? { top: `${markerPosition}px`, position: 'absolute' as const }
    //             : { left: `${markerPosition}px`, position: 'absolute' as const };

    //         markers.push(
    //             <div
    //                 key={`year-marker-${year}`}
    //                 className="timeline-year-marker"
    //                 style={positionStyle}
    //             >
    //                 <div className="timeline-year-tick" />
    //                 <span className="timeline-year-label">{year}</span>
    //             </div>
    //         );
    //     });

    //     return markers;
    // };

    // const renderYearTimeline = (artwork: ArtworkWithTimeMargin, isMobile: boolean) => {
    //     const containerWidth = isMobile ? 50 : artworkContainerWidth;
    //     const containerHeight = isMobile ? artworkContainerHeight : 50;

    //     const generateMinorTicks = () => {
    //         const minorTicks: JSX.Element[] = [];
    //         const spacing = 10;
    //         const dimension = isMobile ? containerHeight : containerWidth;

    //         for (let i = spacing; i < dimension; i += spacing) {
    //             const isAtCenter = Math.abs(i - (dimension / 2)) < 5;

    //             if (!isAtCenter) {
    //                 if (isMobile) {
    //                     minorTicks.push(<div key={`minor-tick-${i}`} className="timeline-minor-tick-mobile" />);
    //                 } else {
    //                     minorTicks.push(<div key={`minor-tick-${i}`} className="timeline-minor-tick-desktop" />);
    //                 }
    //             }

    //             return minorTicks;
    //         }
    //     }

    //     return (
    //         <div className="artworks-timeline__timepoint"
    //             style={{
    //                 // marginRight: !isMobile && artwork.timeMargin > 0 ? `${artwork.timeMargin}px` : '0px',
    //                 // marginBottom: isMobile && artwork.timeMargin > 0 ? `${artwork.timeMargin}px` : '0px',
    //                 width: isMobile ? 50 : `${artworkContainerWidth + artwork.timeMargin}px`,
    //                 height: isMobile ? `${artwork.timeMargin}px + ${artworkContainerHeight}px` : 50,
    //                 position: 'relative',
    //                 border: '1px solid #999'
    //             }}
    //         >
    //             {/* {isMobile ?
    //                 <div className="timeline-line-mobile" /> :
    //                 <div className="timeline-line-desktop" />
    //             }

    //             {generateMinorTicks()}

    //             {isMobile 
    //                 ? <div className="timeline-major-mobile" />
    //                 : <div className="timeline-major-desktop" />
    //             }
    //             <div
    //                 className={
    //                     artwork.hasYearBreak ? 'timeline-line-year-break' :
    //                         artwork.timeMargin > 0 ? 'timeline-line-gap' : 'timeline-line'
    //                 }
    //             />

    //             {renderYearMarkers(artwork, isMobile)}

    //             <div className="timeline-marker">
    //                 <div className="timeline-tick is-year-start">
    //                     <span className="timeline-year">{new Date(artwork.date).getFullYear()}</span>
    //                 </div>
    //             </div>    */}
    //         </div>
    //     )
    // }

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

    const yearMarkers = useMemo(() => {
        const isMobile: boolean = Boolean(vport.width && vport.width <= 767);
        
        return generateYearMarkers({
            formattedArtworks,
            isMobile,
            totalTimelineHeight,
            totalTimelineWidth,
            artworkContainerHeight,
            artworkContainerWidth,
            artworkDesktopSideWidth,
            pixelsPerYear: 120 // Adjust this value based on your timeline scale
        });
    }, [
        formattedArtworks,
        vport.width,
        totalTimelineHeight,
        totalTimelineWidth,
        artworkContainerHeight,
        artworkContainerWidth,
        artworkDesktopSideWidth
    ]);


    return (
        <div className="artworks-timeline__container" 
              
        >
            {formattedArtworks.length > 0 && (
                <div className="artworks-timeline__title-container">
                    <h1>{formattedArtworks[artworks.currentArtworkIndex].title}</h1>
                    <div className="artworks-timeline__year-info">
                        <span>{new Date(formattedArtworks[artworks.currentArtworkIndex].date).getFullYear()}</span>
                        {formattedArtworks[artworks.currentArtworkIndex].yearsDifference > 0 && (
                            <span className="time-gap">
                                +{formattedArtworks[artworks.currentArtworkIndex].yearsDifference.toFixed(1)} years
                            </span>
                        )}
                    </div>
                </div>
            )}

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
                        width: vport.width && vport.width > 767 ? `${totalTimelineWidth}px` : 'auto',
                        height: vport.width && vport.width <= 767 ? `${totalTimelineHeight}px` : 'auto',
                        paddingLeft: vport.width && vport.width > 767 ? `${artworkDesktopSideWidth}px` : '0px',
                        paddingRight: vport.width && vport.width > 767 ? `${artworkDesktopSideWidth}px` : '0px',
                    }}
                >
                    {formattedArtworks.map((artwork, index) => {
                        return (
                            <div
                                className="artworks-timeline__artwork-inside"
                                key={artwork.id}
                                style={{
                                    marginRight: vport.width && vport.width > 767 && index < filteredArtworks.length - 1 ? `${artwork.timeMargin || 0}px` : '0px',
                                    marginBottom: vport.width && vport.width <= 767 && index < filteredArtworks.length - 1 ? `${artwork.timeMargin || 0}px` : '0px',
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
                        width: vport.width && vport.width > 767 ? `${totalTimelineWidth - (artworkDesktopSideWidth * 2)}px` : '50px',
                        height: vport.width && vport.width <= 767 ? `${totalTimelineHeight}px` : '50px',
                        marginLeft: vport.width && vport.width > 767 ? `${artworkDesktopSideWidth}px` : '0px',
                        marginRight: vport.width && vport.width > 767 ? `${artworkDesktopSideWidth}px` : '0px',
                    }}
                >
                    <div
                        className="artworks-timeline__line"
                        style={{
                            width: vport.width && vport.width > 767 ? `${totalTimelineWidth - artworkContainerWidth - (artworkDesktopSideWidth * 2) }px` : '1px',
                            height: vport.width && vport.width > 767 ? '1px' :`${totalTimelineHeight - artworkContainerHeight}px`,
                            left: vport.width && vport.width > 767 ? `${artworkContainerWidth / 2}px` : '24px',
                            top: vport.width && vport.width > 767 ? '24px' : `${artworkContainerHeight / 2}px`,
                        }}
                    />
                    <div 
                        className="artworks-timeline__small-lines"
                        style={{
                            marginLeft: vport.width && vport.width > 767 ? `${artworkContainerWidth / 2}px` : '0px',
                        }}    
                    >
                        {smallLines}
                    </div>
                    <div className="artworks-timeline__year-markers">
                        {yearMarkers}
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