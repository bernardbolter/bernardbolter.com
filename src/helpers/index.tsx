import { Artwork } from "@/types/artworks";

// Extended artwork interface with time difference
interface ArtworkWithTimeDiff extends Artwork {
  timeDifference: number; // Time difference in milliseconds from previous artwork
}

// function to arrange the list of filtered artwork into a new array with time differece between artworks added
export const formatFilteredArtworkWithTimeDIff = (artworks: Artwork[], size: object): ArtworkWithTimeDiff[] => {
    console.log("the size: ", size)
    if (artworks.length === 0) {
    return [];
  }

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

  // Calculate time differences on sorted array
  const sortedWithTimeDiff = sortedArtworks.map((artwork, index) => {
    let timeDifference = 0;
    
    if (index > 0) {
      const currentDate = normalizeDate(artwork.date);
      const previousDate = normalizeDate(sortedArtworks[index - 1].date);
      timeDifference = currentDate.getTime() - previousDate.getTime();
    }
    
    return {
      ...artwork,
      timeDifference
    };
  });

  // Set last element's timeDifference to 0
//   if (sortedWithTimeDiff.length > 0) {
//     sortedWithTimeDiff[sortedWithTimeDiff.length - 1].timeDifference = 0;
//   }

  // Restore original order
  const result = new Array(artworks.length);
  sortedWithTimeDiff.forEach(artwork => {
    const { originalIndex, ...artworkWithoutIndex } = artwork;
    result[originalIndex] = artworkWithoutIndex;
  });

  return result;

}

export // Helper function to normalize timestamps to Date objects
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