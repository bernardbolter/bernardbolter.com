"use client"

import { useState, useEffect, createContext, Dispatch, SetStateAction, ReactNode } from 'react'
import { Artwork } from '@/types/artworks'
export interface ArtworksState {
  original: Artwork[];
  filtered: Artwork[];
  currentArtworkIndex: number;
  sorting: string;
  filtersArray: Array<string>;
  filterNavOpen: boolean;
  searchNavOpen: boolean;
  showSlideshow: boolean;
  slideshowPlaying: boolean;
  slideshowTimerProgress: number;
  isTimelineScrollingProgamatically: boolean;
  searchValue: string;
  infoOpen: boolean;
}

export type ArtworksContextType= [ArtworksState, Dispatch<SetStateAction<ArtworksState>>];

export const ArtworksContext = createContext<ArtworksContextType>([
  {
    original: [],
    filtered: [],
    currentArtworkIndex: 0,
    sorting: "latest",
    filtersArray: [],
    filterNavOpen: false,
    searchNavOpen: false,
    showSlideshow: false,
    slideshowPlaying: false,
    slideshowTimerProgress: 0,
    isTimelineScrollingProgamatically: false,
    searchValue: "",
    infoOpen: false
  },
  () => {}
]);

interface ArtworksProviderProps {
  children: ReactNode;
}

const ArtworksProvider = ({ children }: ArtworksProviderProps) => {
  const [artworks, setArtworks] = useState<ArtworksState>({
    original: [],
    filtered: [],
    currentArtworkIndex: 0,
    sorting: "latest",
    filtersArray: [],
    filterNavOpen: false,
    searchNavOpen: false,
    showSlideshow: false,
    slideshowPlaying: false,
    slideshowTimerProgress: 0,
    isTimelineScrollingProgamatically: false,
    searchValue: "",
    infoOpen: false
  })

  // set filtered artwork from original artwork

  useEffect(() => {
    if (artworks.original.length > 0) {
      const newOriginal = artworks.original.filter(art => art.artworkFields.artworkImage !== null)
      setArtworks(state => ({ ...state, filtered: newOriginal }))
    }
  }, [artworks.original])

  useEffect(() => {
    if (artworks.filtersArray.length > 0 && artworks.filtered.length > 0) {
      const newOriginal = artworks.original.filter(art => art.artworkFields.artworkImage !== null)
      const newFiltered = newOriginal.filter((artwork: Artwork) => {
        for(let i = 0; i < artworks.filtersArray.length; i++) {
          if (!artwork.artworkFields.series.includes(artworks.filtersArray[i])) {
            return false
          }
        }
        return true
      })
      setArtworks(state => ({ ...state, filtered: newFiltered }))
    }
  }, [artworks.filtersArray])

  // useEffect(() => {
  //   // console.log('artworks provider: ', artworks.sorting)
  //   console.log(artworks.original, artworks.filtered)
  //   if (artworks.original.length !== 0) {
  //     console.log('get new filtered array')
  //     let newFiltered: Artwork[] = []
      
  //     // FILTER OUT NON IMAGE ARWORKS AT THE MOMENT!!!! 
  //     // TODO: FIX THIS SO IT DOESN'T BREAK EVERYTHING
  //     const newOriginal = artworks.original.filter(art => art.artworkFields.artworkImage !== null)
  //     if (artworks.sorting === 'latest') {
  //       // newFiltered = [...artworks.original].sort(function(a, b) {
  //       newFiltered = [...newOriginal].sort(function(a, b) {
  //         return new Date(b.date).getTime() - new Date(a.date).getTime()
  //       })
  //     } else if (artworks.sorting === 'oldest') {
  //       console.log("filter oldest")
  //       newFiltered = [...newOriginal].sort(function(a, b) {
  //         return new Date(a.date).getTime() - new Date(b.date).getTime()
  //       })
  //     }
  //     setArtworks(state => ({ ...state, filtered: newFiltered }))
  //     // console.log("new f: ", newFiltered)
  //   }
  // }, [artworks.sorting, artworks.original])

  return (
    <ArtworksContext.Provider
      value={[artworks, setArtworks]}
    >
      {children}
    </ArtworksContext.Provider>
  )
}

export default ArtworksProvider