'use client'

import { useState, useEffect } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import useWindowSize from '@/hooks/useWindowSize'

import ArtworksTimeline from './ArtworksTimeline'
import ArtworksGrid from './ArtworksGrid'
import ArtworksTitle from './ArtworkTitle'
import ArtworkSwitcher from './ArtworkSwitcher'
import ArtworksSlideshow from './ArtworksSlideshow'
import Loading from '@/components/Loading'
import NoArtworks from '@/components/Artworks/NoArtworks'

const Artworks = () => {
    const [ artworks, setArtworks ] = useArtworks()
    const size = useWindowSize()

    const [noArtworks, setNoArtworks] = useState(false)

    useEffect(() => {
        if (artworks.filtered.length === 0) {
            setNoArtworks(true)
        } else {
            setNoArtworks(false)
        }
    }, [artworks.filtered])

    useEffect(() => {
        if (size.width !== undefined && size.width < 550 && !artworks.artworkViewTimeline) {
            setArtworks(state => ({ ...state, artworkViewTimeline: true}))
        }
    }, [size.width, artworks.artworkViewTimeline, setArtworks])

    if (artworks.original.length === 0) {
        return <Loading />
    }

    const showSwitcher = !artworks.showSlideshow && size.width !== undefined && size.width >=550

    return (
        <section className="artworks-container">
            {showSwitcher && <ArtworkSwitcher />}
            { noArtworks 
                ?   <NoArtworks />
                :   artworks.artworkViewTimeline
                    ? <ArtworksTimeline />
                    : <ArtworksGrid />
            }
            <ArtworksTitle />
            {artworks.showSlideshow && <ArtworksSlideshow />}
        </section>
    )
}

export default Artworks