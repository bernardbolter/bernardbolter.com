import { Dispatch, SetStateAction } from "react";
import { Artwork } from '@/types/artworksTypes'
import { BiographyData } from "./bioTypes";
import { TimelineResult } from "./timlineTypes";

export interface ArtworksState {
  original: Artwork[];
  filtered: Artwork[];
  formattedArtworks: TimelineResult | null;
  currentArtworkIndex: number;
  sorting: string;
  artworkViewTimeline: boolean;
  filtersArray: Array<string>;
  filterNavOpen: boolean;
  searchNavOpen: boolean;
  showSlideshow: boolean;
  slideshowPlaying: boolean;
  slideshowTimerProgress: number;
  isTimelineScrollingProgamatically: boolean;
  searchValue: string;
  infoOpen: boolean;
  cvData: CVItem[];
  artistData: ArtistInfo;
  bioData: { 
      content: string; 
      bio: BiographyData | null;
  } | null;
  viewportWidth: number;
  viewportHeight: number;
  artworkContainerWidth: number;
  artworkContainerHeight: number;
  artworkDesktopSideWidth: number;
  // Preserve timeline state when switching views
  savedTimelineIndex: number;
  savedTimelineFiltersHash: string; // Hash of filters/search/sort to detect changes
}

export interface ArtistInfoLink {
  title?: string;
  url?: string;
}

export interface ArtistInfo {
  birthcity?: string;
  birthyear?: string;
  link1?: ArtistInfoLink;
  link2?: ArtistInfoLink;
  link3?: ArtistInfoLink;
  link4?: ArtistInfoLink;
  link5?: ArtistInfoLink;
  name?: string;
  workcity1?: string;
  workcity2?: string;
  workcity3?: string;
}

export interface CVItem {
  __typename?: string;
  city?: string;
  gallery?: string;
  role?: string;
  school?: string;
  section?: string[];
  title?: string;
  year?: number
}

export interface BioInfo {
  content?: string;
}

export interface AllData {
  allArtwork: { nodes: Artwork[] };
  page: { 
      content: string; 
      bio: BiographyData | null;
  } | null;
  cvinfos: { nodes: CVItem[] };
  artistInfo: ArtistInfo;
}

export type ArtworksContextType = [ArtworksState, Dispatch<SetStateAction<ArtworksState>>];