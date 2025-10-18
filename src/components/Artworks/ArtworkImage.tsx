'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Draggable from 'react-draggable'
import useWindowSize from '@/hooks/useWindowSize'

import Info from '@/components/Info/Info'
import MagnifySvg from '@/svgs/MagnifySvg'

import { 
    ArtworkImageProps, 
    OrientationKey, 
    SizeKey,
    SIZE_FACTORS,
    ArtworkDimensions,
    MagnifiedDimensions,
    DragBounds
} from '@/types/artworkImageTypes'
import { useArtworkDimensions } from '@/hooks/useArtworkDimensions'

const ArtworkImage = ({artwork}: ArtworkImageProps) => {
    const [artworkLoading, setArtworkLoading] = useState<boolean>(true)
    const [magnifiedArtworkLoading, setMagnifiesARtworkLoading] = useState<boolean>(true)
    const [enlargeArtwork, setEnlargeArtwork] = useState<boolean>(false)
    const [dragBounds, setDragBounds] = useState<DragBounds>({ left: 0,right: 0,top: 0,bottom: 0})
    const size = useWindowSize()
    // console.log("in artwork image: ", artwork)

    const imageNode = artwork.artworkFields?.artworkImage?.node
    const imageSrc = imageNode?.sourceUrl || ''
    const imageSrcSet = imageNode?.srcSet || ''
    const imageWidth = imageNode?.mediaDetails?.width || 800
    const imageHeight = imageNode?.mediaDetails?.height || 800
    console.log(imageSrc, imageSrcSet, imageWidth, imageHeight)

    const orientationArray = artwork.artworkFields?.orientation
    const sizeArray = artwork.artworkFields?.size

    const { displayWidth, displayHeight } = useArtworkDimensions({
        artwork,
        artworkContainerWidth: size.width || 0,
        artworkContainerHeight: size.height || 0
    })

    const currentOrientation: OrientationKey = (() => {
        const rawKey = Array.isArray(orientationArray) && orientationArray[0]
            ? orientationArray[0]
            : 'square'
        return rawKey.toLowerCase().trim() as OrientationKey
    })()

    const currentSize: SizeKey = (() => {
        const rawKey = Array.isArray(sizeArray) && sizeArray[0]
            ? sizeArray[0]
            : (typeof sizeArray === 'string' ? sizeArray : 'lg')
        const normalizedSize = rawKey.toLowerCase().trim()
        const validKeys= Object.keys(SIZE_FACTORS) as SizeKey[]

        if (!validKeys.includes(normalizedSize as SizeKey)) {
            return 'lg'
        }

        return normalizedSize as SizeKey
    })()

    const getDisplayDimensions = (): DisplayDimensions => {
       return {
        width: 1500,
        height: 1500
       }
    }

    const getMagnifiedDimensions = (): MagnifiedDimensions => {
        const screenWidth = size.width
        const screenHeight = size.height

        const maxOverlayWidth = screenWidth - 80
        const maxOverlayHeight = screenHeight - 80

        if (imageWidth < maxOverlayWidth && imageHeight < maxOverlayHeight) {
            return {
                width: imageWidth,
                height: imageHeight,
                canDrag: false
            }
        }

        let displayWidth = imageWidth
        let displayHeight = imageHeight

        const targetWidth = screenWidth * 1.5
        const targetHeight = screenHeight * 1.5

        if (imageWidth < targetWidth) {
            displayWidth = Math.min(imageWidth, targetWidth)
            displayHeight = displayWidth / aspectRatio
        } else if (imageHeight < targetHeight) {
            displayHeight = Math.min(imageHeight, targetHeight)
            displayWidth = displayHeight * aspectRatio
        }

        return {
            width: displayWidth,
            height: displayHeight,
            canDrag: displayWidth > maxOverlayWidth || displayHeight > maxOverlayHeight
        }
    }

    const displayDims = getDisplayDimensions()
    const magnifiedDims = getMagnifiedDimensions()

    useEffect(() => {
        if (enlargeArtwork && magnifiedDims.canDrag) {
            const viewportWidth = size.width - 80
            const viewportHeight = size.height - 80
            
            const maxX = Math.max(0, (magnifiedDims.width - viewportWidth) / 2)
            const maxY = Math.max(0, (magnifiedDims.height - viewportHeight) / 2)

            setDragBounds({
                left: -maxX,
                right: maxX,
                top: -maxY,
                bottom: maxY
            })
        }
    }, [enlargeArtwork, magnifiedDims.canDrag, magnifiedDims.width, magnifiedDims.height, size.width, size.height])

    return (
        <>
            <section className="artwork-image__container">
                <Info />
                <div 
                    className={enlargeArtwork ? "artwork-image__magnify artwork-image__magnify--open" : "artwork-image__magnify"}
                    onClick={() => setEnlargeArtwork(!enlargeArtwork)}
                >
                    <MagnifySvg />
                </div>
                <div className="artwork-image__image-container">
                    {!artworkLoading && <div className={artworkLoading ? 'artwork-image__placeholder artwork-image__placeholder--show' : 'artwork-image__placeholder' } /> }
                    <Image
                        className="artwokr-image__image"
                        src={imageSrc}
                        {...(imageSrcSet && { srcSet: imageSrcSet })}
                        alt={artwork.title}
                        width={displayWidth || 800}
                        height={displayHeight || 800}
                        onLoad={() => setArtworkLoading(false)}
                    />
                </div>
            </section>
            {/* {enlargeArtwork && (
                <Draggable
                    disabled={!magnifiedDims.canDrag}
                    bounds={dragBounds}
                    defaultPosition={{ x: 0, y: 0 }}
                >
                    <div 
                        className="artwork-image__overlay-image-wrapper"
                        style={{
                            cursor: magnifiedDims.canDrag ? 'grab' : 'default'
                        }}
                    >
                       <Image
                            src={imageSrc}
                            alt={artwork.title}
                            width={Math.round(magnifiedDims.width)}
                            height={Math.round(magnifiedDims.height)}
                            quality={100}
                            priority
                            draggable={false}
                            placeholder="blur"
                            blurDataURL={imageBlur}
                        /> 
                    </div>
                </Draggable >
            )} */}
        </>
    )
}

export default ArtworkImage