// Defines the structure of a single image returned in the 'bio' field group
export interface BioImageNode {
    node: {
        altText: string | null;
        sourceUrl: string;
        srcSet: string;
        mediaDetails: {
            width: number;
            height: number;
        };
        blurDataURL?: string;
    };
}

// Defines the entire 'bio' field group from the GraphQL query
export interface BiographyData {
    tagline: string | null;
    // Each bio image field uses the BioImageNode structure
    bioimage1: BioImageNode | null;
    bioimage2: BioImageNode | null;
    bioimage3: BioImageNode | null;
    bioimage4: BioImageNode | null;
    bioimage5: BioImageNode | null;
    bioimage6: BioImageNode | null;
    bioimage7: BioImageNode | null;
    bioimage8: BioImageNode | null;
    bioimage9: BioImageNode | null;
    bioimage10: BioImageNode | null;
    // We will use this new property to store the 5 images as an array
    imagesArray?: BioImageNode[]; 
}

// Interface for the combined data (content + bio) from the ArtworksState
export interface BioContentWrapper {
    content: string; 
    bio: BiographyData | null;
}