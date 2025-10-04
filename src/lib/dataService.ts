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

// Define response type for single artwork query
interface GetArtworkBySlugData {
  artwork: Artwork | null;
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

const GET_ARTWORK_BY_SLUG: TypedDocumentNode<GetArtworkBySlugData> = gql`
  query GetArtworkBySlug($slug: ID!) {
    artwork(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      content
      databaseId
      artworkFields {
        artworkImage {
          mediaDetails {
            sizes {
              sourceUrl
              width
              height
            }
            width
            height
          }
          mediaItemUrl
        }
        width
        height
        medium
        style
        orientation
        size
        series
        city
        country
        lat
        lng
        year
        forsale
        proportion
        metadescription
        metakeywords
        artworklink {
          url
          title
        }
      }
      colorfulFields {
        wikiLinkEn
        wikiLinkDe
        storyEn
        storyDe
        ar
      }
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
    }
  }
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

export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    const client = getClient();
    const result = await client.query({
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

    console.log('Successfully fetched artwork by slug from GraphQL');
    return data.artwork;
  } catch (error: unknown) {
    console.error(`Failed to fetch artwork with slug ${slug} from GraphQL:`, error);

    // Fallback to cached data in development
    if (isDevelopment && cachedArtworks) {
      console.log('Searching cached artwork data as fallback');
      const cachedItem = cachedArtworks.find((item: CachedArtwork) => item.slug === slug);
      
      if (cachedItem) {
        const transformedArtwork: Artwork = {
          ...cachedItem,
          index: 0,
          artworkFields: {
            ...cachedItem.artworkFields,
            height: cachedItem.artworkFields.height
              ? parseFloat(cachedItem.artworkFields.height.replace(/[^0-9.]/g, '')) || null
              : null,
            width: cachedItem.artworkFields.width
              ? parseFloat(cachedItem.artworkFields.width.replace(/[^0-9.]/g, '')) || null
              : null,
            year: cachedItem.artworkFields.year ? parseInt(cachedItem.artworkFields.year, 10) || null : null,
            series: Array.isArray(cachedItem.artworkFields.series)
              ? cachedItem.artworkFields.series
              : cachedItem.artworkFields.series
              ? [cachedItem.artworkFields.series]
              : [],
            lat: cachedItem.artworkFields.lat ? parseFloat(cachedItem.artworkFields.lat) || null : null,
            lng: cachedItem.artworkFields.lng ? parseFloat(cachedItem.artworkFields.lng) || null : null,
          },
          colorfulFields: {
            ...cachedItem.colorfulFields,
            ar: typeof cachedItem.colorfulFields.ar === 'boolean' ? cachedItem.colorfulFields.ar : null,
          },
        };
        return transformedArtwork;
      }
    }

    return null;
  }
}