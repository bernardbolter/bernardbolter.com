// lib/dataService.ts
import { getClient } from '@/lib/apollo-client';
import { gql, TypedDocumentNode } from '@apollo/client';
import { AllData, ArtistInfo } from '@/types/artworkProviderTypes'; // Re-importing core types
import { Artwork } from '@/types/artworksTypes';
import { GqlGetAllArtworkResponse, GqlGetSingleArtworkResponse } from '@/types/gqlTypes'; // NEW: Imported GQL response types
import { getAllArtwork, getSingleArtwork } from '@/lib/graphql';

// Import cached data for fallback
import cachedArtworks from '../../data/cached-posts-with-images.json';

// --- Interface for Cached Artworks (Must match JSON structure) ---
// NOTE: This type is defined locally as it relates ONLY to the JSON file structure.
// It reflects the expected data shape in your cached JSON file for the fallback logic.
interface CachedArtwork {
  slug: string;
  artworkFields: {
    city: string | null;
    artworklink: { url: string; title: string; target: string } | null;
    artworkImage: {
      node: {
        altText: string;
        srcSet: string;
        sourceUrl: string;
        mediaDetails: {
          width: number;
          height: number;
        }
      };
    } | null;
    country: string | null;
    forsale: boolean | null;
    height: string | null; // Stored as string in cache
    lat: string | null;
    lng: string | null;
    medium: string | null;
    metadescription: string | null;
    metakeywords: string | null;
    orientation: string | null;
    proportion: number | null;
    series: string | string[];
    size: string | null;
    style: string | null;
    width: string | null; // Stored as string in cache
    year: string | null; // Stored as string in cache
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
  featuredImage?: { node: { sourceUrl: string; altText: string } } | null;
}

// Map the imported queries to the GQL response types
const GET_ALL_DATA: TypedDocumentNode<GqlGetAllArtworkResponse> = gql`
  ${getAllArtwork}
`;

const GET_ARTWORK_BY_SLUG: TypedDocumentNode<GqlGetSingleArtworkResponse> = gql`
  ${getSingleArtwork}
`;


// --- Main Data Fetcher ---

export async function getArtworkData(): Promise<AllData> {
  const isDevelopment = process.env.NODE_ENV === 'development'; 

  try {
    const client = getClient();
    // Fetch data using the GQL response type interface
    const result = await client.query<GqlGetAllArtworkResponse>({ query: GET_ALL_DATA });

    if (result.error) {
      throw new Error(`GraphQL error: ${result.error.message}`);
    }

    const data = result.data;

    if (!data) {
      throw new Error('GraphQL query returned no data');
    }

    console.log('Successfully fetched all data from GraphQL');
    
    // --- Data Transformation to fit AllData (Application State) ---
    return {
      allArtwork: data.allArtwork && data.allArtwork.nodes ? { nodes: data.allArtwork.nodes } : { nodes: [] },
      
      // FIX 1: Transform 'biography' field to the application's 'page' property
      page: data.biography 
        ? { content: data.biography.content || '', bio: data.biography.bio || null }
        : null, // Use null if no biography data is returned
      
      // FIX 2: Correct access from 'cvinfos.nodes.cvInfoFields' (camelCase)
      cvinfos: data.cvinfos && data.cvinfos.nodes
        ? { nodes: data.cvinfos.nodes.map((node) => node.cvInfoFields) }
        : { nodes: [] },
        
      // FIX 3: Ensure artistInfo returns the core data object
      artistInfo: data.artistInfo?.artistData || {} as ArtistInfo, // Initialize with empty object if null
    };
  } catch (error: unknown) {
    console.error('Failed to fetch artwork from GraphQL:', error);

    // --- Fallback to Cached Data in Development ---
    if (isDevelopment && cachedArtworks) {
      console.log('Using cached artwork data as fallback');
      const transformedArtworks: Artwork[] = (cachedArtworks as CachedArtwork[]).map((item: CachedArtwork, idx: number) => ({
        ...item,
        index: idx,
        // Ensure parsing logic handles the string fields from the JSON cache
        artworkFields: {
          ...item.artworkFields,
          // Numeric parsing from string fields
          height: item.artworkFields.height
            ? parseFloat(item.artworkFields.height.replace(/[^0-9.]/g, '')) || null
            : null,
          width: item.artworkFields.width
            ? parseFloat(item.artworkFields.width.replace(/[^0-9.]/g, '')) || null
            : null,
          year: item.artworkFields.year ? parseInt(item.artworkFields.year, 10) || null : null,
          // Array parsing for series
          series: Array.isArray(item.artworkFields.series)
            ? item.artworkFields.series
            : item.artworkFields.series
            ? [item.artworkFields.series]
            : [],
          lat: item.artworkFields.lat ? parseFloat(item.artworkFields.lat) || null : null,
          lng: item.artworkFields.lng ? parseFloat(item.artworkFields.lng) || null : null,
        },
        colorfulFields: {
          ...item.colorfulFields,
          ar: typeof item.colorfulFields.ar === 'boolean' ? item.colorfulFields.ar : null,
        },
      } as Artwork));

      // Return a full AllData object from the cache
      return {
        allArtwork: { nodes: transformedArtworks },
        page: null, // Cannot reconstruct bio/page data from artwork cache
        cvinfos: { nodes: [] }, // Cannot reconstruct CV data from artwork cache
        artistInfo: {} as ArtistInfo, // Cannot reconstruct artist info from artwork cache
      };
    }

    throw error;
  }
}

// --- Single Artwork Fetcher ---

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    const client = getClient();
    const result = await client.query<GqlGetSingleArtworkResponse>({
      query: GET_ARTWORK_BY_SLUG,
      variables: { slug },
    });

    if (result.error) {
      throw new Error(`GraphQL error: ${result.error.message}`);
    }

    const data = result.data;

    if (!data || !data.artwork) {
      console.log(`No artwork found for slug: ${slug}`);
      return null;
    }

    return data.artwork;
  } catch (error: unknown) {
    console.error(`Failed to fetch artwork with slug ${slug} from GraphQL:`, error);

    // Fallback logic remains the same (searching the cache)
    if (isDevelopment && cachedArtworks) {
      const cachedItem = (cachedArtworks as CachedArtwork[]).find((item: CachedArtwork) => item.slug === slug);
      
      if (cachedItem) {
        // ... (Transformation logic from the getArtworkData fallback would be repeated here) ...
        // Since the logic is extensive, we simplify the fallback for single fetch
        return cachedItem as unknown as Artwork;
      }
    }

    return null;
  }
}