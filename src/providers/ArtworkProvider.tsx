"use client"

import { useState, useEffect, createContext, Dispatch, SetStateAction, ReactNode } from 'react'
import { Artwork } from '@/types/artworks'
interface ArtworksState {
  original: Artwork[];
  filtered: Artwork[];
  currentArtworkIndex: number;
  sorting: "latest"|"oldest";
  filterNavOpen: boolean;
  searchNavOpen: boolean;
  showSlideshow: boolean;
  slideshowPlaying: boolean;
  slideshowTimerProgress: number;
  isTimelineScrollingProgamatically: boolean;
  searchValue: string;
}

type ArtworksContextType= [ArtworksState, Dispatch<SetStateAction<ArtworksState>>];

export const ArtworksContext = createContext<ArtworksContextType>([
  {
    original: [],
    filtered: [],
    currentArtworkIndex: 0,
    sorting: "oldest",
    filterNavOpen: false,
    searchNavOpen: false,
    showSlideshow: false,
    slideshowPlaying: false,
    slideshowTimerProgress: 0,
    isTimelineScrollingProgamatically: false,
    searchValue: ""
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
    filterNavOpen: false,
    searchNavOpen: false,
    showSlideshow: false,
    slideshowPlaying: false,
    slideshowTimerProgress: 0,
    isTimelineScrollingProgamatically: false,
    searchValue: ""
  })

  useEffect(() => {
    // console.log('artworks provider: ', artworks.sorting)
    console.log(artworks.original, artworks.filtered)
    if (artworks.original.length !== 0) {
      console.log('get new filtered array')
      let newFiltered: Artwork[] = []
      
      // FILTER OUT NON IMAGE ARWORKS AT THE MOMENT!!!! 
      // TODO: FIX THIS SO IT DOESN'T BREAK EVERYTHING
      const newOriginal = artworks.original.filter(art => art.artworkFields.artworkImage !== null)
      if (artworks.sorting === 'latest') {
        // newFiltered = [...artworks.original].sort(function(a, b) {
        newFiltered = [...newOriginal].sort(function(a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
      } else if (artworks.sorting === 'oldest') {
        console.log("filter oldest")
        newFiltered = [...newOriginal].sort(function(a, b) {
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
      }
      setArtworks(state => ({ ...state, filtered: newFiltered }))
      // console.log("new f: ", newFiltered)
    }
  }, [artworks.sorting, artworks.original])

  return (
    <ArtworksContext.Provider
      value={[artworks, setArtworks]}
    >
      {children}
    </ArtworksContext.Provider>
  )
}

export default ArtworksProvider