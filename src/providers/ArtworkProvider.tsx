"use client"

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, Dispatch, SetStateAction } from 'react'
import { Artwork } from '@/types/artworksTypes'
import { ArtworksState, AllData } from '@/types/artworkProviderTypes'

// Keep your original tuple type
type ArtworksContextType = [ArtworksState, Dispatch<SetStateAction<ArtworksState>>]

const ArtworksContext = createContext<ArtworksContextType>([
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
    infoOpen: false,
    cvData: [],
    bioData: {},
    artistData: {}
  },
  () => {}
])

interface ArtworksProviderProps {
  children: ReactNode;
  allData: AllData; // Use the new AllData type
}

const ArtworksProvider = ({ children, allData }: ArtworksProviderProps) => {
  const [state, setState] = useState<ArtworksState>({
    original: allData.allArtwork.nodes || [],
    filtered: allData.allArtwork.nodes || [],
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
    infoOpen: false,
    cvData: allData.cvinfos.nodes || [],
    bioData: allData.page || {},
    artistData: allData.artistInfo || {}
  })

  // console.log(allData)

  // Initialize original artwork on mount
  useEffect(() => {
    if (allData.allArtwork.nodes.length > 0 && state.original.length === 0) {
      setState(prev => ({
        ...prev,
        original: allData.allArtwork.nodes,
        filtered: allData.allArtwork.nodes,
        cvData: allData.cvinfos.nodes,
        bioData: allData.biography,
        artistData: allData.artistInfo,
      }));
    }
  }, [allData, state.original.length]);

  // Memoized filtered and sorted artwork
  const filteredAndSorted = useMemo(() => {
    if (state.original.length === 0) return []

    // Filter out artworks without images
    let result = state.original.filter(art => art.artworkFields.artworkImage !== null)

    // Apply series filters
    if (state.filtersArray.length > 0) {
      result = result.filter((artwork: Artwork) => {
        return state.filtersArray.every(filter => 
          artwork.artworkFields.series.includes(filter)
        )
      })
    }

    // Apply search filter
    if (state.searchValue.trim()) {
      const searchLower = state.searchValue.toLowerCase()
      result = result.filter(artwork => 
        artwork.title?.toLowerCase().includes(searchLower))
    }

    // Apply sorting
    if (state.sorting === 'latest') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    } else if (state.sorting === 'oldest') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }

    return result
  }, [state.original, state.filtersArray, state.searchValue, state.sorting])

  // Update filtered array when computation changes
  useEffect(() => {
    setState(prev => ({ ...prev, filtered: filteredAndSorted }))
  }, [filteredAndSorted])

  return (
    <ArtworksContext.Provider value={[state, setState]}>
      {children}
    </ArtworksContext.Provider>
  )
}

// Custom hook for consuming the context
export function useArtworks() {
  const context = useContext(ArtworksContext)
  if (!context) {
    throw new Error('useArtworks must be used within ArtworksProvider')
  }
  return context
}

export default ArtworksProvider