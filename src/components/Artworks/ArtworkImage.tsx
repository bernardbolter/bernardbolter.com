import { Artwork } from '@/types/artworksTypes'

import Info from '@/components/Info/Info'

type ArtworkImageProps = {
    artwork: Artwork
}

const ArtworkImage = ({artwork}: ArtworkImageProps) => {
    console.log("in artwork image: ", artwork)
    return (
        <section className="artwork-image__container">
            <Info />
            <h1>Artwork</h1>
        </section>
    )
}

export default ArtworkImage