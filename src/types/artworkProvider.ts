import { Dispatch, SetStateAction } from "react";
import { Artwork } from '@/types/artworks'
export interface ArtworksState {
  original: Artwork[];
  filtered: Artwork[];
  currentArtworkIndex: number;
  sorting: string;
  filtersArray: Array<string>;
  filterNavOpen: boolean;
  searchNavOpen: boolean;
  showSlideshow: boolean;
  slideshowPlaying: boolean;
  slideshowTimerProgress: number;
  isTimelineScrollingProgamatically: boolean;
  searchValue: string;
  infoOpen: boolean;
  cvData: CVitem[];
  artistData: ArtistInfo;
  bioData: string;
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

export interface CVitem {
  city?: string;
  gallery?: string;
  role?: string;
  school?: string;
  section?: string;
  title?: string;
  year?: number
}

export interface BioInfo {
  content: string;
}

export interface AllData {
  allArtwork: { nodes: Artwork[] };
  page: { content: string }; // Adjust based on actual page data
  cvinfos: { nodes: CVitem[] };
  artistInfo: ArtistInfo;
}

export type ArtworksContextType= [ArtworksState, Dispatch<SetStateAction<ArtworksState>>];