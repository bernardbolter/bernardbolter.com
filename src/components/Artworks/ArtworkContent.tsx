'use client'

import { Artwork } from '@/types/artworkTypes'
import ArtworkImage from '@/components/Artworks/ArtworkImage'
import ArtworkVideo from '@/components/Artworks/ArtworkVideo'
import NoArtworks from '@/components/Artworks/NoArtworks'

interface ArtworkContentProps {
    artwork: Artwork
}

const ArtworkContent: React.FC<ArtworkContentProps> = ({
    artwork
}) => { 
    const fields = artwork.artworkFields
    
    const isVideo = !!fields?.videoPoster || !!fields?.videoYouttubeLink
    const isImage = !!fields?.artworkImage

    if (isVideo) {
        return (
            <ArtworkVideo
                artwork={artwork}
            />
        )
    }

    if (isImage) {
        return (
            <ArtworkImage
                artwork={artwork}
            />
        )
    }

    return (
        <NoArtworks />
    )
}

export default ArtworkContent