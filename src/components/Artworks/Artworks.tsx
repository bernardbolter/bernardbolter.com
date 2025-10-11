'use client'

import { useState, useEffect } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'

import ArtworksTimeline from './ArtworksTimeline'
import ArtworksGrid from './ArtworksGrid'
import ArtworkSwitcher from './ArtworkSwitcher'
import ArtworksSlideshow from './ArtworksSlideshow'
import Loading from '@/components/Loading'
import NoArtworks from '@/components/Artworks/NoArtworks'

const Artworks = () => {
    const [ artworks ] = useArtworks()

    const [noArtworks, setNoArtworks] = useState(false)

    useEffect(() => {
        if (artworks.filtered.length === 0) {
            setNoArtworks(true)
        } else {
            setNoArtworks(false)
        }
    }, [artworks.filtered])

    if (artworks.original.length === 0) {
        return <Loading />
    }

    return (
        <section className="artworks-container">
            <ArtworkSwitcher />
            { noArtworks 
                ?   <NoArtworks />
                :   artworks.artworkViewTimeline
                    ? <ArtworksTimeline filteredArtworks={artworks.filtered} />
                    : <ArtworksGrid />
            }
            {artworks.showSlideshow && <ArtworksSlideshow filteredArtworks={artworks.filtered} />}
        </section>
    )
}

export default Artworks