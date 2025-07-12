'use client'

import { useContext } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider'

const FilterNav = () => {
    const [artworks, setArtworks] = useContext(ArtworksContext)
    console.log(artworks)
    return (
        <div 
            className={artworks.filterNavOpen ? "filter-nav__container filter-nav__container--open" : "filter-nav__container"}
            style={{ display: artworks.showSlideshow ? "none": "" }}    
        >

        </div>
    )
}

export default FilterNav