'use client'

import { useContext, useEffect, useState } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider'

import ArtworksTimeline from './ArtworksTimeline'
import ArtworksSlideshow from './ArtworksSlideshow'
import Loading from '@/components/Loading'

import { Artwork } from '@/types/artworks'

const Artworks = ({ allData }: { allData: any}) => {
    console.log(allData)
    const { allArtwork, cvinfos, artistInfo, page} = allData;
    console.log(allArtwork, cvinfos, artistInfo, page)
    const [gArtworks, setGArtworks] = useState([])

    useEffect(() => {
        setGArtworks(allArtwork.nodes)
    }, [allArtwork])
    // const gArtworks = allData.allArtwork.nodes;
    // const gArtworks =
    const [ artworks, setArtworks ] = useContext(ArtworksContext)
    // const [gArtworks] = useState<Artwork[]>(allData.allArtworks.nodes)
    // console.log(artworks)
    const [loading, setLoading] = useState(true)
    const [noArtworks, setNoArtworks] = useState(false)

    useEffect(() => {
        console.log('gArtworks: ', gArtworks);
        
        if (gArtworks.length === 0) {
            setLoading(false)
            setNoArtworks(true)
        }
    }, [gArtworks])

    useEffect(() => {
        if (artworks.original.length === 0) {
            setArtworks(state => ({ ...state, original: [...gArtworks] }))
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
                :   <ArtworksTimeline filteredArtworks={artworks.filtered} />
            }
            {artworks.showSlideshow && <ArtworksSlideshow filteredArtworks={artworks.filtered} />}
        </section>
    )
}

export default Artworks