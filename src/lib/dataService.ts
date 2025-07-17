import { getAllArtwork } from '@/lib/graphql'
import { Artwork } from '@/types/artworks'

// Import cached data
import cachedArtworks from '../../data/cached-posts-with-images.json'

export async function getArtworkData(): Promise<Artwork[]> {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  try {
    // Try to fetch from GraphQL first
    const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: getAllArtwork }),
      next: { revalidate: 100 }
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    
    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors.map((e: any) => e.message).join(', ')}`)
    }
    
    console.log('Successfully fetched artwork from GraphQL')
    return data.data
    // return {
    //           gArtworks: data.data.allArtworks.nodes, 
    //           cvInfo: data.data.cvinfos,
    //           artistInfo: data.data.artistInfo 
    //       }
    
  } catch (error) {
    console.error('Failed to fetch artwork from GraphQL:', error)
    
    // Fallback to cached data in development
    if (isDevelopment && cachedArtworks) {
      console.log('Using cached artwork data as fallback')
      return cachedArtworks as Artwork[]
    }
    
    // In production, re-throw the error
    throw error
  }
}