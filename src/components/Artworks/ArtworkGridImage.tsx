import Image from "next/image"
import { useArtworkDimensions } from "@/hooks/useArtworkDimensions"
import { Artwork } from "@/types/artworkTypes"

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

    const imageNode = artwork.artworkFields?.artworkImage?.node
    const imageSrc = imageNode?.sourceUrl || ''
    const imageSrcSet = imageNode?.srcSet || ''
    const imageBlur = imageNode?.blurDataURL || ''

    return (
        <div 
            className="artwork-grid__image-container"
            style={{
                width: itemSize.width,
                height: itemSize.height
            }}
        >
            <Image
                className="artwork-grid__image"
                src={imageSrc}
                {...(imageSrcSet && { srcSet: imageSrcSet })}
                alt={artwork.title}
                width={displayWidth}
                height={displayHeight}
                placeholder="blur"
                blurDataURL={imageBlur}
            />
        </div>
        
    )
}

export default ArtworkGridImage