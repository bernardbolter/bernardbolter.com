// src/lib/dataService.ts

import { getClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import { AllData, CVItem, ArtistInfoLink, ArtistData } from '@/types/artworkProviderTypes';
import { 
  GqlGetAllArtworkResponse, 
  GqlGetSingleArtworkResponse, 
  GqlCVInfo,
  GqlLink,
  GqlBiographyData,
  GqlImage,
  // GqlArtworkFields is no longer needed since ALL_IMAGE_FIELDS is removed
} from '@/types/gqlTypes';
// Updated import: transformArtwork now only takes one argument
import { transformArtwork } from '@/lib/dataTransformers'; 
import { getAllArtwork, getSingleArtwork } from '@/lib/graphql';
import { Artwork } from '@/types/artworkTypes';
import { BiographyData, BioImageNode } from "@/types/bioTypes";

// REMOVED: Blur utility imports (generateBlurDataURL, getSmallestSrcUrl)

const GET_ALL_DATA = gql`${getAllArtwork}`;
const GET_ARTWORK_BY_SLUG = gql`${getSingleArtwork}`;


// -----------------------------------------------------------
// HELPER TRANSFORMERS (No changes needed for blur removal)
// -----------------------------------------------------------

/**
 * Transform GraphQL Link to app ArtistInfoLink
 */
function transformArtistLink(gqlLink: GqlLink | null | undefined): ArtistInfoLink | undefined {
    // FIX: Changed condition to match ArtistInfoLink which has optional properties
    if (!gqlLink?.url && !gqlLink?.title) return undefined; 
    return {
        url: gqlLink.url || undefined,
        title: gqlLink.title || undefined,
        target: gqlLink.target || undefined,
    }
}

/**
 * Transform GraphQL Image to BioImageNode
 */
function transformBioImage(gqlImage: GqlImage | null | undefined): BioImageNode | null {
  const node = gqlImage?.node;
  if (!node) return null;
  
  const details = node.mediaDetails;

  // CRITICAL CHECK for Error 2: Check for required non-nullable properties
  if (!node.sourceUrl || !node.srcSet || !details) {
    return null;
  }

  // CRITICAL CHECK for Error 1: Check for required mediaDetails properties
  if (details.width === undefined || details.width === null ||
      details.height === undefined || details.height === null) {
    return null; 
  }

  return {
    node: {
        altText: node.altText || null,
        // Non-null assertion (!) is now safe because the checks passed
        sourceUrl: node.sourceUrl!, 
        srcSet: node.srcSet!, 
        mediaDetails: {
            width: details.width!, 
            height: details.height!, 
        },
    }
  };
}

/**
 * Transform GraphQL BiographyData to app BiographyData
 */
function transformBiography(gqlBio: GqlBiographyData | null | undefined): BiographyData | null {
    if (!gqlBio) return null;

    const imagesArray: BioImageNode[] = [];
    // Transform and collect bio images
    const bioImage1 = transformBioImage(gqlBio.bioimage1);
    const bioImage2 = transformBioImage(gqlBio.bioimage2);
    const bioImage3 = transformBioImage(gqlBio.bioimage3);
    const bioImage4 = transformBioImage(gqlBio.bioimage4);
    const bioImage5 = transformBioImage(gqlBio.bioimage5);
    
    if (bioImage1) imagesArray.push(bioImage1);
    if (bioImage2) imagesArray.push(bioImage2);
    if (bioImage3) imagesArray.push(bioImage3);
    if (bioImage4) imagesArray.push(bioImage4);
    if (bioImage5) imagesArray.push(bioImage5);


    return {
        tagline: gqlBio.tagline || null,
        bioimage1: bioImage1,
        bioimage2: bioImage2,
        bioimage3: bioImage3,
        bioimage4: bioImage4,
        bioimage5: bioImage5,
        imagesArray: imagesArray,
    };
}


/**
 * Transform GraphQL CV info to app CV item
 */
function transformCVItem(node: GqlCVInfo): CVItem {
  return {
    city: node.cvInfoFields.city || undefined,
    gallery: node.cvInfoFields.gallery || undefined,
    role: node.cvInfoFields.role || undefined,
    school: node.cvInfoFields.school || undefined,
    section: node.cvInfoFields.section || undefined,
    title: node.cvInfoFields.title || undefined,
    year: node.cvInfoFields.year || undefined,
  };
}

// REMOVED: IMAGE METADATA COLLECTION LOGIC (collectImageMetadata function)

// -----------------------------------------------------------
// MAIN TRANSFORMER
// -----------------------------------------------------------

/**
 * Transform GraphQL response to application data structure
 * FIX: Removed blurMap parameter.
 */
function transformGqlResponse(data: GqlGetAllArtworkResponse): AllData {
  // FIX: transformArtwork now only takes gqlArtwork as an argument.
  const artworks = (data.allArtwork?.nodes || []).map((gqlArtwork) => 
    transformArtwork(gqlArtwork) 
  );
  
  // Transform CV and Artist Info
  const cvInfos = (data.cvinfos?.nodes || []).map(transformCVItem);

  const gqlArtistData = data.artistInfo?.artistData;

  // Transform Artist Data (ArtistInfo)
  const artistDataFinal: ArtistData | null = gqlArtistData ? {
      name: gqlArtistData.name || undefined,
      birthcity: gqlArtistData.birthcity || undefined,
      birthyear: gqlArtistData.birthyear || undefined,
      workcity1: gqlArtistData.workcity1 || undefined,
      workcity2: gqlArtistData.workcity2 || undefined,
      workcity3: gqlArtistData.workcity3 || undefined,
      link1: transformArtistLink(gqlArtistData.link1),
      link2: transformArtistLink(gqlArtistData.link2),
      link3: transformArtistLink(gqlArtistData.link3),
      link4: transformArtistLink(gqlArtistData.link4),
      link5: transformArtistLink(gqlArtistData.link5),
  } : null;

  const biography = data.biography;
  const statement = data.page;
  const contact = data.contact;
  const datenschutz = data.datenschutz;

  return {
    allArtwork: { nodes: artworks },
    biography: biography
      ? {
          content: biography.content || '',
          bio: transformBiography(biography.bio),
        }
      : null,
    cvinfos: { nodes: cvInfos },
    artistData: artistDataFinal,
    statement: statement ? {
          content: statement.content || '',
        }
      : null,
    contact: contact? {
        content: contact.content || ''
      } : null,
    datenschutz: datenschutz? {
        content: datenschutz.content || ''
      } : null,
  };
}


// -----------------------------------------------------------
// DATA FETCHERS (CLEANED UP)
// -----------------------------------------------------------

/**
 * Fetch all artwork data
 */
export async function getArtworkData(): Promise<AllData> {
  try {
    const client = getClient();
    const result = await client.query<GqlGetAllArtworkResponse>({
      query: GET_ALL_DATA,
      // Add fetch context for better caching/revalidation in Next.js
      context: {
        fetchOptions: {
          next: { revalidate: 60 }, 
        },
      },
    });

    if (result.error) {
      throw new Error(`GraphQL error: ${result.error.message}`);
    }

    if (!result.data) {
      throw new Error('GraphQL query returned no data');
    }

    const rawData = result.data;

    // 4. Transform the raw data (without blur map)
    return transformGqlResponse(rawData);
  } catch (error) {
    console.error('❌ Failed to fetch artwork from GraphQL:', error);
    throw error;
  }
}

/**
 * Fetch single artwork by slug
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
  try {
    const client = getClient();
    const result = await client.query<GqlGetSingleArtworkResponse>({
      query: GET_ARTWORK_BY_SLUG,
      variables: { slug },
    });

    if (result.error) {
      throw new Error(`GraphQL error: ${result.error.message}`);
    }

    const gqlArtwork = result.data?.artwork;

    if (!gqlArtwork) return null;

    // FIX: Call transformArtwork with the single argument
    return transformArtwork(gqlArtwork); 
  } catch (error) {
    console.error(`❌ Failed to fetch artwork by slug (${slug}) from GraphQL:`, error);
    return null;
  }
}