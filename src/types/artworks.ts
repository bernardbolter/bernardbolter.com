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

export interface ArtworkImage {
    mediaDetails: ArtworkMediaDetails;
    mediaItemUrl: string;
}

export interface ArtworkLink {
    url: string;
    title: string;
}

export interface ArtworkFields {
    city: string;
    artworklink: ArtworkLink;
    artworkImage: ArtworkImage;
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
    artworkFields: ArtworkFields;
    colorfulFields?: ColorfulFields;
    title: string;
    content: string;
    databaseId: number;
    id: string;
    date: string;
    featuredImage: FeaturedImage;
    index: number;
}