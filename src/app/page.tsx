import Artworks from '@/components/Artworks/Artworks'
import Info from '@/components/Info/Info'
import Nav from '@/components/Navs/Nav'

const Home = async () => {

  return (
    <main className="main-container">
      <Info />
      <Nav />
      <Artworks/>
    </main>
  ) 
}

export default Home