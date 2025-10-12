"use client"

import { useState, useEffect, createContext, useContext, ReactNode, useMemo, Dispatch, SetStateAction } from 'react'
import { Artwork } from '@/types/artworksTypes'
import { ArtworksState, AllData } from '@/types/artworkProviderTypes'
import { SortingType } from '@/types/timlineTypes'
import { generateTimeline } from '@/helpers/timeline'

type ArtworksContextType = [ArtworksState, Dispatch<SetStateAction<ArtworksState>>]

const ArtworksContext = createContext<ArtworksContextType>([
  {
    original: [],
    filtered: [],
    formattedArtworks: null,
    currentArtworkIndex: 0,
    sorting: "latest",
    artworkViewTimeline: true,
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
    bioData: null,
    artistData: {},
    viewportWidth: 0 as number,
    viewportHeight: 0 as number,
    artworkContainerWidth: 0 as number,
    artworkContainerHeight: 0 as number,
    artworkDesktopSideWidth: 0 as number,
    savedTimelineIndex: 0 as number,
    savedTimelineFiltersHash: "" as string,
  },
  () => {}
])

interface ArtworksProviderProps {
  children: ReactNode;
  allData: AllData;
}

const ArtworksProvider = ({ children, allData }: ArtworksProviderProps) => {
  const [state, setState] = useState<ArtworksState>({
    original: allData.allArtwork.nodes || [],
    filtered: allData.allArtwork.nodes || [],
    formattedArtworks: null,
    currentArtworkIndex: 0,
    sorting: "latest",
    artworkViewTimeline: true,
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
    bioData: allData.page || null,
    artistData: allData.artistInfo || {},
    viewportWidth: 0,
    viewportHeight: 0,
    artworkContainerWidth: 0,
    artworkContainerHeight: 0,
    artworkDesktopSideWidth: 0,
    savedTimelineIndex: 0,
    savedTimelineFiltersHash: "",
  })

  // Initialize original artwork on mount
  useEffect(() => {
    if (allData.allArtwork.nodes.length > 0 && state.original.length === 0) {
      setState(prev => ({
        ...prev,
        original: allData.allArtwork.nodes,
        filtered: allData.allArtwork.nodes,
        cvData: allData.cvinfos.nodes,
        bioData: allData.page,
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

  // Create a hash of current filters/search/sort to detect changes
  const currentFiltersHash = useMemo(() => {
    return JSON.stringify({
      filters: state.filtersArray.sort(),
      search: state.searchValue,
      sort: state.sorting
    })
  }, [state.filtersArray, state.searchValue, state.sorting])

  // When filters/search/sort change, reset saved timeline position
  useEffect(() => {
    if (state.savedTimelineFiltersHash && state.savedTimelineFiltersHash !== currentFiltersHash) {
      setState(prev => ({
        ...prev,
        savedTimelineIndex: 0,
        savedTimelineFiltersHash: currentFiltersHash,
        currentArtworkIndex: 0
      }))
    } else if (!state.savedTimelineFiltersHash) {
      setState(prev => ({
        ...prev,
        savedTimelineFiltersHash: currentFiltersHash
      }))
    }
  }, [currentFiltersHash, state.savedTimelineFiltersHash])

  // Memoized formatted artworks - generated whenever dependencies change
  const formattedArtworks = useMemo(() => {
    // Don't generate if we don't have the necessary dimensions yet
    if (
      state.artworkContainerWidth === 0 ||
      state.artworkContainerHeight === 0 ||
      state.viewportWidth === 0 ||
      state.viewportHeight === 0 ||
      state.filtered.length === 0
    ) {
      return null;
    }

    return generateTimeline({
      artworks: state.filtered,
      sorting: state.sorting as SortingType,
      artworkContainerWidth: state.artworkContainerWidth,
      artworkContainerHeight: state.artworkContainerHeight,
      desktopSideWidth: state.artworkDesktopSideWidth,
      viewportWidth: state.viewportWidth,
      viewportHeight: state.viewportHeight
    });
  }, [
    state.filtered,
    state.sorting,
    state.artworkContainerWidth,
    state.artworkContainerHeight,
    state.artworkDesktopSideWidth,
    state.viewportWidth,
    state.viewportHeight
  ])

  // Update formattedArtworks in state when it changes
  useEffect(() => {
    setState(prev => ({ ...prev, formattedArtworks }))
  }, [formattedArtworks])

  return (
    <ArtworksContext.Provider value={[state, setState]}>
      {children}
    </ArtworksContext.Provider>
  )
}

export function useArtworks() {
  const context = useContext(ArtworksContext)
  if (!context) {
    throw new Error('useArtworks must be used within ArtworksProvider')
  }
  return context
}

export default ArtworksProvider