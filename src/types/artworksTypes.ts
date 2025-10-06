// TypeScript interfaces for the artwork data
export interface ArtworkSize {
    sourceUrl: string;
    height: number;
    width: number;
}

export interface ArtworkMediaDetails {
    sizes: ArtworkSize[];
    width: number;
    height: number;
}

export interface ArtworkImageNode {
    altText?: string | null;
    mediaDetails: ArtworkMediaDetails;
    sourceUrl: string; // Sized URL from the query
    srcSet: string; // Sized srcSet from the query
}

// and the flat structure (for single artwork/cached data).
export interface ArtworkImage {
    node?: ArtworkImageNode | null; 
}

export interface ArtworkLink {
    url: string;
    title: string;
}

export interface ArtworkFields {
    city: string;
    artworklink: ArtworkLink;
    artworkImage: ArtworkImage | null; 
    country: string;
    forsale: boolean;
    height: string;
    lat: number;
    lng: number;
    medium: string;
    metadescription: string;
    metakeywords: string;
    orientation: string;
    proportion: number;
    series: string;
    size: string;
    style: string;
    width: string;
    year: number;
}

export interface ColorfulFields {
    ar?: string;
    storyDe?: string;
    storyEn?: string;
    wikiLinkDe?: string;
    wikiLinkEn?: string;
}

export interface FeaturedImage {
    node: {
        sourceUrl: string;
        altText: string;
    };
}

export interface Artwork {
  slug: string;
  artworkFields: {
    city: string | null;
    artworklink: { url: string; title: string } | null;
    artworkImage: ArtworkImage | null;
    country: string | null;
    forsale: boolean | null;
    height: number | null;
    lat: number | null;
    lng: number | null;
    medium: string | null;
    metadescription: string | null;
    metakeywords: string | null;
    orientation: string | 'square';
    proportion: number | null;
    series: string[];
    size: string | 'l';
    style: string | null;
    width: number | null;
    year: number | null;
  };
  colorfulFields: {
    wikiLinkEn: string | null;
    wikiLinkDe: string | null;
    storyEn: string | null;
    storyDe: string | null;
    ar: boolean | null;
  };
  title: string;
  content: string | null;
  databaseId: number;
  id: string;
  date: string;
  featuredImage: { node: { sourceUrl: string; altText: string } } | null;
  index: number;
}