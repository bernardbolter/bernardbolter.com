'use client'

import { useContext } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider'
import FilterSvg from '@/svgs/FilterSvg'
import SearchSvg from '@/svgs/SearchSvg'
import PlaySvg from '@/svgs/PlaySvg'

const Nav = () => {
    const [artworks, setArtworks] = useContext(ArtworksContext)

  return (
    <nav className="nav-container">
        <div 
            className="nav-button"
            role="button"
            onClick={() => setArtworks(prev => ({...prev, searchNavOpen: !prev.searchNavOpen}))}
        >
          <SearchSvg searchNavOpen={artworks.searchNavOpen} />
        </div>
        <div 
            className="nav-button"
            role="button"
            onClick={() => setArtworks(prev => ({...prev, showSlideshow: !prev.showSlideshow}))}
        >
          <PlaySvg showSlideshow={artworks.showSlideshow} />
        </div>
        <div 
            className="nav-button"
            role="button"
            onClick={() => setArtworks(prev => ({...prev, filterNavOpen: !prev.filterNavOpen}))}
        >
            <FilterSvg filterNavOpen={artworks.filterNavOpen} />
        </div>
    </nav>
  )
} 

export default Nav