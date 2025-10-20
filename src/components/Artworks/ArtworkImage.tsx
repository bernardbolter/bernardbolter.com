'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { RefObject } from 'react'

import Image from 'next/image'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import useWindowSize from '@/hooks/useWindowSize'

import { getSeriesColor } from '@/helpers/seriesColor'

import Info from '@/components/Info/Info'
import ArtworkSize from './ArtworkSize'
import MagnifyAnimationSvg from '@/svgs/MagnifyAnimationSvg'
import RightArrowSvg from '@/svgs/RightArrowSvg'
import LeftArrowSvg from '@/svgs/LeftArrowSvg'

import { Artwork, ArtworkImageNode } from '@/types/artworkTypes'
import { useArtworkDimensions } from '@/hooks/useArtworkDimensions'

// --- Type Definitions ---
interface ArtworkImageProps { artwork: Artwork }
interface DragBounds { left: number; right: number; top: number; bottom: number; }
interface DragPosition { x: number; y: number; }

interface ArtworkImageNodeWithAlt extends Omit<ArtworkImageNode, 'altText'> {
    altText?: string
}

interface ArtworkFieldsWithGallery {
    artworkImage?: { node: ArtworkImageNode } | null;
    artworkImage2?: { node: ArtworkImageNode } | null;
    artworkImage3?: { node: ArtworkImageNode } | null;
    artworkImage4?: { node: ArtworkImageNode } | null;
    artworkImage5?: { node: ArtworkImageNode } | null;
    artworkImage6?: { node: ArtworkImageNode } | null;
    artworkImage7?: { node: ArtworkImageNode } | null;
    artworkImage8?: { node: ArtworkImageNode } | null;
    artworkImage9?: { node: ArtworkImageNode } | null;
    hasMoreImages?: boolean | null;
}

const BORDER_PADDING = 20; // 20px white border for magnify mode

const ArtworkImage = ({artwork}: ArtworkImageProps) => {
    // const draggableRefs = useRef<HTMLDivElement[]>([])
    const [artworkLoading, setArtworkLoading] = useState<boolean>(true);
    const [enlargedArtworkLoading, setEnlargedArtworkLoading] = useState<boolean>(true)
    const [enlargeArtwork, setEnlargeArtwork] = useState<boolean>(false);
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [dragPositions, setDragPositions] = useState<DragPosition[]>([]);
    
    const size = useWindowSize();
    const viewportWidth = size.width || 0;
    const viewportHeight = size.height || 0;

    const imageRefsRef = useRef<RefObject<HTMLDivElement>[]>([])

    console.log("artwork image: ", artwork)

    // --- 1. Consolidate All Images ---
    const allImageNodes = useMemo(() => {
        const fields = artwork.artworkFields as ArtworkFieldsWithGallery
        const nodes: ArtworkImageNodeWithAlt[] = []
        type ImageKey = Exclude<keyof ArtworkFieldsWithGallery, 'hasMoreImages'>

        const extractNode = (field: ImageKey) => {
            const node = fields[field]?.node
            return node ? node as ArtworkImageNodeWithAlt : null
        }

        const primaryNode = extractNode('artworkImage')
        if (primaryNode) { nodes.push(primaryNode)}

        if (fields.hasMoreImages) {
            for (let i = 2; i <= 9; i++) {
                const key = `artworkImage${i}` as ImageKey
                const node = extractNode(key)
                if (node) {
                    nodes.push(node)
                }
            }
        }
        return nodes;
    }, [artwork.artworkFields]);
    
    const maxIndex = allImageNodes.length - 1;
    const hasMultipleImages = allImageNodes.length > 1;

    // --- 2. Get Details for all images
    const allImageDetails = useMemo(() => {
        return allImageNodes.map(node => ({
            imageSrc: node?.sourceUrl || '',
            imageSrcSet: node?.srcSet || '',
            imageWidth: node?.mediaDetails?.width || 800,
            imageHeight: node?.mediaDetails?.height || 800,
            altText: node?.altText || artwork.title || 'Artwork Image'
        }))
    }, [allImageNodes, artwork.title])

    useMemo(() => {
        // Only run if the number of images has changed
        if (imageRefsRef.current.length !== allImageDetails.length) {
            imageRefsRef.current = allImageDetails.map(() => ({ current: null } as unknown as RefObject<HTMLDivElement>))
        }
    }, [allImageDetails.length]);

    if (dragPositions.length === 0 && allImageDetails.length > 0) {
        setDragPositions(allImageDetails.map(() => ({ x: 0, y: 0 })))
    }

    const currentImageDetail = useMemo(() => {
        return allImageDetails[currentImageIndex] || {
            imageSrc: '',
            imageWidth: 800,
            imageHeight: 800,
            altText: artwork.title || ""
        }
    }, [allImageDetails, currentImageIndex, artwork.title]);

    const {
        imageWidth,
        imageHeight,
    } = currentImageDetail

    const currentDragPosition = useMemo(() => {
        return dragPositions[currentImageIndex] || { x:0, y: 0 };
    }, [dragPositions, currentImageIndex])

    // Helper function to calculate the correct initial centered and clamped drag position
    const getInitialDragPosition = useCallback((index: number): DragPosition => {
        const imageDetail = allImageDetails[index];
        if (!imageDetail) return { x: 0, y: 0 };

        const currentW = imageDetail.imageWidth;
        const currentH = imageDetail.imageHeight;
        
        // 1. Calculate the minimum and maximum translation (position) needed to respect BORDER_PADDING
        // Min X (Left Limit): Image's right edge aligns with (viewportWidth - BORDER_PADDING)
        const dragLimitLeft = (viewportWidth - BORDER_PADDING) - currentW; 
        // Max X (Right Limit): Image's left edge aligns with BORDER_PADDING
        const dragLimitRight = BORDER_PADDING; 

        // Min Y (Top Limit): Image's bottom edge aligns with (viewportHeight - BORDER_PADDING)
        const dragLimitTop = (viewportHeight - BORDER_PADDING) - currentH;
        // Max Y (Bottom Limit): Image's top edge aligns with BORDER_PADDING
        const dragLimitBottom = BORDER_PADDING; 
        
        // 2. Calculate the position required to center the image in the full viewport
        const centerX = (viewportWidth - currentW) / 2
        const centerY = (viewportHeight - currentH) / 2
        
        // 3. Clamp the center position: position must be >= min limit and <= max limit.
        const clampedInitialX = Math.max(dragLimitLeft, Math.min(dragLimitRight, centerX))
        const clampedInitialY = Math.max(dragLimitTop, Math.min(dragLimitBottom, centerY))

        // If the image is smaller than the viewport, dragLimitLeft will be > BORDER_PADDING.
        // If image is huge, centerX will be smaller than dragLimitLeft (more negative).
        
        return { x: clampedInitialX, y: clampedInitialY };
    }, [allImageDetails, viewportWidth, viewportHeight])

    // --- 3. Image Navigation Handlers ---
    const resetAndChangeImage = useCallback((newIndex: number) => {
        if (enlargeArtwork && allImageDetails[newIndex]) {
            if (newIndex !== currentImageIndex) {
                // FIX 1B: Calculate and set the initial drag position for the new image
                const newInitialPosition = getInitialDragPosition(newIndex);
                
                setDragPositions(prevPositions => {
                    const newPositions = [...prevPositions];
                    newPositions[newIndex] = newInitialPosition;
                    return newPositions;
                });
            }
        }
        setCurrentImageIndex(newIndex);
    }, [enlargeArtwork, allImageDetails, currentImageIndex, getInitialDragPosition]);

    const handleNextImage = useCallback(() => {
        const newIndex = currentImageIndex === maxIndex ? 0 : currentImageIndex + 1;
        resetAndChangeImage(newIndex);
    }, [maxIndex, currentImageIndex, resetAndChangeImage]);

    const handlePrevImage = useCallback(() => {
        const newIndex = currentImageIndex === 0 ? maxIndex : currentImageIndex - 1;
        resetAndChangeImage(newIndex);
    }, [maxIndex, currentImageIndex, resetAndChangeImage]);

    // --- 4. Magnify Dimensions and Drag Bounds Calculation ---
    const { magnifiedDims, containerDims } = useMemo(() => {
        // Effective container is the viewport minus padding
        const effectiveContainerW = viewportWidth - (2 * BORDER_PADDING)
        const effectiveContainerH = viewportHeight - (2 * BORDER_PADDING)

        const currentW = currentImageDetail.imageWidth
        const currentH = currentImageDetail.imageHeight

        const canDrag = currentW > effectiveContainerW || currentH > effectiveContainerH
        
        // This calculates the maximum translation needed to align the image edges with the padded container edges.
        const dragLimitLeft = (viewportWidth - BORDER_PADDING) - currentW;
        const dragLimitTop = (viewportHeight - BORDER_PADDING) - currentH;

        // Calculate center position (full viewport center offset)
        const centerX = (viewportWidth - currentW) / 2
        const centerY = (viewportHeight - currentH) / 2
        
        // Clamp the center position to ensure it respects the BORDER_PADDING limits.
        const clampedInitialX = Math.max(dragLimitLeft, Math.min(BORDER_PADDING, centerX))
        const clampedInitialY = Math.max(dragLimitTop, Math.min(BORDER_PADDING, centerY))

        // These bounds are based on the old logic, but kept here for min-map context calculation
        const oldDragLeft = -(currentW - effectiveContainerW)
        const oldDragTop = -(currentH - effectiveContainerH)

        const bounds: DragBounds = {
            left: canDrag ? Math.min(0, oldDragLeft) : 0,
            right: 0,
            top: canDrag ? Math.min(0, oldDragTop) : 0,
            bottom: 0
        };

        return {
            magnifiedDims: { width: currentW, height: currentH, canDrag },
            dragBounds: bounds,
            containerDims: { width: effectiveContainerW, height: effectiveContainerH },
            initialDragPosition: { x: clampedInitialX, y: clampedInitialY }
        };
    }, [viewportWidth, viewportHeight, currentImageDetail]);

    // --- 5. Regular (non-magnified) Display Dimensions ---
    const { displayWidth, displayHeight } = useArtworkDimensions({
        artworkContainerWidth: viewportWidth,
        artworkContainerHeight: viewportHeight,
        artworkSize: artwork.artworkFields.size || 'lg',
        imageWidth,
        imageHeight,
        useImageFactors: true,
    });

    // --- 6. Centering Margin Calculation ---
    const { marginWidth, marginHeight } = useMemo(() => {
        const calculatedMarginWidth = (viewportWidth - displayWidth) / 2;
        const calculatedMarginHeight = (viewportHeight - displayHeight) / 2;
        return {
            marginWidth: Math.max(0, calculatedMarginWidth), 
            marginHeight: Math.max(0, calculatedMarginHeight) 
        };
    }, [displayWidth, displayHeight, viewportWidth, viewportHeight]);
// --- 7. Event Handlers ---
    const handleToggleMagnify = useCallback(() => {
        setEnlargeArtwork(state => {
            if (!state) { 
                // When switching TO magnify mode
                setEnlargedArtworkLoading(true); // Ensure loading state is reset
                
                // FIX 1A: Recalculate and apply the initial drag position ONLY for the current image
                const initialPosition = getInitialDragPosition(currentImageIndex);
                
                setDragPositions(prevPositions => {
                    // Create new array based on old, but update the current index
                    const newPositions = [...prevPositions]
                    newPositions[currentImageIndex] = initialPosition;
                    return newPositions;
                });
            }
            return !state;
        });
    }, [currentImageIndex, getInitialDragPosition])

    const handleDrag = useCallback((imageIndex: number) => (e: DraggableEvent, data: DraggableData) => {
        setDragPositions(prevPositions => {
            const newPositions = [...prevPositions]
            newPositions[imageIndex] = { x: data.x, y: data.y }
            return newPositions
        })
    }, []);
    
    // --- 8. Mini-Map Calculations ---
    const miniMap = useMemo(() => {
        const MINI_MAP_SIZE = 120;
        const PADDING = 10;
        const drawableSize = MINI_MAP_SIZE - (2 * PADDING);
        const imgW = magnifiedDims.width;
        const imgH = magnifiedDims.height;
        const containerW = containerDims.width; 
        const containerH = containerDims.height; 
        const currentX = currentDragPosition.x;
        const currentY = currentDragPosition.y;

        // --- Calculate bounds for fractional calculation ---
        const dragLimitLeft = (viewportWidth - BORDER_PADDING) - imgW;
        const dragLimitRight = BORDER_PADDING;
        const dragLimitTop = (viewportHeight - BORDER_PADDING) - imgH;
        const dragLimitBottom = BORDER_PADDING;

        // Calculate map image dimensions
        const imgAspectRatio = imgW / imgH;
        let mapImgW: number, mapImgH: number;
        if (imgAspectRatio >= 1) {
            mapImgW = drawableSize;
            mapImgH = drawableSize / imgAspectRatio;
        } else {
            mapImgH = drawableSize;
            mapImgW = drawableSize * imgAspectRatio;
        }

        // Calculate viewport box scaled dimensions
        const viewScaleW = mapImgW * (containerW / imgW);
        const viewScaleH = mapImgH * (containerH / imgH);

        // Calculate fractional scroll distance (0 to 1)
        const scrollDistX = dragLimitRight - dragLimitLeft;
        const scrollOffsetX = currentX - dragLimitLeft;
        const fracX = scrollDistX > 0 ? scrollOffsetX / scrollDistX : 0;

        const scrollDistY = dragLimitBottom - dragLimitTop;
        const scrollOffsetY = currentY - dragLimitTop;
        const fracY = scrollDistY > 0 ? scrollOffsetY / scrollDistY : 0;
        
        // Total movement range for the map image outline
        const mapScrollDistX = mapImgW - viewScaleW;
        const mapScrollDistY = mapImgH - viewScaleH;
        
        // NEW FIX: Position of the FIXED VIEWPORT BOX relative to the MINI_MAP_SIZE container
        // This is the anchor point for the outline's movement (its max right/bottom position)
        const fixedBoxPosX = (MINI_MAP_SIZE - viewScaleW) / 2;
        const fixedBoxPosY = (MINI_MAP_SIZE - viewScaleH) / 2;

        // --- CORRECTED TRANSLATION LOGIC ---
        // The movement is now defined as: (Start position) + (fractional distance * total movement)
        // The start position is the max negative translation (the outline's UP/LEFT limit).
        
        // UP/LEFT Limit: The fixed box position minus the full scroll distance.
        const leftLimitX = fixedBoxPosX - mapScrollDistX;
        const topLimitY = fixedBoxPosY - mapScrollDistY;

        // Final translation: start at the limit and add back the fractional scroll distance
        const finalImgTranslateX = leftLimitX + (fracX * mapScrollDistX);
        const finalImgTranslateY = topLimitY + (fracY * mapScrollDistY);
        // ------------------------------------

        return {
            mapImgW, mapImgH,
            viewScaleW, viewScaleH,
            fixedBoxPosX, fixedBoxPosY,
            finalImgTranslateX, finalImgTranslateY,
            MINI_MAP_SIZE
        };
    }, [magnifiedDims, containerDims, currentDragPosition, viewportWidth, viewportHeight]);

    // --- 9. Render ---
    if (!allImageDetails.length) return null;

    return (
        <div className="artwork-image__main-scroll-wrapper">
            <Info />
            <div 
                className="artwork-image__magnify-container"
                onClick={handleToggleMagnify}
            >
                <MagnifyAnimationSvg enlargeArtwork={enlargeArtwork}/>
            </div>
            <div 
                className="artwork-image__container"
                style={{  visibility: enlargeArtwork ? 'hidden' : 'visible'}}
            >
                <div 
                    className="artwork-image__slider-viewport"
                    style={{
                        width: displayWidth,
                        height: displayHeight,
                        marginLeft: marginWidth,
                        marginTop: marginHeight,
                        overflow: 'hidden'
                    }}    
                >
                    <div 
                        className="artwork-image__slider-wrapper"
                        style={{ 
                            width: displayWidth * allImageDetails.length,
                            transform: `translateX(-${currentImageIndex * displayWidth}px)`
                        }}
                    >
                        {allImageDetails.map((image, index) => (
                            <div
                                key={image.imageSrc}
                                className="artwork-image__image-slide"
                                style={{
                                    width: displayWidth,
                                    height: displayHeight
                                }}
                            >
                                <div 
                                    className="artwork-image__image-wrapper"
                                    style={{ width: displayWidth, height: displayHeight}}    
                                >
                                    <Image
                                        className="artwork-image__image"
                                        src={image.imageSrc}
                                        alt={image.altText}
                                        // srcSet={image.imageSrcSet}
                                        width={displayWidth}
                                        height={displayHeight}
                                        onLoad={() => setArtworkLoading(false)}
                                        priority={index === currentImageIndex}
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="artwork-image__info-container">
                    <div 
                        className="artwork-image__info--title-container"
                        style={{ paddingRight: marginWidth}}    
                    >
                       <h1 className="artwork-image__title">{artwork.title}</h1>                         
                        <h2 className="artwork-image__year">{new Date(artwork.date).getFullYear()}</h2>
                        {artwork.artworkFields.style ? (
                            <h3 className="artwork-image__medium">{artwork.artworkFields.style}</h3>
                        ) : (
                            <h3 className="artwork-image__medium">{artwork.artworkFields.medium}</h3> 
                        )}
                        <ArtworkSize
                            width={artwork.artworkFields.width || '0'}
                            height={artwork.artworkFields.height || '0'}
                            units={artwork.artworkFields.units || 'metric'}
                            isImage={true}
                        />
                        <div
                            className="artwork-image__series-box"
                            style={{
                                background: getSeriesColor(artwork.artworkFields?.series || ''),
                                left: marginWidth
                            }}
                        />
                    </div>
                    <div className="artwork-image__info--line"/>
                    <div className="artwork-image__info--details-container">
                        <div className="artwork-image__info--available">

                        </div>
                        <div className="artwork-image__info--details">

                        </div>
                    </div>
                    <h1>Info</h1>
                    <p>jfkas<br/>dfasj<br/>kfhjka<br/>shdfjha<br/>sjkl<br/>dfhsajkld<br/>fhj<br/>klasd<br/>hfjkl<br/>asdhfjlh<br/>sadjkfh<br/>sajdkhfjk<br/>sahdjkfhaf<br/>jsdahfjkh<br/>sdkljfhasd</p>
                </div>
            </div>
            
            {/* Multiple Buttons and Counter */}
            {hasMultipleImages && (
                <div className="artwork-image__buttons-container">
                    <div className="artwork-image__counter">
                        <p>{currentImageIndex + 1} / {allImageNodes.length}</p>
                    </div>
                    <div className="artwork-image__buttons">
                        <div className="artwork-image__button" onClick={handlePrevImage} aria-label="Previous Image">
                            <LeftArrowSvg />
                        </div>
                        <div className="artwork-image__button" onClick={handleNextImage} aria-label="Next Image">
                            <RightArrowSvg />
                        </div>
                    </div>
                </div>
            )}

            {/* Magnify Overlay and Draggable Content */}
            {enlargeArtwork && (
                <div 
                    className="artwork-image__magnify-overlay-wrapper"
                    onClick={handleToggleMagnify}    
                >
                    <div 
                        className="artwork-image__magnify-frame" 
                        style={{ width: viewportWidth, height: viewportHeight, overflow: 'hidden' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="artwork-image__magnify-slider-wrapper"
                            style={{
                                width: viewportWidth * allImageDetails.length,
                                transform: `translateX(-${currentImageIndex * viewportWidth}px)`
                            }}
                        >
                            {allImageDetails.map((image, index) => {
                                const currentRef = imageRefsRef.current[index]
                                const imageMagnifiedW = image.imageWidth
                                const imageMagnifiedH = image.imageHeight

                                const effectiveContainerW = viewportWidth - (2 * BORDER_PADDING)
                                const effectiveContainerH = viewportHeight - (2 * BORDER_PADDING)

                                const canDragImage = imageMagnifiedW > effectiveContainerW || imageMagnifiedH > effectiveContainerH

                                const dragLimitLeft = (viewportWidth - BORDER_PADDING) - imageMagnifiedW
                                const dragLimitRight = BORDER_PADDING
                                const dragLimitTop = (viewportHeight - BORDER_PADDING) - imageMagnifiedH
                                const dragLimitBottom = BORDER_PADDING

                                // const dragLeft = -(imageMagnifiedW - effectiveContainerW)
                                // const dragTop = -(imageMagnifiedH - effectiveContainerH)

                                const imageDragBounds: DragBounds = {
                                    left: canDragImage ? dragLimitLeft : 0, 
                                    right: canDragImage ? dragLimitRight : 0, 
                                    top: canDragImage ? dragLimitTop : 0, 
                                    bottom: canDragImage ? dragLimitBottom : 0
                                }

                                // const centeringMarginLeft = (viewportWidth - imageMagnifiedW) / 2;
                                // const centeringMarginTop = (viewportHeight - imageMagnifiedH) / 2;

                                return (
                                    <div
                                        key={index}
                                        className="artwork-image__magnified-slide"
                                        style={{ width: viewportWidth, height: viewportHeight }}
                                    >
                                        <Draggable
                                            nodeRef={currentRef}
                                            disabled={!canDragImage}
                                            bounds={imageDragBounds}
                                            position={dragPositions[index] || { x: 0, y:0 }}
                                            onDrag={handleDrag(index)}
                                            onStop={handleDrag(index)}
                                        >
                                            <div
                                                ref={currentRef}
                                                className="artwork-image__magnified-image-wrapper"
                                                style={{
                                                    cursor: canDragImage ? 'grab' : 'default',
                                                    width: imageMagnifiedW,
                                                    height: imageMagnifiedH,
                                                    opacity: index === currentImageIndex && enlargedArtworkLoading ? 0 : 1,
                                                    transition: 'opacity 0.3s ease-in-out',
                                                    // marginLeft: centeringMarginLeft,
                                                    // marginTop: centeringMarginTop
                                                }}
                                            >
                                                <Image
                                                    src={image.imageSrc}
                                                    alt={image.altText}
                                                    width={imageMagnifiedW}
                                                    height={imageMagnifiedH}
                                                    quality={100}
                                                    priority={index === currentImageIndex}
                                                    draggable={false}
                                                    style={{ objectFit: 'contain' }}
                                                    onLoad={() => {
                                                        if (index === currentImageIndex) {
                                                            setEnlargedArtworkLoading(false)
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </Draggable>
                                    </div>
                                )
                            })}
                        </div>
                        
                        {magnifiedDims.canDrag && (
                            <div className="artwork-image__mini-map-container" style={{ width: miniMap.MINI_MAP_SIZE, height: miniMap.MINI_MAP_SIZE }}>
                                {/* Moving Artwork Outline (now a sibling) */}
                                <div 
                                    className="artwork-image__mini-map-image-outline" 
                                    style={{ 
                                        width: miniMap.mapImgW, 
                                        height: miniMap.mapImgH, 
                                        transform: `translate(${miniMap.finalImgTranslateX}px, ${miniMap.finalImgTranslateY}px)` 
                                    }}
                                />
                                {/* Fixed Viewport Box (now a sibling) */}
                                <div 
                                    className="artwork-image__mini-map-viewport-box" 
                                    style={{ 
                                        width: miniMap.viewScaleW, 
                                        height: miniMap.viewScaleH, 
                                        transform: `translate(${miniMap.fixedBoxPosX}px, ${miniMap.fixedBoxPosY}px)` 
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ArtworkImage