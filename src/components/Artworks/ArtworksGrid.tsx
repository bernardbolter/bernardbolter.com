"use client"

import { useArtworks } from '@/providers/ArtworkProvider'

const ArtworkGrid = ()  => {
    const [artworks] = useArtworks()

    return (
        <div className='artowrk-grid__container'>
            <h1>Artwork Grid</h1>
            {artworks.filtered.map((art, i) => {
                return (
                    <p key={i}>{art.title}</p>
                )
            })}
        </div>
    )
}

export default ArtworkGrid