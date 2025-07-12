import { JSX } from "react";
import { Artwork } from "@/types/artworks";

// Extended artwork interface with time difference and calculated margin
export interface ArtworkWithTimeMargin extends Artwork {
  timeDifference: number; // Time difference in milliseconds from previous artwork
  timeMargin: number; // Calculated margin in pixels based on time difference
  hasYearBreak: boolean; // Indicates if a full year or more exists since the previous artwork
  missingYears?: number[]; // Array of missing years if hasYearBreak is true
  originalIndex: number; // Original index of the artwork in the input array
  yearsDifference: number; // Number of years between artworks
}
// interface for small lines in timline
export interface GenerateSmallLinesProps {
  isMobile: boolean;
  totalTimelineHeight: number;
  totalTimelineWidth: number;
  artworkContainerHeight: number;
  artworkContainerWidth: number;
  artworkDesktopSideWidth: number;
  targetSpacing?: number;
}

// interface ArtworkWithTimeMargin extends Artwork {
//   timeMargin: number;
//   yearsDifference: number;
// }

interface GenerateYearMarkersParams {
  formattedArtworks: ArtworkWithTimeMargin[];
  isMobile: boolean;
  totalTimelineHeight: number;
  totalTimelineWidth: number;
  artworkContainerHeight: number;
  artworkContainerWidth: number;
  artworkDesktopSideWidth: number;
  pixelsPerYear?: number; // How many pixels represent one year in gaps
}

interface YearMarker {
  year: number;
  position: number;
  isArtworkYear: boolean; // True if this marker is at an artwork position
  isStartOrEnd: boolean; // True if this is the first or last marker
}

// Constants for time calculations
const MILLISECONDS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000; // Year in milliseconds (accounting for leap years)
const PIXELS_PER_YEAR = 120; // Target: 120px per year
const MIN_MARGIN = 0; // Minimum margin in pixels

/**
 * Calculate margin based on time difference to achieve 120px per year spacing.
 * @param timeDifference - Time difference in milliseconds
 * @param previousDate - Previous artwork's date
 * @param currentDate - Current artwork's date
 * @returns Calculated margin in pixels and year break information
 */
export const calculateTimeMargin = (
  timeDifference: number, 
  previousDate: Date, 
  currentDate: Date
): { 
  margin: number; 
  hasYearBreak: boolean; 
  missingYears?: number[];
  yearsDifference: number;
} => {
  if (timeDifference <= 0) {
    return { margin: 0, hasYearBreak: false, yearsDifference: 0 };
  }

  const yearsDifference = timeDifference / MILLISECONDS_PER_YEAR;
  const margin = Math.max(MIN_MARGIN, Math.round(yearsDifference * PIXELS_PER_YEAR));

  // Check if there's a year break (more than 1 year gap)
  const prevYear = previousDate.getFullYear();
  const currentYear = currentDate.getFullYear();
  const yearGap = currentYear - prevYear;
  
  let hasYearBreak = false;
  const missingYears: number[] = [];

  if (yearGap > 1) {
    hasYearBreak = true;
    // Generate array of missing years
    for (let year = prevYear + 1; year < currentYear; year++) {
      missingYears.push(year);
    }
  }

  return {
    margin,
    hasYearBreak,
    missingYears: missingYears.length > 0 ? missingYears : undefined,
    yearsDifference
  };
};

/**
 * Enhanced version that calculates time-based margins with year-based spacing.
 */
export const formatFilteredArtworkWithTimeMargin = (
  artworks: Artwork[]
): ArtworkWithTimeMargin[] => {
  if (artworks.length === 0) return [];

  // Create a copy with indices to preserve original order
  const indexedArtworks = artworks.map((artwork, index) => ({
    ...artwork,
    originalIndex: index
  }));

  // Sort by date for time difference calculation
  const sortedArtworks = [...indexedArtworks].sort((a, b) => {
    const dateA = normalizeDate(a.date);
    const dateB = normalizeDate(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  const sortedWithTimeMargin: ArtworkWithTimeMargin[] = sortedArtworks.map((artwork, index) => {
    let timeDifference = 0;
    let timeMargin = 0;
    let hasYearBreak = false;
    let missingYears: number[] | undefined = undefined;
    let yearsDifference = 0;

    if (index > 0) {
      const currentDate = normalizeDate(artwork.date);
      const previousDate = normalizeDate(sortedArtworks[index - 1].date);
      timeDifference = currentDate.getTime() - previousDate.getTime();

      const marginResult = calculateTimeMargin(timeDifference, previousDate, currentDate);
      timeMargin = marginResult.margin;
      hasYearBreak = marginResult.hasYearBreak;
      missingYears = marginResult.missingYears;
      yearsDifference = marginResult.yearsDifference;
    }

    return {
      ...artwork,
      timeDifference,
      timeMargin,
      hasYearBreak,
      missingYears,
      yearsDifference
    };
  });

  // Restore original order
  const result = new Array(artworks.length);
  sortedWithTimeMargin.forEach(artwork => {
    const { originalIndex, ...artworkWithoutIndex } = artwork;
    result[originalIndex] = artworkWithoutIndex as ArtworkWithTimeMargin;
  });

  return result;
};

// Helper function to normalize timestamps to Date objects
function normalizeDate(date: Date | string | number): Date {
  if (date instanceof Date) {
    return date;
  }
  if (typeof date === 'string') {
    return new Date(date);
  }
  if (typeof date === 'number') {
    // Assume Unix timestamp in milliseconds if > 1e12, otherwise seconds
    return new Date(date > 1e12 ? date : date * 1000);
  }
  throw new Error('Invalid date format');
}

// Utility function to get total margin for all artworks (horizontal)
export const getTotalHorizontalTimeMargin = (artworks: ArtworkWithTimeMargin[]): number => {
  return artworks.reduce((total, artwork) => total + artwork.timeMargin, 0);
};

// Utility function to get total margin for all artworks (vertical, when applied as marginBottom)
export const getTotalVerticalTimeMargin = (artworks: ArtworkWithTimeMargin[]): number => {
  return artworks.reduce((total, artwork) => total + artwork.timeMargin, 0);
};

// Utility function to get time span info
export const getTimeSpanInfo = (artworks: Artwork[]) => {
  if (artworks.length === 0) return null;

  const sortedArtworks = [...artworks].sort((a, b) => {
    const dateA = normalizeDate(a.date);
    const dateB = normalizeDate(b.date);
    return dateA.getTime() - dateB.getTime();
  });

  const startDate = normalizeDate(sortedArtworks[0].date);
  const endDate = normalizeDate(sortedArtworks[sortedArtworks.length - 1].date);
  const totalTimeSpan = endDate.getTime() - startDate.getTime();
  const totalYears = totalTimeSpan / MILLISECONDS_PER_YEAR;

  return {
    startDate,
    endDate,
    totalTimeSpan,
    totalYears: Math.round(totalYears * 100) / 100 // Round to 2 decimal places
  };
};

/**
 * Calculates the total width of the timeline, including artwork widths and margins.
 */
export const calculateTotalTimelineWidth = (
  formattedArtworks: ArtworkWithTimeMargin[],
  artworkContainerWidth: number,
  desktopSideWidth: number
): number => {
  if (formattedArtworks.length === 0) return 0;

  // Start with the width of the left desktop side panel
  let totalWidth = desktopSideWidth;

  formattedArtworks.forEach((artwork, index) => {
    totalWidth += artworkContainerWidth; // Add artwork width
    if (index < formattedArtworks.length - 1) { // Add margin for all but the last artwork
      totalWidth += artwork.timeMargin;
    }
  });

  // Add the width of the right desktop side panel
  totalWidth += desktopSideWidth;

  return totalWidth;
};

/**
 * Calculates the total height of the timeline, including artwork heights and margins.
 */
export const calculateTotalTimelineHeight = (
  formattedArtworks: ArtworkWithTimeMargin[],
  artworkContainerHeight: number
): number => {
  if (formattedArtworks.length === 0) return 0;

  let totalHeight = 0;
  formattedArtworks.forEach((artwork, index) => {
    totalHeight += artworkContainerHeight; // Add artwork height
    if (index < formattedArtworks.length - 1) { // Add margin for all but the last artwork
      totalHeight += artwork.timeMargin;
    }
  });

  return totalHeight;
};

/**
 * Calculates the absolute center position of each artwork along the horizontal timeline.
 * This is the scrollLeft value needed to center the artwork.
 */
export const calculateHorizontalScrollPoints = (
  formattedArtworks: ArtworkWithTimeMargin[],
  artworkContainerWidth: number,
  desktopSideWidth: number,
  viewportWidth: number
): number[] => {
  const scrollPoints: number[] = [];
  let currentAccumulatedWidth = desktopSideWidth; // Start after the left side panel

  formattedArtworks.forEach((artwork, index) => {
    const artworkCenter = currentAccumulatedWidth + (artworkContainerWidth / 2);
    // Calculate scroll position to center the artwork
    const scrollPosition = artworkCenter - (viewportWidth / 2);
    scrollPoints.push(Math.max(0, scrollPosition));

    currentAccumulatedWidth += artworkContainerWidth;
    if (index < formattedArtworks.length - 1) {
      currentAccumulatedWidth += artwork.timeMargin;
    }
  });

  return scrollPoints;
};

/**
 * Calculates the absolute center position of each artwork along the vertical timeline.
 * This is the scrollTop value needed to center the artwork.
 */
export const calculateVerticalScrollPoints = (
  formattedArtworks: ArtworkWithTimeMargin[],
  artworkContainerHeight: number,
  viewportHeight: number
): number[] => {
  const scrollPoints: number[] = [];
  let currentAccumulatedHeight = 0;

  formattedArtworks.forEach((artwork, index) => {
    const artworkCenter = currentAccumulatedHeight + (artworkContainerHeight / 2);
    // Calculate scroll position to center the artwork
    const scrollPosition = artworkCenter - (viewportHeight / 2);
    scrollPoints.push(Math.max(0, scrollPosition));

    currentAccumulatedHeight += artworkContainerHeight;
    if (index < formattedArtworks.length - 1) {
      currentAccumulatedHeight += artwork.timeMargin;
    }
  });

  return scrollPoints;
};

/**
 * Calculates the the small lines in the timeline by calculating the average.
 * there is a spacing variable which can be adjusted to change the density of the lines.
 */

export const generateSmallLines = ({
  isMobile,
  totalTimelineHeight,
  totalTimelineWidth,
  artworkContainerHeight,
  artworkContainerWidth,
  artworkDesktopSideWidth,
  targetSpacing = 10
}: GenerateSmallLinesProps): JSX.Element[] => {
  const totalDimension = isMobile ? 
    totalTimelineHeight - artworkContainerHeight : 
    totalTimelineWidth - artworkContainerWidth - (artworkDesktopSideWidth * 2);
  
  // Calculate optimal spacing closest to target spacing
  const numberOfLines = Math.floor(totalDimension / targetSpacing);
  const actualSpacing = totalDimension / numberOfLines;
  
  const lines: JSX.Element[] = [];
  
  for (let i = 0; i <= numberOfLines; i++) {
    const position = i * actualSpacing;
    
    // Skip lines that would be too close to the start or end
    if (position < 5 || position > totalDimension - 5) continue;
    
    // Create different sizes for visual hierarchy
    const isLargeTick = i % 10 === 0; // Every 10th line is larger
    const isMediumTick = i % 5 === 0 && !isLargeTick; // Every 5th line is medium
    
    let lineSize: { width: string; height: string };
    let lineOpacity: number;
    
    if (isLargeTick) {
      lineSize = isMobile ? { width: '16px', height: '2px' } : { width: '2px', height: '16px' };
      lineOpacity = 0.9;
    } else if (isMediumTick) {
      lineSize = isMobile ? { width: '12px', height: '1px' } : { width: '1px', height: '12px' };
      lineOpacity = 0.7;
    } else {
      lineSize = isMobile ? { width: '8px', height: '1px' } : { width: '1px', height: '8px' };
      lineOpacity = 0.5;
    }
    
    const lineStyle: React.CSSProperties = isMobile ? {
      top: `${position}px`,
      ...lineSize,
      opacity: lineOpacity
    } : {
      left: `${position}px`,
      ...lineSize,
      opacity: lineOpacity
    };
    
    lines.push(
      <div
        key={`small-line-${i}`}
        className={`artworks-timeline__small-line ${isLargeTick ? 'large' : isMediumTick ? 'medium' : 'small'}`}
        style={lineStyle}
      />
    );
  }
  
  return lines;
};

// generate alrge lines and year markers
export function generateYearMarkers({
  formattedArtworks,
  isMobile,
  artworkContainerHeight,
  artworkContainerWidth,
}: GenerateYearMarkersParams): React.ReactNode[] {
  
  if (formattedArtworks.length === 0) return [];

  const markers: YearMarker[] = [];
  let currentPosition = 0;
  let prevYear: number | null = null;

  // Add start marker
  const firstYear = new Date(formattedArtworks[0].date).getFullYear();
  markers.push({
    year: firstYear,
    position: currentPosition + (isMobile ? artworkContainerHeight / 2 : artworkContainerWidth / 2),
    isArtworkYear: true,
    isStartOrEnd: true
  });
  prevYear = firstYear;

  // Process each artwork
  formattedArtworks.forEach((artwork, index) => {
    const artworkYear = new Date(artwork.date).getFullYear();
    const artworkDimension = isMobile ? artworkContainerHeight : artworkContainerWidth;
    
    // Add marker for current artwork (center of artwork)
    const artworkCenterPosition = currentPosition + (artworkDimension / 2);
    
    // Only add year if it's different from the last year
    if (prevYear === null || artworkYear !== prevYear) {
      markers.push({
        year: artworkYear,
        position: artworkCenterPosition,
        isArtworkYear: true,
        isStartOrEnd: false
      });
      prevYear = artworkYear;
    } else {
      // Still add a marker for the line, but without year text
      markers.push({
        year: artworkYear,
        position: artworkCenterPosition,
        isArtworkYear: true,
        isStartOrEnd: false
      });
    }

    // Move to next position
    currentPosition += artworkDimension;

    // If there's a time margin (gap) after this artwork, add intermediate year markers
    if (index < formattedArtworks.length - 1 && artwork.timeMargin > 0) {
      const yearsDifference = artwork.yearsDifference;
      
      if (yearsDifference > 1) {
        // Calculate how many intermediate years to show
        const intermediateYears = Math.floor(yearsDifference) - 1;
        const gapSpacing = artwork.timeMargin / (yearsDifference);
        
        // Add markers for missing years in the gap
        for (let i = 1; i <= intermediateYears; i++) {
          const yearInGap = artworkYear + i;
          const positionInGap = currentPosition + (i * gapSpacing);
          
          markers.push({
            year: yearInGap,
            position: positionInGap,
            isArtworkYear: false,
            isStartOrEnd: false
          });
        }
      }
      
      currentPosition += artwork.timeMargin;
    }
  });

  // Add end marker
  const lastArtwork = formattedArtworks[formattedArtworks.length - 1];
  const lastYear = new Date(lastArtwork.date).getFullYear();
  const endPosition = currentPosition - (isMobile ? artworkContainerHeight / 2 : artworkContainerWidth / 2);
  
  markers.push({
    year: lastYear,
    position: endPosition,
    isArtworkYear: true,
    isStartOrEnd: true
  });

  // Convert markers to React elements
  return markers.map((marker, index) => {
    const isLargeLine = marker.isArtworkYear || marker.isStartOrEnd;
    const showYear = index === 0 || index === markers.length - 1 || 
                    (index > 0 && markers[index - 1].year !== marker.year);

    if (isMobile) {
      return (
        <div
          key={`year-marker-${marker.year}-${index}`}
          className="artworks-timeline__marker"
          style={{
            top: `${marker.position}px`,
          }}
        >
          {/* Large line for artworks and major markers */}
          <div
            className={`artworks-timeline__tick ${isLargeLine ? 'artworks-timeline__tick--large' : 'artworks-timeline__tick--small'}`}
            style={{
              width: isLargeLine ? '30px' : '15px',
              left: isLargeLine ? '10px' : '17px'
            }}
          />
          
          {/* Year label */}
          {showYear && (
            <span
              className="artworks-timeline__year"
              style={{
                fontWeight: isLargeLine ? 'bold' : 'normal'
              }}
            >
              {marker.year}
            </span>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={`year-marker-${marker.year}-${index}`}
          className="artworks-timeline__marker"
          style={{
            left: `${marker.position}px`,
          }}
        >
          {/* Large line for artworks and major markers */}
          <div
            className={`artworks-timeline__tick ${isLargeLine ? 'artworks-timeline__tick--large' : 'artworks-timeline__tick--small'}`}
            style={{
              height: isLargeLine ? '30px' : '15px',
              top: isLargeLine ? '10px' : '17px'
            }}
          />
          
          {/* Year label */}
          {showYear && (
            <span
              className="artworks-timeline__year"
              style={{
                fontWeight: isLargeLine ? 'bold' : 'normal',
              }}
            >
              {marker.year}
            </span>
          )}
        </div>
      );
    }
  });
}