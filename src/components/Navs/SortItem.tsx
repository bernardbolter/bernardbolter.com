import { useArtworks } from '@/providers/ArtworkProvider'

import { SortProps } from '@/types/filter'

const SortItem: React.FC<SortProps> = ({
    slug,
    name
}) => {
    const [artworks, setArtworks] = useArtworks()
    console.log(artworks.sorting)

    return (
        <div 
            className="filter-nav__item--container"
            // onClick={() => setArtworks(state => ({...state, sorting: slug}))}
            onClick={() => setArtworks(state => ({...state, sorting: slug}))}
        >
            <p
               className={artworks.sorting === slug ? "filter-nav__name filter-nav__name--active" : "filter-nav__name" }
            >
                {name}
            </p>
            <div 
                className="filter-nav__box sorting-nav__box" 
                style={{
                    borderRadius: artworks.sorting === slug ? "50%" : ""
                }}    
            />
        </div>
    )
}

export default SortItem