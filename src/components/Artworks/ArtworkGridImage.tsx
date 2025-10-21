'use client'

import Image from 'next/image'
import Link from 'next/link'

import { useArtworkDimensions } from '@/hooks/useArtworkDimensions'
import { seriesColorBlurDataURLs } from '@/helpers/blurURLs'
import { getSeriesColor } from '@/helpers/seriesColor'
import PlayButtonSvg from '@/svgs/PlayButtonSvg'

import { Artwork } from '@/types/artworkTypes'
interface ArtworkGridImageProps {
  artwork: Artwork
  itemSize: {
    width: number
    height: number
    gap: number
  }
}
interface ImageDetails {
  imageSrc: string
  blurDataURL: string
  altText: string
  displayWidth: number
  displayHeight: number
}

const INFO_BOX_HEIGHT = 49

const ArtworkGridImage: React.FC<ArtworkGridImageProps> = ({
  artwork,
  itemSize
}) => {
  const isVideo = !artwork.artworkFields?.artworkImage && !!artwork.artworkFields?.videoPoster
  const imageSource = isVideo ? artwork.artworkFields?.videoPoster : artwork.artworkFields?.artworkImage
  const imageNode = imageSource?.node

  const { displayWidth, displayHeight } = useArtworkDimensions({
    artworkContainerWidth: itemSize.width,
    artworkContainerHeight: 5000, // Allow height to scale freely
    imageWidth: imageNode?.mediaDetails?.width || 800,
    imageHeight: imageNode?.mediaDetails?.height || 800,
    artworkSize: artwork.artworkFields?.size || 'lg',
    useImageFactors: !isVideo // Use image factors for images, default for videos
  })

  const getImageDetails = (): ImageDetails => {
    const seriesSlug = artwork.artworkFields?.series || 'default'
    return {
      imageSrc: imageNode?.sourceUrl || '',
      blurDataURL: seriesColorBlurDataURLs[seriesSlug],
      altText: artwork.title || 'Artwork',
      displayWidth,
      displayHeight
    }
  }

  const getImageSizes = (itemWidth: number): string => {
    return `(max-width: 550px) 100vw, (max-width: 768px) 50vw, (max-width: 980px) 33vw, (max-width: 1200px) 25vw, ${itemWidth}px`
  }

  const { imageSrc, blurDataURL, altText, displayWidth: finalWidth, displayHeight: finalHeight } = getImageDetails()

  const horizontalMargin = Math.round((itemSize.width - finalWidth) / 2)

    // Tesing Logs
    // console.log(`ArtworkGridImage: isVideo=${isVideo}, imageSrc=${imageSrc}, blurDataURL=${blurDataURL}, display=${finalWidth}x${finalHeight}, margin=${horizontalMargin}, loading=lazy`)

  return (
    <Link
      href={`/${artwork.slug}`}
      className="artwork-grid__image-container"
      style={{
        width: itemSize.width,
        paddingBottom: INFO_BOX_HEIGHT
      }}
    >
      <div
        className="artwork-grid__image-wrapper"
        style={{
          marginLeft: horizontalMargin,
          marginRight: horizontalMargin
        }}
      >
        {isVideo && <PlayButtonSvg />}
        <Image
          className="artwork-grid__image"
          src={imageSrc}
          alt={altText}
          width={finalWidth}
          height={finalHeight}
          style={{ objectFit: 'contain' }}
          placeholder="blur"
          blurDataURL={blurDataURL}
          loading="lazy"
          sizes={getImageSizes(itemSize.width)}
        />
        <div className="artwork-grid__info">
            <div
                className="artwork-grid__info--series-box"
                style={{
                backgroundColor: getSeriesColor(artwork.artworkFields?.series || '')
                }}
            />
            <h3>{artwork.title}</h3>
        </div>
      </div>
    </Link>
  )
}

export default ArtworkGridImage