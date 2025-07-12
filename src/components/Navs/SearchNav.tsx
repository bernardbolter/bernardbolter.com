"use client"

import { useContext } from "react"
import { ArtworksContext } from "@/providers/ArtworkProvider"

import CloseSvg from "@/svgs/CloseSvg"

const SearchNav = () => {
    const [artworks, setArtwork] = useContext(ArtworksContext)

    return (
        <div 
            className={artworks.searchNavOpen ? "search-nav__container search-nav__container--open" : "search-nav__container"}
            style={{
                opacity: artworks.searchValue.length === 0 ? .3 : .8,
                display: artworks.showSlideshow ? "none" : "",
            }}
        >
            <input
                type="text"
                className="search-nav__input"
                placeholder="search artwork"
                value={artworks.searchValue}
                onChange={e => setArtwork({...artworks, searchValue: e.target.value})}
            />
            <div 
                className="search-nav__close"
                onClick={() => setArtwork({...artworks, searchValue: ""})}
            >
                <CloseSvg />
            </div>
         </div>
    )
}

export default SearchNav;