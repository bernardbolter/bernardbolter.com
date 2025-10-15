import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ArtworksTimeline from '../ArtworksTimeline';

// 1. Corrected path to mock file and imported individual variables
import { 
    mockArtworksState, 
    mockSetArtworks, 
    useArtworksMock,
    mockArtwork,
    mockFormattedArtworks // Included for explicit type checks if needed
} from '@/__mocks__/useArtworks'; 

import { ArtworksState } from '@/types/artworkProviderTypes';
import useWindowSize from '@/hooks/useWindowSize';
import { generateSmallLines } from '@/helpers/timeline';
import { Artwork } from '@/types/artworkTypes';


// Type assertion for jest functions
const mockUseWindowSize = useWindowSize as jest.Mock;
const mockGenerateSmallLines = generateSmallLines as jest.Mock;

describe('ArtworksTimeline', () => {
    // Before each test, reset the mock implementation of useArtworks
    beforeEach(() => {
        jest.clearAllMocks();
        
        // 2. Used imported variables directly (e.g., mockArtworksState)
        useArtworksMock.mockReturnValue([mockArtworksState, mockSetArtworks]);
        
        // Mock the implementation for the small lines helper
        mockGenerateSmallLines.mockReturnValue([{ distanceFromStart: 10, isVisible: true }]);
    });

    it('should render the ArtworkDetail, ArtworkTitle, and timeline structure', () => {
        render(<ArtworksTimeline />);

        // Check for mock components
        expect(screen.getByText('Mock ArtworkDetail')).toBeInTheDocument();
        expect(screen.getByText('Mock ArtworkTitle')).toBeInTheDocument();

        // Check for timeline core elements
        expect(screen.getByTestId('artworks-timeline-container')).toBeInTheDocument();
        expect(screen.getByTestId('timeline-track')).toBeInTheDocument();
    });

    it('should render year markers and small lines', () => {
        // Set the state with multiple year markers for a robust test
        const customState = {
            ...mockArtworksState,
            formattedArtworks: {
                ...mockFormattedArtworks,
                yearMarkers: [
                    { year: 2021, distanceFromStart: 50, isVisible: true },
                    { year: 2020, distanceFromStart: 100, isVisible: false },
                ],
            }
        } as ArtworksState;
        useArtworksMock.mockReturnValue([customState, mockSetArtworks]);

        render(<ArtworksTimeline />);

        // Check for year markers from mockFormattedArtworks
        expect(screen.getByText('2021')).toBeInTheDocument();
        expect(screen.getByText('2020')).toBeInTheDocument();
        
        // Check for the small line tick (rendered from generateSmallLines mock)
        expect(mockGenerateSmallLines).toHaveBeenCalled();
        expect(screen.getAllByRole('generic', { name: 'small-line' })).toHaveLength(1);
    });

    it('should call setArtworks to update viewport size on mount', () => {
        // Set up the mock viewport size to be detected
        mockUseWindowSize.mockReturnValue({ width: 1200, height: 800 });
        render(<ArtworksTimeline />);

        // The useEffect hook should call setArtworks with the new dimensions
        expect(mockSetArtworks).toHaveBeenCalledWith(expect.any(Function));

        // Verify the function passed to setArtworks updates the dimension state
        const updateFn = mockSetArtworks.mock.calls[0][0];
        const newState = updateFn(mockArtworksState);

        // Check that the correct calculated container dimensions are set (based on mock viewport)
        // Desktop calculation: containerHeight = 800 - 125 = 675
        expect(newState.viewportWidth).toBe(1200);
        expect(newState.artworkContainerHeight).toBe(675);
    });

    it('should handle desktop scroll controls (Left/Previous)', () => {
        // Ensure desktop view is active (vport.width > 767)
        mockUseWindowSize.mockReturnValue({ width: 1024, height: 800 });

        // Set initial index to allow "previous" scroll
        const customState: ArtworksState = {
            ...mockArtworksState,
            currentArtworkIndex: 1, // Start at index 1
            filtered: [mockArtwork, { ...mockArtwork, id: 'a2' } as Artwork], // Need at least two artworks
        };
        useArtworksMock.mockReturnValue([customState, mockSetArtworks]);

        render(<ArtworksTimeline />);

        const leftArrow = screen.getByTestId('left-arrow').closest('.artworks-timeline__control');
        
        expect(leftArrow).toBeInTheDocument();
        
        // Simulate click
        fireEvent.click(leftArrow!);

        // Expect setArtworks to be called to decrement the index
        expect(mockSetArtworks).toHaveBeenCalledWith(expect.any(Function));

        // Verify the function passed to setArtworks decrements the index
        const updateFn = mockSetArtworks.mock.calls.find(call => call[0] instanceof Function)[0];
        const newState = updateFn(customState);
        expect(newState.currentArtworkIndex).toBe(0);
        expect(newState.isTimelineScrollingProgamatically).toBe(true);
    });
    
    it('should handle desktop scroll controls (Right/Next)', () => {
        // Ensure desktop view is active (vport.width > 767)
        mockUseWindowSize.mockReturnValue({ width: 1024, height: 800 });

        // Set initial state
        const customState: ArtworksState = {
            ...mockArtworksState,
            currentArtworkIndex: 0, // Start at index 0
            filtered: [mockArtwork, { ...mockArtwork, id: 'a2' } as Artwork], // Need at least two artworks
        };
        useArtworksMock.mockReturnValue([customState, mockSetArtworks]);

        render(<ArtworksTimeline />);

        const rightArrow = screen.getByTestId('right-arrow').closest('.artworks-timeline__control');
        
        expect(rightArrow).toBeInTheDocument();
        
        // Simulate click
        fireEvent.click(rightArrow!);

        // Expect setArtworks to be called to increment the index
        expect(mockSetArtworks).toHaveBeenCalledWith(expect.any(Function));

        // Verify the function passed to setArtworks increments the index
        const updateFn = mockSetArtworks.mock.calls.find(call => call[0] instanceof Function)[0];
        const newState = updateFn(customState);
        expect(newState.currentArtworkIndex).toBe(1);
        expect(newState.isTimelineScrollingProgamatically).toBe(true);
    });

    it('should not show controls on mobile view', () => {
        // Mock mobile viewport size
        mockUseWindowSize.mockReturnValue({ width: 400, height: 800 });
        render(<ArtworksTimeline />);

        // Expect the controls container not to be in the document
        expect(screen.queryByTestId('left-arrow')).not.toBeInTheDocument();
        expect(screen.queryByTestId('right-arrow')).not.toBeInTheDocument();
    });
});