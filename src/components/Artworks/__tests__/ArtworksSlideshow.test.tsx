import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ArtworksSlideshow from '../ArtworksSlideshow';

// ✅ FIX: Corrected import path and switched to importing individual variables
import { 
    useArtworksMock, 
    mockArtworksState, 
    mockSetArtworks, 
    mockArtwork 
} from '@/__mocks__/useArtworks';

import useWindowSize from '@/hooks/useWindowSize';
import { ArtworksState } from '@/types/artworkProviderTypes';
import { Artwork } from '@/types/artworkTypes';

// Mock requestAnimationFrame for controlling animation loop in slideshow
const mockRAF = jest.fn();
global.requestAnimationFrame = mockRAF;
global.cancelAnimationFrame = jest.fn();

// Type assertions for jest functions
const mockUseWindowSize = useWindowSize as jest.Mock;

describe('ArtworksSlideshow', () => {
    let customState: ArtworksState;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Used base state imported from mocks
        customState = {
            ...mockArtworksState,
            showSlideshow: true,
            slideshowPlaying: true,
            currentArtworkIndex: 0,
            filtered: [
                mockArtwork,
                // Used mockArtwork directly
                { ...mockArtwork, id: 'a2', title: 'Art Two' } as Artwork,
            ],
        };
        // Used mockSetArtworks imported from mocks
        useArtworksMock.mockReturnValue([customState, mockSetArtworks]);
        
        // Mock window size to trigger dimension calculation
        mockUseWindowSize.mockReturnValue({ width: 1200, height: 800 });
    });

    it('should render the current artwork image with calculated dimensions', () => {
        render(<ArtworksSlideshow autoPlayInterval={5000} />);

        const image = screen.getByTestId('next-image') as HTMLImageElement;

        // Check that the image is rendered with the mock data
        expect(image).toBeInTheDocument();
        expect(image.alt).toBe('Mock Artwork 1');
        
        // Check dimensions calculated via useArtworkDimensions mock (500, 400)
        expect(image.getAttribute('width')).toBe('500');
        expect(image.getAttribute('height')).toBe('400');
    });

    it('should update container dimensions on window resize (mobile logic)', () => {
        render(<ArtworksSlideshow autoPlayInterval={5000} />);
        
        // Simulate mobile resize
        act(() => {
            mockUseWindowSize.mockReturnValue({ width: 500, height: 600 });
        });
        
        // We look for the call that updates the provider's dimensions
        // Find the specific call that updates artworkContainerWidth
        const updateFn = mockSetArtworks.mock.calls.find(call => call[0] instanceof Function)[0];
        const newState = updateFn(customState);
        
        // Mobile calculation: containerWidth = 500 - 50 = 450
        expect(newState.artworkContainerWidth).toBe(450);
        expect(newState.artworkContainerHeight).toBe(450);
    });

    it('should start playing and advance index after interval', () => {
        jest.useFakeTimers();

        // Ensure currentArtworkIndex is 0
        customState.currentArtworkIndex = 0;
        
        render(<ArtworksSlideshow autoPlayInterval={100} />); // Short interval for easy testing

        // Simulate image load to start the timer
        const image = screen.getByTestId('next-image');
        fireEvent.load(image);

        // Fast-forward past the interval duration (100ms)
        act(() => {
            jest.advanceTimersByTime(101);
        });

        // Expect setArtworks to be called to advance the index
        expect(mockSetArtworks).toHaveBeenCalledWith(expect.any(Function));
        
        // Find the call that advances the index
        const advanceCall = mockSetArtworks.mock.calls.find(
            // We look for a call where the state change involves currentArtworkIndex
            ([fn]) => typeof fn === 'function' && fn(customState).currentArtworkIndex !== 0
        );

        expect(advanceCall).toBeDefined();
        
        // Verify index advanced from 0 to 1
        const newState = advanceCall![0](customState);
        expect(newState.currentArtworkIndex).toBe(1);

        jest.useRealTimers();
    });

    it('should update slideshowTimerProgress when paused', () => {
        // Set up the state as paused and having a progress value saved in the ref
        customState.slideshowPlaying = false;
        
        // Render the component
        const { unmount } = render(<ArtworksSlideshow autoPlayInterval={5000} />);
        
        // Set the state to playing and then back to paused to trigger the effect
        act(() => {
            useArtworksMock.mockReturnValue([{ ...customState, slideshowPlaying: false }, mockSetArtworks]);
            unmount(); // Unmount to clear previous effects
            render(<ArtworksSlideshow autoPlayInterval={5000} />);
        });

        // We check if the provider setter was called, confirming the component reacted
        expect(mockSetArtworks).toHaveBeenCalled();
    });

    it('should return null if no current artwork is available', () => {
        // Mock state where the filtered array is empty
        useArtworksMock.mockReturnValue([{ 
            ...customState, 
            filtered: [],
            currentArtworkIndex: 0 
        }, mockSetArtworks]);
        
        const { container } = render(<ArtworksSlideshow autoPlayInterval={5000} />);

        // The component should return null, resulting in an empty container
        expect(container.firstChild).toBeNull();
    });
    
    // Cleanup for useFakeTimers
    afterAll(() => {
        jest.useRealTimers();
    });
});