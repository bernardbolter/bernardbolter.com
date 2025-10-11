import { useArtworks } from "@/providers/ArtworkProvider"

const ArtworkSwitcher = () => {
    const [artworks, setArtworks] = useArtworks()
    return (
        <div 
            className="artwork-switcher__container"
             onClick={() => setArtworks(state => ({...state, artworkViewTimeline: !state.artworkViewTimeline}))}    
        >
            <p className={`switcher__option ${artworks.artworkViewTimeline ? 'switcher__option--active' : ''}`}>Timeline</p>
            <div className="switcher__ball-container">
                <div  className={`switcher__ball ${!artworks.artworkViewTimeline ? 'switcher__ball--right' : ''}`} />
            </div>
            <p className={`switcher__option ${!artworks.artworkViewTimeline ? 'switcher__option--active' : ''}`}>Grid</p>
        </div>
    )
}

export default ArtworkSwitcher