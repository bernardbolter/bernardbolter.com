import { Artwork } from '@/types/artworks'
type ArtworkImageProps = {
    artwork: Artwork
}

const ArtworkImage = ({artwork}: ArtworkImageProps) => {
    console.log("in artwork image: ", artwork)
    return (
        <section className="artwork-image__container">
            <h1>Artwork</h1>
        </section>
    )
}

export default ArtworkImage