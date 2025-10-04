// lib/dataService.ts
import { getClient } from '@/lib/apollo-client';
import { gql, TypedDocumentNode } from '@apollo/client';
import { AllData } from '@/types/artworkProvider';
import { Artwork } from '@/types/artworks';
import { getAllArtwork } from '@/lib/graphql';

// Import cached data
import cachedArtworks from '../../data/cached-posts-with-images.json';

// Define the GraphQL response type
interface GetAllArtworkData {
  allArtwork: { nodes: Artwork[] } | null;
  page: { content: string } | null;
  cvinfos: { nodes: { cv_info_fields: AllData['cvinfos']['nodes'][number] }[] } | null;
  artistInfo: { artistInfo: AllData['artistInfo'] } | null;
}

// Define the type for cached item based on JSON structure
interface CachedArtwork {
  slug: string;
  artworkFields: {
    city: string | null;
    artworklink: { url: string; title: string } | null;
    artworkImage: {
      mediaDetails: {
        sizes: { sourceUrl: string; height: string; width: string }[];
        width: number;
        height: number;
      };
      mediaItemUrl: string;
    } | null;
    country: string | null;
    forsale: boolean | null;
    height: string | null;
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
    width: string | null;
    year: string | null;
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
}

const GET_ALL_DATA: TypedDocumentNode<GetAllArtworkData> = gql`
  ${getAllArtwork}
`;

export async function getArtworkData(): Promise<AllData> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    const client = getClient();
    const result = await client.query({ query: GET_ALL_DATA });

    if (result.error) {
      throw new Error(`GraphQL error: ${result.error.message}`);
    }

    const data = result.data;

    if (!data) {
      throw new Error('GraphQL query returned no data');
    }

    console.log('Successfully fetched artwork from GraphQL');
    return {
      allArtwork: data.allArtwork && data.allArtwork.nodes ? { nodes: data.allArtwork.nodes } : { nodes: [] },
      page: data.page || { content: '' },
      cvinfos: data.cvinfos && data.cvinfos.nodes
        ? { nodes: data.cvinfos.nodes.map((node) => node.cv_info_fields) }
        : { nodes: [] },
      artistInfo: data.artistInfo?.artistInfo || {
        birthcity: '',
        birthyear: '',
        link1: { title: '', url: '' },
        link2: { title: '', url: '' },
        link3: { title: '', url: '' },
        link4: { title: '', url: '' },
        link5: { title: '', url: '' },
        name: '',
        workcity1: '',
        workcity2: '',
        workcity3: '',
      },
    };
  } catch (error: unknown) {
    console.error('Failed to fetch artwork from GraphQL:', error);

    if (isDevelopment && cachedArtworks) {
      console.log('Using cached artwork data as fallback');
      const transformedArtworks: Artwork[] = cachedArtworks.map((item: CachedArtwork, idx: number) => ({
        ...item,
        index: idx,
        artworkFields: {
          ...item.artworkFields,
          height: item.artworkFields.height
            ? parseFloat(item.artworkFields.height.replace(/[^0-9.]/g, '')) || null
            : null,
          width: item.artworkFields.width
            ? parseFloat(item.artworkFields.width.replace(/[^0-9.]/g, '')) || null
            : null,
          year: item.artworkFields.year ? parseInt(item.artworkFields.year, 10) || null : null,
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
      }));
      return {
        allArtwork: { nodes: transformedArtworks },
        page: { content: '' },
        cvinfos: { nodes: [] },
        artistInfo: {
          birthcity: '',
          birthyear: '',
          link1: { title: '', url: '' },
          link2: { title: '', url: '' },
          link3: { title: '', url: '' },
          link4: { title: '', url: '' },
          link5: { title: '', url: '' },
          name: '',
          workcity1: '',
          workcity2: '',
          workcity3: '',
        },
      };
    }

    throw error;
  }
}