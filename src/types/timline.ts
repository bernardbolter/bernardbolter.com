import { Artwork } from "./artworks";

// Simplified artwork interface for the artworks array
export interface TimelineArtwork extends Artwork {
  originalIndex: number;
  marginRight: number; // For desktop - margin to add to the right of artwork
  marginBottom: number; // For mobile - margin to add to the bottom of artwork
  horizontalScrollPoint: number;
  verticalScrollPoint: number;
}

// Timepoint interface for year markers and missing years
export interface TimelineTimepoint {
  id: string;
  year: number;
  type: 'artwork-year' | 'missing-year';
  distanceFromStart: number; // Distance from timeline start to center this timepoint
  isVisible: boolean; // Whether to show this year marker
}

export type GenerateSmallLinesProps = {
  isMobile: boolean;
  totalTimelineHeight: number;
  totalTimelineWidth: number;
  artworkContainerHeight: number;
  artworkContainerWidth: number;
  artworkDesktopSideWidth: number;
  targetSpacing?: number;
};

// Sorting options
export type SortingType = 'latest' | 'oldest' | 'random';

// Configuration for timeline generation
export interface TimelineConfig {
  artworks: Artwork[];
  sorting: SortingType;
  artworkContainerWidth: number;
  artworkContainerHeight: number;
  desktopSideWidth: number;
  viewportWidth: number;
  viewportHeight: number;
  pixelsPerYear?: number;
}

// Timeline result with separated arrays
export interface TimelineResult {
  artworksArray: TimelineArtwork[]; // Only real artworks with their margins
  timepointsArray: TimelineTimepoint[]; // Year markers and missing years
  totalTimelineWidth: number;
  totalTimelineHeight: number;
  timeSpanInfo: {
    startDate: Date;
    endDate: Date;
    totalTimeSpan: number;
    totalYears: number;
  } | null;
}