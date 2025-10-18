import { useState, useMemo } from 'react' 
import Image from "next/image"
import Link from 'next/link'

import { useArtworkDimensions } from "@/hooks/useArtworkDimensions"

import { Artwork } from "@/types/artworkTypes"

import { getSeriesColor } from '@/helpers/seriesColor'
import { getSeriesInitials } from '@/helpers/seriesInitals'

import PlayButtonSvg from '@/svgs/PlayButtonSvg'
interface ArtworkGridImageProps {
    artwork: Artwork,
    itemSize: {
        width: number,
        height: number,
        gap: number
    }
}

const INFO_BOX_HEIGHT = 49

const ArtworkGridImage: React.FC<ArtworkGridImageProps> = ({
    artwork,
    itemSize,
})  => {
    const { displayWidth, displayHeight } = useArtworkDimensions({
        artwork,
        artworkContainerWidth: itemSize.width,
        artworkContainerHeight: 5000
    })

    const [isLoading, setIsLoading] = useState<boolean>(true)

    const isVideo = !artwork.artworkFields?.artworkImage && !!artwork.artworkFields?.videoPoster

    const imageSource = isVideo 
        ? artwork.artworkFields?.videoPoster 
        : artwork.artworkFields?.artworkImage;

    const imageNode = imageSource?.node
    const imageSrc = imageNode?.sourceUrl || ''
    const imageSrcSet = imageNode?.srcSet || ''


    const horozontalMargin = useMemo(() => {
        return Math.round((itemSize.width / displayWidth) / 2)
    }, [itemSize.width, displayWidth])

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
                    marginLeft: horozontalMargin,
                    marginRight: horozontalMargin
                }}    
            >
                {!isLoading && <div className={isLoading ? 'artwork-grid__loading' : 'artwork-grid__loading--off'} />}
                {isVideo && <PlayButtonSvg />}
                
                <Image
                    className="artwork-grid__image"
                    src={imageSrc}
                    {...(imageSrcSet && { srcSet: imageSrcSet })}
                    alt={artwork.title}
                    width={displayWidth}
                    height={displayHeight}
                    onLoad={() => setIsLoading(false)}
                />
                <div 
                    className="artwork-grid__info"

                >
                    <h3>{artwork.title}</h3>
                    <div className="artwork-grid__info--series">
                        <p
                            style={{ color: getSeriesColor(artwork.artworkFields?.series || '') }}
                        >{getSeriesInitials(artwork.artworkFields?.series || '')}</p>
                        <div 
                            className="artwork-grid__info--series-box"
                            style={{
                                backgroundColor: getSeriesColor(artwork.artworkFields?.series || '')
                            }}   
                        >
                        </div>
                    </div>
                </div>
            </div>
       </Link> 
    )
}

export default ArtworkGridImage