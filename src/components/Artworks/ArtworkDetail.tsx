'use client'

import Image from 'next/image'
import Link from 'next/link'

import { useArtworkDimensions } from '@/hooks/useArtworkDimensions'
import { seriesColorBlurDataURLs } from '@/helpers/blurURLs'
import PlayButtonSvg from '@/svgs/PlayButtonSvg'

import { Artwork } from '@/types/artworkTypes'

interface ArtworkDetailProps {
  artwork: Artwork
  artworkContainerWidth: number
  artworkContainerHeight: number
}

interface ImageDetails {
  imageSrc: string
  blurDataURL: string
  altText: string
}

const ArtworkDetail: React.FC<ArtworkDetailProps> = ({
  artwork,
  artworkContainerWidth,
  artworkContainerHeight
}) => {
  const isVideo = !artwork.artworkFields?.artworkImage && !!artwork.artworkFields?.videoPoster
  const imageSource = isVideo ? artwork.artworkFields?.videoPoster : artwork.artworkFields?.artworkImage
  const imageNode = imageSource?.node

  const { displayWidth, displayHeight } = useArtworkDimensions({
    artworkContainerWidth,
    artworkContainerHeight,
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
      altText: artwork.title || 'Artwork'
    }
  }

  const { imageSrc, blurDataURL, altText } = getImageDetails()

  // FOR TESTING
  // console.log(`ArtworkDetail: isVideo=${isVideo}, imageSrc=${imageSrc}, blurDataURL=${blurDataURL}, display=${displayWidth}x${displayHeight}`)

  return (
    <Link href={`/${artwork.slug}`} className="artwork-detail__link">
      <div className="artwork-detail__image-container" style={{ width: displayWidth, height: displayHeight }}>
        {isVideo && <PlayButtonSvg />}
        <Image
          className="artwork-detail__image"
          src={imageSrc}
          alt={altText}
          width={displayWidth}
          height={displayHeight}
          style={{ objectFit: 'contain' }}
          placeholder="blur"
          blurDataURL={blurDataURL}
          priority={true}
        />
      </div>
    </Link>
  )
}

export default ArtworkDetail