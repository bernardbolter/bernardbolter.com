// src/providers/__tests__/ArtworkProvider.test.tsx

import React from 'react';
import { renderHook, act } from '@testing-library/react'
import { ArtworksProvider, useArtworks } from '../ArtworkProvider';
import {  AllData } from '@/types/artworkProviderTypes';
import { Artwork } from '@/types/artworkTypes';
import { generateTimeline } from '@/helpers/timeline';

// --- MOCK DEPENDENCIES ---

// 1. Mock the generateTimeline helper
const mockFormattedArtworks = {
    artworksArray: [
        /* Simplified Mock Result */
        { id: 'a', title: 'Art A', year: 2020, position: 100 },
        { id: 'b', title: 'Art B', year: 2018, position: 200 },
    ],
    timelineLength: 1000,
    yearMarkers: [],
};
jest.mock('@/helpers/timeline', () => ({
    // Mock the core function to return a predictable, simple result
    generateTimeline: jest.fn(() => mockFormattedArtworks),
    // Mock the filtering/sorting helpers if used internally (assuming simple filtering for this test)
    sortArtworks: jest.fn(artworks => artworks),
    filterArtworks: jest.fn(artworks => artworks),
}));


// --- MOCK DATA ---

const mockArtworkA: Artwork = { id: 'a', title: 'Art A', year: 2020, artworkFields: { year: 2020, category: ['painting'], series: ['series-a'] } } as unknown as Artwork;
const mockArtworkB: Artwork = { id: 'b', title: 'Art B', year: 2018, artworkFields: { year: 2018, category: ['sculpture'], series: ['series-b'] } } as unknown as Artwork;
const mockArtworkC: Artwork = { id: 'c', title: 'Art C', year: 2022, artworkFields: { year: 2022, category: ['painting'], series: ['series-c'] } } as unknown as Artwork;

const mockOriginalArtworks = [mockArtworkA, mockArtworkB, mockArtworkC];

const mockAllData: AllData = {
    allArtwork: { nodes: mockOriginalArtworks },
    page: { content: 'bio' , bio: null},
    cvinfos: { nodes: [] }, 
    artistInfo: {},
} as AllData;


// --- HELPER FUNCTION FOR RENDERING HOOK ---

// Custom wrapper to render the hook with the actual provider
const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ArtworksProvider allData={mockAllData}>{children}</ArtworksProvider>
);

// src/providers/__tests__/ArtworkProvider.test.tsx (Continuation)

describe('ArtworksProvider', () => {

    it('should initialize with original artwork data and default state', () => {
        // Render the hook, which wraps the provider
        const { result } = renderHook(() => useArtworks(), { wrapper });

        // Initial state check
        const [artworks] = result.current;

        expect(artworks.original).toHaveLength(3);
        expect(artworks.filtered).toHaveLength(3);
        expect(artworks.sorting).toBe('latest');
        expect(artworks.currentArtworkIndex).toBe(0);
        expect(artworks.artworkViewTimeline).toBe(true);
        expect(artworks.savedTimelineFiltersHash).not.toBe('');
        // Expect formattedArtworks to be null initially due to 0 dimensions
        expect(artworks.formattedArtworks).toBeNull();
    });

    // --- Core Functionality Tests (Filtering/Sorting/Searching) ---

    it('should update filtered artworks when filtersArray changes', () => {
        const { result } = renderHook(() => useArtworks(), { wrapper });
        const [, setArtworks] = result.current;

        // 1. Apply a filter for 'painting'
        act(() => {
            setArtworks(prev => ({ ...prev, filtersArray: ['painting'] }));
        });

        // The filter helper is mocked to return the whole array, 
        // but we test if the state correctly updates to the filtered results.
        const [artworksAfterFilter] = result.current;

        // NOTE: If filterArtworks is correctly implemented, this assertion would check for 2 items (A, C)
        // Since we mocked filterArtworks to return the original array, we primarily test the state update mechanism.
        expect(artworksAfterFilter.filtersArray).toEqual(['painting']);
    });

    // --- Timeline Persistence and Reset Logic Tests ---

    it('should reset index to 0 when filters change, overriding saved index', () => {
        const { result } = renderHook(() => useArtworks(), { wrapper });
        const [, setArtworks] = result.current;

        // 1. Simulate user scrolling and saving a non-zero position in timeline view
        act(() => {
            setArtworks(prev => ({ 
                ...prev, 
                currentArtworkIndex: 5, 
                savedTimelineIndex: 5, 
                savedTimelineFiltersHash: 'INITIAL_HASH' 
            }));
        });

        // 2. Simulate user in grid view making a filter change (which changes the currentFiltersHash)
        act(() => {
            // This filter change will cause currentFiltersHash !== savedTimelineFiltersHash
            setArtworks(prev => ({ 
                ...prev, 
                filtersArray: ['sculpture'] 
            }));
        });

        // 3. Check the state (the useEffect should have triggered a reset)
        const [artworksAfterFilterChange] = result.current;

        // Assert that both indices are reset to 0
        expect(artworksAfterFilterChange.currentArtworkIndex).toBe(0);
        expect(artworksAfterFilterChange.savedTimelineIndex).toBe(0);
        // Assert that the hash is updated to prevent immediate re-reset
        expect(artworksAfterFilterChange.savedTimelineFiltersHash).not.toBe('INITIAL_HASH');
    });

    it('should NOT reset index when viewport dimensions change', () => {
        const { result } = renderHook(() => useArtworks(), { wrapper });
        const [, setArtworks] = result.current;
        let initialHash: string;

        // 1. Simulate saved position
        act(() => {
            setArtworks(prev => ({ 
                ...prev, 
                currentArtworkIndex: 5, 
                savedTimelineIndex: 5, 
            }));
            initialHash = result.current[0].savedTimelineFiltersHash;
        });

        // 2. Simulate dimension change (should not affect filtersHash)
        act(() => {
            setArtworks(prev => ({ 
                ...prev, 
                viewportWidth: 800, 
                artworkContainerWidth: 700 
            }));
        });

        // 3. Check the state
        const [artworksAfterDimensionChange] = result.current;

        // Assert that the index values are preserved
        expect(artworksAfterDimensionChange.currentArtworkIndex).toBe(5);
        expect(artworksAfterDimensionChange.savedTimelineIndex).toBe(5);
        // Assert that the hash is unchanged (or updated, but no reset occurs)
        expect(artworksAfterDimensionChange.savedTimelineFiltersHash).toBe(initialHash!);
    });

    // --- Formatted Artworks Memoization Test ---
    
    it('should generate formattedArtworks when dimensions are set', () => {
        const { result } = renderHook(() => useArtworks(), { wrapper });
        const [, setArtworks] = result.current;

        // Initially, it's null because dimensions are 0
        expect(result.current[0].formattedArtworks).toBeNull();
        expect(generateTimeline).not.toHaveBeenCalled();

        // 1. Set required dimensions
        act(() => {
            setArtworks(prev => ({
                ...prev,
                viewportWidth: 1000,
                viewportHeight: 700,
                artworkContainerWidth: 800,
                artworkContainerHeight: 600,
            }));
        });
        
        // 2. Assert that generateTimeline was called and state updated
        expect(generateTimeline).toHaveBeenCalledTimes(1);
        expect(result.current[0].formattedArtworks).toEqual(mockFormattedArtworks);

        // 3. Change a dimension and ensure it is called again
        act(() => {
            setArtworks(prev => ({ ...prev, viewportWidth: 1200 }));
        });
        
        expect(generateTimeline).toHaveBeenCalledTimes(2);
    });
});