// app/sitemap.ts

import { MetadataRoute } from 'next';
import { AllData } from '@/types/artworkProviderTypes';
import { Artwork } from '@/types/artworkTypes'; 
import { getArtworkData } from '@/lib/dataService'; 

// IMPORTANT: Replace this with your actual, production domain.
const BASE_URL = 'https://bernardbolter.com'; 

// Helper function to safely extract the primary image URL (returns string or undefined)
const getPrimaryImageUrl = (art: Artwork): string | undefined => {
    const artworkFields = art.artworkFields;
    
    // Check for the main artwork image
    if (artworkFields.artworkImage && artworkFields.artworkImage.node) {
        return artworkFields.artworkImage.node.sourceUrl;
    }
    
    // Check for the video poster image as fallback
    if (artworkFields.videoPoster && artworkFields.videoPoster.node) {
        return artworkFields.videoPoster.node.sourceUrl;
    }

    return undefined;
};


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  
  // 1. Define Static Routes 
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0, },
    { url: `${BASE_URL}/bio`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8, },
    { url: `${BASE_URL}/cv`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8, },
    { url: `${BASE_URL}/statement`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8, },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5, },
    { url: `${BASE_URL}/datenschutz`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5, },
  ];

  // 2. Fetch Dynamic Artwork Data
  const allData: AllData = await getArtworkData();
  const artworks: Artwork[] = allData.allArtwork.nodes;

  // 3. Map Dynamic Artwork Routes with the CORRECTED Image URL list
  const dynamicArtworkRoutes: MetadataRoute.Sitemap = artworks.map((artwork) => {
    
    const imageUrl = getPrimaryImageUrl(artwork);

    // FIX: The 'images' property MUST be an array of strings (URLs) to satisfy MetadataRoute.Sitemap
    // We can only provide the URL, not the title/caption objects.
    const images: string[] = imageUrl ? [imageUrl] : [];

    return {
      url: `${BASE_URL}/${artwork.slug}`,
      lastModified: artwork.date ? new Date(artwork.date) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
      // Now images is an array of strings, which is compatible.
      images: images.length > 0 ? images : undefined,
    };
  });

  // 4. Combine and Return all routes
  return [...staticRoutes, ...dynamicArtworkRoutes];
}