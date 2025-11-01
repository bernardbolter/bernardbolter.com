'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { RefObject } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import useWindowSize from '@/hooks/useWindowSize'
import DOMPurify from 'dompurify'

import { getSeriesColor } from '@/helpers/seriesColor'
import { seriesColorBlurDataURLs } from '@/helpers/blurURLs'

import Info from '@/components/Info/Info'
import ArtworkSize from './ArtworkSize'
import MagnifyAnimationSvg from '@/svgs/MagnifyAnimationSvg'
import LeftArrowSvg from '@/svgs/LeftArrowSvg'
import ArtworkPauseSvg from '@/svgs/ArtworkPauseSvg'
import CloseCircleSvg from '@/svgs/CloseCircleSvg'
import ArtworkTimerSvg from '@/svgs/ArtworkTimerSvg'

import { Artwork, ArtworkImageNode } from '@/types/artworkTypes'
import { useArtworkDimensions } from '@/hooks/useArtworkDimensions'

// --- Type Definitions ---
interface ArtworkImageProps { artwork: Artwork }
interface DragBounds { left: number; right: number; top: number; bottom: number; }
interface DragPosition { x: number; y: number; }

type ArtworkImageNodeWithAlt = 
  Omit<ArtworkImageNode, 'altText' | 'srcSet'> & 
  { 
    altText?: string; 
    srcSet?: string; 
  }
interface ArtworkImageDetail { 
    imageSrc: string
    imageWidth: number
    imageHeight: number
    altText?: string
    imageSrcSet?: string
    blurDataURL?: string
    seriesSlug?: string
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
    const [imageLoadingStates, setImageLoadingStates] = useState<boolean[]>([])
    const [imageErrorStates, setImageErrorStates] = useState<boolean[]>([])
    const [enlargedArtworkLoading, setEnlargedArtworkLoading] = useState<boolean>(true)
    const [enlargedArtworkError, setEnlargedArtworkError] = useState<boolean>(false)
    const [enlargeArtwork, setEnlargeArtwork] = useState<boolean>(false)
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
    const [dragPositions, setDragPositions] = useState<DragPosition[]>([])
    const [artworkContent, setArtworkContent] = useState<string>('')
    const [provenaceData, setProvenanceData] = useState<string>('')
    const [exhibitionHistoryData, setExhibitionHistoryData] = useState<string>('')
    const [printEditionsData, setPrintEditionsData] = useState<string>('')
    const [artworkPlaying, setArtworkPlaying] = useState<boolean>(true)
    const [timerProgress, setTimerProgress] = useState<number>(0)

    const size = useWindowSize();
    const viewportWidth = size.width || 0;
    const viewportHeight = size.height || 0;

    const imageRefsRef = useRef<RefObject<HTMLDivElement>[]>([])

    const seriesColor = useMemo(() => {
        return getSeriesColor(artwork.artworkFields?.series || '')
    }, [artwork.artworkFields?.series])

    useEffect(() => {
        // Sanitize content and provenance, default to empty string if null
        setArtworkContent(DOMPurify.sanitize(artwork.content || ''))
        setProvenanceData(DOMPurify.sanitize(artwork.artworkFields?.provenance || ''))
        setExhibitionHistoryData(DOMPurify.sanitize(artwork.artworkFields?.exhibitionHistory || ''))
        setPrintEditionsData(DOMPurify.sanitize(artwork.artworkFields?.printEditions || ''))
    }, [artwork.content, artwork.artworkFields?.provenance, artwork.artworkFields?.exhibitionHistory, artwork.artworkFields?.printEditions])

    // console.log("artwork image: ", artwork.artworkFields)

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
    
    const maxIndex = allImageNodes.length - 1
    const hasMultipleImages = allImageNodes.length > 1

    // --- 2. Get Details for all images
    const allImageDetails: ArtworkImageDetail[] = useMemo(() => {
        return allImageNodes.map(node => ({
            imageSrc: node?.sourceUrl || '',
            imageSrcSet: node?.srcSet || '',
            imageWidth: node?.mediaDetails?.width || 800,
            imageHeight: node?.mediaDetails?.height || 800,
            altText: node?.altText || artwork.title || 'Artwork Image',
            blurDataURL: seriesColorBlurDataURLs[artwork.artworkFields?.series || 'a-colorful-history']
        }))
    }, [allImageNodes, artwork.title, artwork.artworkFields.series])

    useMemo(() => {
        // Only run if the number of images has changed
        if (imageRefsRef.current.length !== allImageDetails.length) {
            imageRefsRef.current = allImageDetails.map(() => ({ current: null } as unknown as RefObject<HTMLDivElement>))
        }
        if (imageLoadingStates.length !== allImageDetails.length) {
        setImageLoadingStates(new Array(allImageDetails.length).fill(false))
        }
        if (imageErrorStates.length !== allImageDetails.length) {
            setImageErrorStates(new Array(allImageDetails.length).fill(false))
        }
    }, [allImageDetails, imageLoadingStates.length, imageErrorStates.length])

    if (dragPositions.length === 0 && allImageDetails.length > 0) {
        setDragPositions(allImageDetails.map(() => ({ x: 0, y: 0 })))
    }

    const currentImageDetail: ArtworkImageDetail = useMemo(() => {
        return allImageDetails[currentImageIndex] || {
            imageSrc: '',
            imageWidth: 800,
            imageHeight: 800,
            altText: artwork.title || "",
            imageSrcSet: '',
            blurDataURL: ''
        }
    }, [allImageDetails, currentImageIndex, artwork.title])

    const {
        imageWidth,
        imageHeight,
    } = currentImageDetail

    const currentDragPosition = useMemo(() => {
        return dragPositions[currentImageIndex] || { x:0, y: 0 }
    }, [dragPositions, currentImageIndex])

    // Helper function to calculate the correct initial centered and clamped drag position
    const getInitialDragPosition = useCallback((index: number): DragPosition => {
        const imageDetail = allImageDetails[index]
        if (!imageDetail) return { x: 0, y: 0 }

        const currentW = imageDetail.imageWidth
        const currentH = imageDetail.imageHeight
        
        const dragLimitLeft = (viewportWidth - BORDER_PADDING) - currentW
        const dragLimitRight = BORDER_PADDING
        const dragLimitTop = (viewportHeight - BORDER_PADDING) - currentH
        const dragLimitBottom = BORDER_PADDING
        
        // 2. Calculate the position required to center the image in the full viewport
        const centerX = (viewportWidth - currentW) / 2
        const centerY = (viewportHeight - currentH) / 2
        
        // 3. Clamp the center position: position must be >= min limit and <= max limit.
        const clampedInitialX = Math.max(dragLimitLeft, Math.min(dragLimitRight, centerX))
        const clampedInitialY = Math.max(dragLimitTop, Math.min(dragLimitBottom, centerY))
        
        return { x: clampedInitialX, y: clampedInitialY };
    }, [allImageDetails, viewportWidth, viewportHeight])

    // --- 3. Image Navigation Handlers ---
    const resetAndChangeImage = useCallback((newIndex: number) => {
        if (enlargeArtwork && allImageDetails[newIndex]) {
            if (newIndex !== currentImageIndex) {
                const newInitialPosition = getInitialDragPosition(newIndex);
                
                setDragPositions(prevPositions => {
                    const newPositions = [...prevPositions];
                    newPositions[newIndex] = newInitialPosition;
                    return newPositions;
                });

                setEnlargedArtworkLoading(true)
                setEnlargedArtworkError(false)
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
    })

    const imageSizes = useMemo(() => {
        const cappedWidth = Math.round(displayWidth)
        return `(max-width: 768px) 100vw, ${cappedWidth}px`
    }, [displayWidth])

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
                setEnlargedArtworkLoading(true)
                setEnlargedArtworkError(false)

                const initialPosition = getInitialDragPosition(currentImageIndex);
                
                setDragPositions(prevPositions => {
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
        const MINI_MAP_SIZE = 120
        const PADDING = 10
        const drawableSize = MINI_MAP_SIZE - (2 * PADDING)
        const imgW = magnifiedDims.width
        const imgH = magnifiedDims.height
        const containerW = containerDims.width
        const containerH = containerDims.height
        const currentX = currentDragPosition.x
        const currentY = currentDragPosition.y

        // --- Calculate bounds for fractional calculation ---
        const dragLimitLeft = (viewportWidth - BORDER_PADDING) - imgW
        const dragLimitRight = BORDER_PADDING
        const dragLimitTop = (viewportHeight - BORDER_PADDING) - imgH
        const dragLimitBottom = BORDER_PADDING

        // Calculate map image dimensions
        const imgAspectRatio = imgW / imgH
        let mapImgW: number, mapImgH: number
        if (imgAspectRatio >= 1) {
            mapImgW = drawableSize
            mapImgH = drawableSize / imgAspectRatio
        } else {
            mapImgH = drawableSize
            mapImgW = drawableSize * imgAspectRatio
        }

        // Calculate viewport box scaled dimensions
        const viewScaleW = mapImgW * (containerW / imgW)
        const viewScaleH = mapImgH * (containerH / imgH)

        // Calculate fractional scroll distance (0 to 1)
        const scrollDistX = dragLimitRight - dragLimitLeft
        const scrollOffsetX = currentX - dragLimitLeft
        const fracX = scrollDistX > 0 ? scrollOffsetX / scrollDistX : 0

        const scrollDistY = dragLimitBottom - dragLimitTop
        const scrollOffsetY = currentY - dragLimitTop
        const fracY = scrollDistY > 0 ? scrollOffsetY / scrollDistY : 0
        
        // Total movement range for the map image outline
        const mapScrollDistX = mapImgW - viewScaleW
        const mapScrollDistY = mapImgH - viewScaleH

        // This is the anchor point for the outline's movement (its max right/bottom position)
        const fixedBoxPosX = (MINI_MAP_SIZE - viewScaleW) / 2
        const fixedBoxPosY = (MINI_MAP_SIZE - viewScaleH) / 2
        
        // UP/LEFT Limit: The fixed box position minus the full scroll distance.
        const leftLimitX = fixedBoxPosX - mapScrollDistX;
        const topLimitY = fixedBoxPosY - mapScrollDistY;

        // Final translation: start at the limit and add back the fractional scroll distance
        const finalImgTranslateX = leftLimitX + (fracX * mapScrollDistX)
        const finalImgTranslateY = topLimitY + (fracY * mapScrollDistY)

        return {
            mapImgW, mapImgH,
            viewScaleW, viewScaleH,
            fixedBoxPosX, fixedBoxPosY,
            finalImgTranslateX, finalImgTranslateY,
            MINI_MAP_SIZE
        };
    }, [magnifiedDims, containerDims, currentDragPosition, viewportWidth, viewportHeight]);

    // Timer on multiple images
    useEffect(() => {
        if (!hasMultipleImages || !artworkPlaying || enlargeArtwork) {
            setTimerProgress(0)
            return
        }

        const INTERVAL = 4000
        const UPDATE_FREQUENCY = 50
        const INCREMENT = (100 / INTERVAL) * UPDATE_FREQUENCY

        let progress = 0
        
        const progressInterval = setInterval(() => {
            progress += INCREMENT
            if (progress >= 100) {
                progress = 0
                handleNextImage()
            }
            setTimerProgress(progress)
        }, UPDATE_FREQUENCY)

        return () => {
            clearInterval(progressInterval)
            setTimerProgress(0)
        }
    }, [hasMultipleImages, artworkPlaying, enlargeArtwork, handleNextImage])

    // --- 9. Render ---
    if (!allImageDetails.length) return null;

    // console.log(artwork)

    return (
        <div className="artwork-image__main-scroll-wrapper">
            <Info />
            <Link
                href="/"
                className="artwork-image__close"
            >
                <CloseCircleSvg />
                <p>close</p>
            </Link>
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
                        {allImageDetails.map((detail, index) => {
                            const { imageSrc, altText } = detail
                            const isCurrent = index === currentImageIndex
                            const isImageLoaded = imageLoadingStates[index]
                            const hasImageError = imageErrorStates[index]

                            return (
                                <div
                                    key={index}
                                    className="artwork-image__image-slide"
                                    style={{
                                        width: displayWidth,
                                        height: displayHeight
                                    }}
                                >
                                    <div 
                                        className="artwork-image__image-wrapper"
                                        style={{ 
                                            width: displayWidth, 
                                            height: displayHeight,
                                            backgroundColor: seriesColor,
                                            position: 'relative'
                                        }}   
                                    >
                                        {(isImageLoaded === false || hasImageError) && (
                                            <div
                                                className="artwork-detail__placeholder-overlay"
                                                style={{
                                                    zIndex: hasImageError ? 20 : 10
                                                }}
                                            >
                                                <p>{artwork.title}</p>
                                                <p>{hasImageError ? 'image failed to load' : 'loading...'}</p>
                                            </div>
                                        )}
                                        <Image
                                            className="artwork-image__image"
                                            src={imageSrc}
                                            sizes={imageSizes}
                                            alt={altText || artwork.title || 'Bernard Bolter Artwork'}
                                            width={displayWidth}
                                            height={displayHeight}
                                            quality={80}
                                            placeholder='blur'
                                            blurDataURL={detail.blurDataURL}
                                            onLoad={() => {
                                                if (!isImageLoaded) {
                                                    setImageLoadingStates(prevStates => {
                                                        const newStates = [...prevStates]
                                                        newStates[index] = true
                                                        return newStates;
                                                    })
                                                }
                                            }}
                                            onError={() => {
                                                setImageLoadingStates(prevStates => {
                                                    const newStates = [...prevStates]
                                                    newStates[index] = true
                                                    return newStates;
                                                })
                                                setImageErrorStates(prevStates => {
                                                    const newStates = [...prevStates]
                                                    newStates[index] = true
                                                    return newStates;
                                                })
                                            }}
                                            priority={isCurrent}
                                            style={{ 
                                                objectFit: 'cover',
                                                opacity: hasImageError ? 0 : 1
                                            }}
                                            key={index}
                                        />
                                    </div>
                                </div>
                            )
                        })}
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
                    <div className="artwork-image__info--details-container">
                        <div className="artwork-image__info--line"/>
                        <div className="artwork-image__info--about-section">
                            {artworkContent && (
                                <div className="artwork-image__info--about-wrapper">
                                    <h2>About the Artwork</h2>
                                    <div className="artwork-image__info--about"
                                        dangerouslySetInnerHTML={{ __html: artworkContent }}
                                    />
                                </div>
                                
                            )}
                            {printEditionsData && (
                                <div className="artwork-image__info--print-editions-wrapper">
                                    <h2>Print Editions</h2>
                                    <div className="artwork-image__info--print-editions"
                                        dangerouslySetInnerHTML={{ __html: printEditionsData}}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="artwork-image__info--details">
                            {artwork.artworkFields?.forsale && (
                                <div className="artwork-image__info--available">
                                    <h2>This artwork is available</h2>
                                    <div className="artwork-image__info--price-wrapper">
                                        <h3>{artwork.artworkFields?.price}€</h3>
                                        <p>shipping in the EU included</p>
                                    </div>
                                    <p className="artwork-image__info--email">email for details</p>
                                    <h5>bernardbolter@gmail.com</h5>
                                </div>
                            )}
                            {artwork.artworkFields?.location === 'unknown' && (
                                <div className="artwork-image__info--unknown">
                                    <p>If you happen to own this artwork, email me. I’ll add you and your details to this page, officially connecting you to its history. <Link href="/contact">bernardbolter@gmail.com</Link></p>
                                </div>
                            )}
                            {artwork.artworkFields?.location && (
                                <div className="artwork-image__info--location">
                                    <h2>Current Location</h2>
                                    <p>{artwork.artworkFields?.location}</p>
                                </div>
                            )}
                            {provenaceData && (
                                <div className="artwork-image__info--provenance-wrapper">
                                    <h2>Provenance <span>(history of ownership)</span></h2>
                                    <div className="artwork-image__info--provenance"
                                        dangerouslySetInnerHTML={{ __html: provenaceData}}
                                    />
                                </div>
                            )}
                            {exhibitionHistoryData && (
                                <div className="artwork-image__info--exhibition-history-wrapper">
                                    <h2>Exhibition History</h2>
                                    <div className="artwork-image__info--exhibition-history"
                                        dangerouslySetInnerHTML={{ __html: exhibitionHistoryData}}
                                    />
                                </div>
                            )}
                            
                            </div>
                        </div>
                    </div>
                </div>
            
            {/* Multiple Buttons and Counter */}
            {hasMultipleImages && (
                <div className="artwork-image__buttons-container">
                    <div className="artwork-image__counter">
                        <p>{currentImageIndex + 1} / {allImageNodes.length}</p>
                    </div>
                    <div className="artwork-image__button" onClick={handlePrevImage} aria-label="Previous Image">
                        <LeftArrowSvg isRight={false} />
                    </div>
                    <div className="artwork-image__button right-arrow" onClick={handleNextImage} aria-label="Next Image">
                        <LeftArrowSvg isRight= {true} />
                    </div>
                    {!enlargeArtwork && (<div className="artwork-image__button">
                        <ArtworkPauseSvg 
                            artworkPlaying={artworkPlaying} 
                            setArtworkPlaying={setArtworkPlaying}    
                        />
                    </div>)}
                    {!enlargeArtwork && (<div className="artwork-image__button artwork-image__button--timer">
                        <ArtworkTimerSvg progress={timerProgress} />
                    </div>
                    )}
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

                                const imageDragBounds: DragBounds = {
                                    left: canDragImage ? dragLimitLeft : 0, 
                                    right: canDragImage ? dragLimitRight : 0, 
                                    top: canDragImage ? dragLimitTop : 0, 
                                    bottom: canDragImage ? dragLimitBottom : 0
                                }

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
                                                    position: 'relative',
                                                    background: seriesColor
                                                }}
                                            >
                                                <Image
                                                    src={image.imageSrc}
                                                    alt={image.altText ?? ''}
                                                    width={imageMagnifiedW}
                                                    height={imageMagnifiedH}
                                                    quality={100}
                                                    unoptimized={true}
                                                    blurDataURL={image.blurDataURL}
                                                    placeholder='blur'
                                                    priority={index === currentImageIndex}
                                                    draggable={false}
                                                    style={{ 
                                                        objectFit: 'contain',
                                                        opacity: enlargedArtworkError && index === currentImageIndex ? 0 : 1
                                                    }}
                                                    onLoad={() => {
                                                        if (index === currentImageIndex) {
                                                            setEnlargedArtworkLoading(false)
                                                            setEnlargedArtworkError(false)
                                                        }
                                                    }}
                                                    onError={() => {
                                                        if (index === currentImageIndex) {
                                                            setEnlargedArtworkLoading(false)
                                                            setEnlargedArtworkError(true)
                                                        }
                                                    }}
                                                />
                                                {(index === currentImageIndex) && (enlargedArtworkLoading || enlargedArtworkError) && (
                                                    <div 
                                                        className="artwork-image__loading-text"
                                                        style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            textAlign: 'center',
                                                            color: 'white',
                                                            zIndex: enlargedArtworkError ? 20 : -1
                                                        }}
                                                    >
                                                        {enlargedArtworkError ? (
                                                            <>
                                                                <p>{artwork.title}</p>
                                                                <p>high-resolution image failed to load</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p>loading high-resolution</p>
                                                                <p>{`${artwork.title}...`}</p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Draggable>
                                    </div>
                                )
                            })}
                        </div>
                        
                        {magnifiedDims.canDrag && (
                            <div className="artwork-image__mini-map-container" style={{ width: miniMap.MINI_MAP_SIZE, height: miniMap.MINI_MAP_SIZE }}>
                                <div 
                                    className="artwork-image__mini-map-image-outline" 
                                    style={{ 
                                        width: miniMap.mapImgW, 
                                        height: miniMap.mapImgH, 
                                        transform: `translate(${miniMap.finalImgTranslateX}px, ${miniMap.finalImgTranslateY}px)` 
                                    }}
                                />
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