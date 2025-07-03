import Artworks from '@/components/Artworks/Artworks'
import Name from '@/components/Name'
import Nav from '@/components/Nav'

import { getAllArtwork } from '@/lib/graphql'
import { Artwork } from '@/types/artworks'

async function getArtwork(): Promise<Artwork[]> {
  const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: getAllArtwork }),
    next: { revalidate: 100 }
  })

  const data = await res.json()
  // console.log(data)
  
  return data.data.allArtwork.nodes
}

const Home = async () => {
  const gArtworks = await getArtwork()

  return (
    <main className="main-container">
      <Name />
      <Nav />
      <Artworks gArtworks={gArtworks} />
    </main>
  ) 
}

export default Home