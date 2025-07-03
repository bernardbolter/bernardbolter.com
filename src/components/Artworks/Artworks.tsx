'use client'

import { useContext, useEffect, useState } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider'

import ArtworksTimeline from './ArtworksTimeline'
import Loading from '@/components/Loading'

import { Artwork } from '@/types/artworks'

const Artworks = ({ gArtworks }: { gArtworks: Artwork[]}) => {
    // console.log(gArtworks)
    const [ artworks, setArtworks ] = useContext(ArtworksContext)
    // console.log(artworks)
    const [loading, setLoading] = useState(true)
    const [noArtworks, setNoArtworks] = useState(false)

    useEffect(() => {
        if (gArtworks.length === 0) {
            setLoading(false)
            setNoArtworks(true)
        }
    }, [gArtworks])

    useEffect(() => {
        if (artworks.original.length === 0) {
            setArtworks(state => ({ ...state, original: [...gArtworks], filtered: [...gArtworks] }))
            setLoading(false)
        } else {
            setLoading(false)
        }
    }, [gArtworks, artworks, setArtworks])

    if (loading) {
        return <Loading />
    }

    return (
        <section className="artworks-container">
            { noArtworks 
                ?   <p>No artworks found.</p> 
                :   <ArtworksTimeline artworks={artworks.filtered} />
            }
        </section>
    )
}

export default Artworks