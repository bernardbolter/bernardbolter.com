/**
 * Raw GraphQL response types - these match what WordPress returns
 * Notice: Arrays for taxonomy fields, string dimensions, etc.
 */

export interface GqlImageNode {
  altText?: string;
  sourceUrl: string;
  srcSet?: string;
  mediaDetails?: {
    width?: number;
    height?: number;
  };
  slug?: string;
  uri?: string;
}

export interface GqlImage {
  node?: GqlImageNode | null;
}

export interface GqlLink {
  url?: string;
  title?: string;
  target?: string;
}

export interface GqlArtworkFields {
  city?: string | null;
  country?: string | null;
  lat?: string | null; // GraphQL returns as string!
  lng?: string | null;
  
  height?: string | null; // GraphQL returns as string!
  width?: string | null;
  units?: string[] | null;
  proportion?: number | null;
  
  orientation?: string[] | null; // Array from taxonomy!
  size?: string[] | null; // Array from taxonomy!
  series?: string | string[] | null;
  style?: string | null;
  medium?: string | null;
  
  year?: string | null; // GraphQL returns as string!
  forsale?: boolean | null;
  price?: string | null;
  provenance?: string | null;
  metadescription?: string | null;
  metakeywords?: string | null;
  
  artworkImage?: GqlImage | null;
  artworkImage2?: GqlImage | null;
  artworkImage3?: GqlImage | null;
  artworkImage4?: GqlImage | null;
  artworkImage5?: GqlImage | null;
  artworkImage6?: GqlImage | null;
  artworkImage7?: GqlImage | null;
  artworkImage8?: GqlImage | null;
  artworkImage9?: GqlImage | null;
  hasMoreImages?: boolean | null;
  
  artworklink?: GqlLink | null;
  
  area?: string | null;
  coordinates?: string | null;
  density?: number | null;
  elevation?: number | null;
  population?: number | null;
  performance?: string | null;
  extraimages?: string | null;
  
  video?: GqlImage | null;
  videoPoster?: GqlImage | null;
  videoYouttubeLink?: string | null;
  
  dcsFlags?: GqlImage | null;
  dcsPhoto?: GqlImage | null;
  dcsPhotoTitle?: string | null;
  dcsRaw?: GqlImage | null;
  dcsSatellite?: GqlImage | null;
  
  slug?: string | null;
}

export interface GqlColorfulFields {
  ar?: boolean | null;
  storyEn?: string | null;
  storyDe?: string | null;
  wikiLinkEn?: string | null;
  wikiLinkDe?: string | null;
}

export interface GqlArtwork {
  id: string;
  databaseId: number;
  slug?: string;
  title: string;
  content?: string | null;
  date: string;
  dateGmt?: string;
  artworkFields?: GqlArtworkFields | null;
  colorfulFields?: GqlColorfulFields | null;
}

export interface GqlBiographyData {
  tagline?: string | null;
  bioimage1?: GqlImage | null;
  bioimage2?: GqlImage | null;
  bioimage3?: GqlImage | null;
  bioimage4?: GqlImage | null;
  bioimage5?: GqlImage | null;
}

export interface GqlBiography {
  content?: string | null;
  bio?: GqlBiographyData | null;
}

export interface GqlCVInfoFields {
  city?: string | null;
  gallery?: string | null;
  role?: string | null;
  school?: string | null;
  section?: string[] | null;
  title?: string | null;
  year?: number | null;
}

export interface GqlCVInfo {
  cvInfoFields: GqlCVInfoFields;
}

export interface GqlArtistData {
  birthcity?: string | null;
  birthyear?: string | null;
  name?: string | null;
  workcity1?: string | null;
  workcity2?: string | null;
  workcity3?: string | null;
  link1?: GqlLink | null;
  link2?: GqlLink | null;
  link3?: GqlLink | null;
  link4?: GqlLink | null;
  link5?: GqlLink | null;
  fieldGroupName?: string | null;
}

export interface GqlArtistInfo {
  id: string;
  artistData?: GqlArtistData | null;
}

export interface GqlGetAllArtworkResponse {
  allArtwork?: { nodes: GqlArtwork[] } | null;
  biography?: GqlBiography | null; 
  cvinfos?: { nodes: GqlCVInfo[] } | null;
  artistInfo?: GqlArtistInfo | null; 
}
export interface GqlGetSingleArtworkResponse {
  artwork?: GqlArtwork | null;
}