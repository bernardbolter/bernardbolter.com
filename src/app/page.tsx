import Artworks from '@/components/Artworks/Artworks'
import Info from '@/components/Info/Info'
import Nav from '@/components/Navs/Nav'

// import { getAllArtwork } from '@/lib/graphql'
// import { getArtworkData } from '@/lib/dataService'
// import { Artwork } from '@/types/artworks'

// async function getArtwork(): Promise<Artwork[]> {
//   const res = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL as string, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ query: getAllArtwork }),
//     next: { revalidate: 100 }
//   })

//   const data = await res.json()
//   // console.log(data)
  
//   return data.data.allArtwork.nodes
// }

const Home = async () => {
  // console.log('gArtworks: ', gArtworks)

  return (
    <main className="main-container">
      <Info />
      <Nav />
      <Artworks/>
    </main>
  ) 
}

export default Home