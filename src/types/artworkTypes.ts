/**
 * Core application types - these define your app's data structure
 * GraphQL responses will be transformed to match these
 */

export interface ArtworkMediaDetails {
  width: number;
  height: number;
}

export interface ArtworkImageNode {
  altText: string;
  sourceUrl: string;
  srcSet: string;
  mediaDetails: ArtworkMediaDetails;
}

export interface ArtworkImage {
  node: ArtworkImageNode;
}

export interface ArtworkLink {
  url: string;
  title: string;
  target?: string;
}

export interface ArtworkFields {
  // Location
  city: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  
  // Dimensions (always numbers)
  height: string | null;
  width: string | null;
  units: string | null;
  proportion: number | null;
  
  // Classification
  orientation: string | null;
  size: string | null;
  series: string | null;
  style: string | null;
  medium: string | null;
  
  // Metadata
  year: number | null;
  forsale: boolean | null;
  price: string | null;
  location: string | null;
  exhibitionHistory: string | null;
  provenance: string | null;
  printEditions: string | null;
  metadescription: string | null;
  metakeywords: string | null;
  
  // Images
  artworkImage: ArtworkImage | null;
  artworkImage2?: ArtworkImage | null;
  artworkImage3?: ArtworkImage | null;
  artworkImage4?: ArtworkImage | null;
  artworkImage5?: ArtworkImage | null;
  artworkImage6?: ArtworkImage | null;
  artworkImage7?: ArtworkImage | null;
  artworkImage8?: ArtworkImage | null;
  artworkImage9?: ArtworkImage | null;
  hasMoreImages?: boolean | null;
  
  // Links
  artworklink: ArtworkLink | null;
  
  // DCS Fields (if needed)
  area?: string | null;
  coordinates?: string | null;
  density?: number | null;
  elevation?: number | null;
  population?: number | null;
  performance?: string | null;
  extraimages?: string | null;
  
  // Video
  video?: ArtworkImage | null;
  videoPoster?: ArtworkImage | null;
  videoYouttubeLink?: string | null;
  
  // DCS Images
  dcsFlags?: ArtworkImage | null;
  dcsPhoto?: ArtworkImage | null;
  dcsPhotoTitle?: string | null;
  dcsRaw?: ArtworkImage | null;
  dcsSatellite?: ArtworkImage | null;
}

export interface ColorfulFields {
  ar: boolean | null;
  storyEn: string | null;
  storyDe: string | null;
  wikiLinkEn: string | null;
  wikiLinkDe: string | null;
}

export interface Artwork {
  // Core fields
  id: string;
  databaseId: number;
  slug: string;
  title: string;
  content: string | null;
  date: string;
  
  // Custom fields
  artworkFields: ArtworkFields;
  colorfulFields: ColorfulFields;
  
  // UI state (added by app)
  index?: number;
}
