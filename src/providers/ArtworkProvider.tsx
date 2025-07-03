"use client"

import { useState, useEffect, createContext, Dispatch, SetStateAction, ReactNode } from 'react'
import { Artwork } from '@/types/artworks'
interface ArtworksState {
  original: Artwork[];
  filtered: Artwork[];
  sorting: "latest"|"oldest";
  filterNavOpen: boolean;
}

type ArtworksContextType= [ArtworksState, Dispatch<SetStateAction<ArtworksState>>];

export const ArtworksContext = createContext<ArtworksContextType>([
  {
    original: [],
    filtered: [],
    sorting: "latest",
    filterNavOpen: false,
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
    sorting: "latest",
    filterNavOpen: false,
  })

  useEffect(() => {
    console.log('artworks provider: ', artworks.sorting)
    console.log(artworks.original)
    if (artworks.original.length !== 0) {
      let newFiltered: Artwork[] = []
      if (artworks.sorting === 'latest') {
        newFiltered = [...artworks.original].sort(function(a, b) {
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        })
      } else if (artworks.sorting === 'oldest') {
        console.log("filter oldest")
        newFiltered = [...artworks.original].sort(function(a, b) {
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        })
      }
      setArtworks(state => ({ ...state, filtered: newFiltered }))
      console.log("new f: ", newFiltered)
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