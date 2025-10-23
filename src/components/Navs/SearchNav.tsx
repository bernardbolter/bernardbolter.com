"use client"

import { useArtworks } from "@/providers/ArtworkProvider"
import useWindowSize from "@/hooks/useWindowSize"
import Link from "next/link"

import CloseSvg from "@/svgs/CloseSvg"

const SearchNav = () => {
    const [artworks, setArtwork] = useArtworks()
    const size = useWindowSize()

    return (
            <div 
                className={artworks.searchNavOpen ? "search-nav__container search-nav__container--open" : "search-nav__container"}
                style={{
                    display: artworks.showSlideshow ? "none" : "",
                    top: size.width && size.width < 768
                        ? 11 : artworks.artworkViewTimeline ? 131 : 11
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
                    onClick={() => setArtwork({
                        ...artworks, 
                        searchValue: "",
                        searchNavOpen: false
                    })}
                >
                    <CloseSvg />
                </div>
                <div 
                className="search-nav__matched-container"
                style={{
                    top: 24, 
                    right: 0,
                    maxHeight: size.width && size.height && size.width < 768
                        ? (size.height || 400) - 24 : artworks.artworkViewTimeline ? (size.height || 400) - 145 : (size.height || 400) - 24
                }}    
            >
                <div 
                    className="search-nav__matched-inner" tabIndex={0} aria-live="polite"
                    style={{
                        padding: Object.values(artworks.searchMatches).length === 0 ? '0' : '10px 5px 15px',
                    }}    
                >
                    {artworks.searchValue.trim() !== '' && Object.keys(artworks.searchMatches).length > 0 && (
                        artworks.filtered.map(artwork => (
                                artwork.id && artworks.searchMatches[artwork.id] && (
                                    <Link 
                                        href={`/${artwork.slug}`}
                                        key={artwork.id} 
                                        className="search-nav__matched-item"
                                    >
                                        <h3>{artwork.title}</h3>
                                        <p>Matched on: {artworks.searchMatches[artwork.id].join(', ')}</p>
                                    </Link>
                                )
                            ))
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default SearchNav;