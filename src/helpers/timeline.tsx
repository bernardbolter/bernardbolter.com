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