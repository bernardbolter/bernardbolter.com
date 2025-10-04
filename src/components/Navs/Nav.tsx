'use client'

import { useArtworks } from '@/providers/ArtworkProvider'
import FilterSvg from '@/svgs/FilterSvg'
import SearchSvg from '@/svgs/SearchSvg'
import PlaySvg from '@/svgs/PlaySvg'
import PauseSvg from '@/svgs/PauseSvg'
import TimerSvg from '@/svgs/TimerSvg'

import SearchNav from './SearchNav'
import FilterNav from './FilterNav'

const Nav = () => {
    const [artworks, setArtworks] = useArtworks()

  return (
    <nav 
      className="nav-container"
      style={{ zIndex: artworks.showSlideshow ? 5000 : 1000}}  
    >
        <div
          className="nav-button"
          role="button"
          style={{ display: artworks.showSlideshow ? 'block' : 'none'}}
        >
          <TimerSvg />
        </div>
        <div 
            className={artworks.searchNavOpen ? "nav-button search-button search-button--open" : "nav-button search-button"}
            role="button"
            onClick={() => setArtworks(prev => ({...prev, searchNavOpen: !prev.searchNavOpen}))}
            style={{ display: artworks.showSlideshow ? 'none' : 'block'}}
        >
          <SearchSvg searchNavOpen={artworks.searchNavOpen} />
        </div>
        <SearchNav />
        <div 
            className="nav-button"
            role="button"
             onClick={() => {
              console.log("hitting nav setArtworks")
              setArtworks(prev => {
                const newShowSlideshow = !prev.showSlideshow;
                return {
                  ...prev, 
                  showSlideshow: newShowSlideshow, 
                  slideshowPlaying: newShowSlideshow, // Only play if showing slideshow
                  isTimelineScrollingProgamatically: prev.showSlideshow, // True only when closing slideshow
                  searchNavOpen: prev.searchNavOpen === true ? true : false,
                  filterNavOpen: prev.filterNavOpen === true ? true : false
                }
              })
            }}
        >
          <PlaySvg showSlideshow={artworks.showSlideshow} />
        </div>
        <div 
            className={artworks.filterNavOpen ? "nav-button filter-button filter-button--open" : "nav-button filter-button"}
            role="button"
            onClick={() => setArtworks(prev => ({...prev, filterNavOpen: !prev.filterNavOpen}))}
            style={{ display: artworks.showSlideshow ? 'none' : 'block'}}
        >
            <FilterSvg filterNavOpen={artworks.filterNavOpen} />
        </div>
        <FilterNav />
        <div 
            className="nav-button"
            role="button"
            onClick={() => setArtworks(prev => ({...prev, slideshowPlaying: !prev.slideshowPlaying}))}
            style={{ display: artworks.showSlideshow ? 'block' : 'none'}}
        >
            <PauseSvg />
        </div>
    </nav>
  )
} 

export default Nav