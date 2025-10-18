import { useState, useMemo } from 'react' 
import Image from "next/image"
import { useArtworkDimensions } from "@/hooks/useArtworkDimensions"
import { Artwork } from "@/types/artworkTypes"
import { getSeriesColor } from '@/helpers/seriesColor'
import { getSeriesInitials } from '@/helpers/seriesInitals'
interface ArtworkGridImageProps {
    artwork: Artwork,
    itemSize: {
        width: number,
        height: number
    }
}

const ArtworkGridImage: React.FC<ArtworkGridImageProps> = ({
    artwork,
    itemSize,
})  => {
    const { displayWidth, displayHeight } = useArtworkDimensions({
        artwork,
        artworkContainerWidth: itemSize.width,
        artworkContainerHeight: itemSize.height
    })
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const imageNode = artwork.artworkFields?.artworkImage?.node
    const imageSrc = imageNode?.sourceUrl || ''
    const imageSrcSet = imageNode?.srcSet || ''

    const bottomMargin = useMemo(() => {
        return ((itemSize.height - displayHeight) / 2) - 29
    }, [itemSize.height, displayHeight] )

    const rightMargin = useMemo(() => {
        return ((itemSize.width - displayWidth) / 2)
    }, [itemSize.width, displayWidth])

    return (
        <div 
            className="artwork-grid__image-container"
            style={{
                width: itemSize.width,
                height: itemSize.height
            }}
        >
            {!isLoading && <div className={isLoading ? 'artwork-grid__loading' : 'artwork-grid__loading--off'} />}
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
                style={{
                    bottom: bottomMargin,
                    right: rightMargin
                }}
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
    )
}

export default ArtworkGridImage