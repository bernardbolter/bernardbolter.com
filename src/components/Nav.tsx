'use client'

import { useContext } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider'
import FilterSvg from '@/svgs/FilterSvg'

const Nav = () => {
    const [artworks, setArtworks] = useContext(ArtworksContext)

  return (
    <nav className="nav-container">
        <div 
            className={artworks.filterNavOpen ? 'nav-button nav-button-open' : 'nav-button'}
            onClick={() => setArtworks(prev => ({...prev, filterNavOpen: !prev.filterNavOpen}))}
        >
            <FilterSvg />
        </div>
    </nav>
  )
} 

export default Nav