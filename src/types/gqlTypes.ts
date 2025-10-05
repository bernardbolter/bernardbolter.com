import { Artwork } from './artworksTypes';
import { BiographyData } from './bioTypes';
import { ArtistInfo, CVItem } from './artworkProviderTypes';

export interface GqlCVNode {
    cvInfoFields: CVItem;
}

export interface GqlGetAllArtworkResponse {
  allArtwork: { nodes: Artwork[] } | null;
  biography: { 
    content: string; 
    bio: BiographyData | null; 
  } | null;
  cvinfos: { nodes: GqlCVNode[] } | null;
  artistInfo: { artistData: ArtistInfo } | null; 
}

export interface GqlGetSingleArtworkResponse {
  artwork: Artwork | null;
}