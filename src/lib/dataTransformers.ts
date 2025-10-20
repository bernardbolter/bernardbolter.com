// src/lib/dataTransformers.ts

import { 
  Artwork, 
  ArtworkFields, 
  ArtworkImage, 
  ColorfulFields,
  ArtworkLink,
  ArtworkImageNode,
} from '@/types/artworkTypes';
import {
  GqlArtwork,
  GqlArtworkFields,
  GqlImage,
  GqlLink,
  GqlColorfulFields
} from '@/types/gqlTypes';

/**
 * Parse numeric string from GraphQL (handles "10cm", "10.5", etc.)
 */
function parseNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
}

/**
 * Extract first value from taxonomy array
 */
function extractTaxonomy(value: string | string[] | null | undefined): string | null {
  if (!value) return null;
  if (Array.isArray(value)) return value[0] || null;
  return value;
}

/**
 * Transform GraphQL image to app image.
 * FIX: Removed blurDataURL parameter and logic.
 */
export function transformImage(
    gqlImage: GqlImage | null | undefined
): ArtworkImage | null {
  if (!gqlImage?.node) return null;
  
  const node = gqlImage.node;
  const details = node.mediaDetails;
  
  // Check for required fields
  if (
    !node.sourceUrl || 
    !node.srcSet || 
    !details ||
    details.width === undefined || details.width === null ||
    details.height === undefined || details.height === null
  ) {
    return null;
  }
  
  // Final image object
  return {
    node: {
      altText: node.altText || '',
      sourceUrl: node.sourceUrl,
      srcSet: node.srcSet,
      mediaDetails: {
        width: details.width,
        height: details.height,
      },
      // REMOVED: blurDataURL property
    } as ArtworkImageNode, 
  };
}

/**
 * Transform GraphQL Link to app ArtworkLink
 */
function transformLink(gqlLink: GqlLink | null | undefined): ArtworkLink | null {
  if (!gqlLink?.url || !gqlLink.title) return null;
  return {
    url: gqlLink.url,
    title: gqlLink.title,
    target: gqlLink.target || undefined,
  };
}

/**
 * Transform GraphQL artwork fields to app artwork fields
 */
function transformArtworkFields(
  gqlFields: GqlArtworkFields,
): ArtworkFields {
  
  // Helper for image transformation without blur lookup
  const transformImageSimple = (gqlImage: GqlImage | null | undefined): ArtworkImage | null => {
      // transformImage no longer takes a blur argument
      return transformImage(gqlImage); 
  };
  
  if (!gqlFields) {
    throw new Error("Artwork fields are missing in GraphQL response.");
  }
  
  return {
    // Location
    city: extractTaxonomy(gqlFields.city),
    country: extractTaxonomy(gqlFields.country),
    lat: parseNumber(gqlFields.lat),
    lng: parseNumber(gqlFields.lng),
    
    // Dimensions
    height: gqlFields.height || null,
    width: gqlFields.width || null,
    units: extractTaxonomy(gqlFields.units),
    proportion: gqlFields.proportion || null,
    
    // Classification
    orientation: extractTaxonomy(gqlFields.orientation),
    size: extractTaxonomy(gqlFields.size),
    series: extractTaxonomy(gqlFields.series),
    style: extractTaxonomy(gqlFields.style),
    medium: extractTaxonomy(gqlFields.medium),
    
    // Metadata
    year: parseNumber(gqlFields.year),
    forsale: gqlFields.forsale || null,
    metadescription: gqlFields.metadescription || null,
    metakeywords: gqlFields.metakeywords || null,
    
    // Images - using the simplified helper
    artworkImage: transformImageSimple(gqlFields.artworkImage),
    artworkImage2: transformImageSimple(gqlFields.artworkImage2),
    artworkImage3: transformImageSimple(gqlFields.artworkImage3),
    artworkImage4: transformImageSimple(gqlFields.artworkImage4),
    artworkImage5: transformImageSimple(gqlFields.artworkImage5),
    artworkImage6: transformImageSimple(gqlFields.artworkImage6),
    artworkImage7: transformImageSimple(gqlFields.artworkImage7),
    artworkImage8: transformImageSimple(gqlFields.artworkImage8),
    artworkImage9: transformImageSimple(gqlFields.artworkImage9),
    hasMoreImages: gqlFields.hasMoreImages || null,
    
    // Links
    artworklink: transformLink(gqlFields.artworklink),
    
    // DCS Fields 
    area: gqlFields.area || null,
    coordinates: gqlFields.coordinates || null,
    density: gqlFields.density || null,
    elevation: gqlFields.elevation || null,
    population: gqlFields.population || null,
    performance: gqlFields.performance || null,
    extraimages: gqlFields.extraimages || null,

    // Video
    video: transformImageSimple(gqlFields.video),
    videoPoster: transformImageSimple(gqlFields.videoPoster),
    videoYouttubeLink: gqlFields.videoYouttubeLink || null,
    
    // DCS Images
    dcsFlags: transformImageSimple(gqlFields.dcsFlags),
    dcsPhoto: transformImageSimple(gqlFields.dcsPhoto),
    dcsPhotoTitle: gqlFields.dcsPhotoTitle || null,
    dcsRaw: transformImageSimple(gqlFields.dcsRaw),
    dcsSatellite: transformImageSimple(gqlFields.dcsSatellite),
  };
}

/**
 * Transform GraphQL colorful fields to app fields.
 */
function transformColorfulFields(gqlFields: GqlColorfulFields | null | undefined): ColorfulFields { 
  if (!gqlFields) {
    return {
      ar: null,
      storyEn: null,
      storyDe: null,
      wikiLinkEn: null,
      wikiLinkDe: null,
    };
  }
  
  return {
    ar: gqlFields.ar ?? null, 
    storyEn: gqlFields.storyEn ?? null,
    storyDe: gqlFields.storyDe ?? null,
    wikiLinkEn: gqlFields.wikiLinkEn ?? null,
    wikiLinkDe: gqlFields.wikiLinkDe ?? null,
  };
}

/**
 * Transform GraphQL artwork to app artwork
 * FIX: Removed index and blurMap parameters
 */
export function transformArtwork(
    gqlArtwork: GqlArtwork
): Artwork {
  
  return {
    id: gqlArtwork.id,
    databaseId: gqlArtwork.databaseId,
    slug: gqlArtwork.slug || '',
    title: gqlArtwork.title,
    content: gqlArtwork.content || null,
    date: gqlArtwork.date,
    
    artworkFields: transformArtworkFields(gqlArtwork.artworkFields!),
    colorfulFields: transformColorfulFields(gqlArtwork.colorfulFields),
  };
}