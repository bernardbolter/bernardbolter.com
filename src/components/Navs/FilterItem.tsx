import { useArtworks } from '@/providers/ArtworkProvider'

import { FilterProps } from '@/types/filterTypes'

const FilterItem: React.FC<FilterProps> = ({
    name,
    slug,
    color
}) => {
    const [artworks, setArtworks] = useArtworks()
    
    return (
        <div 
            className="filter-nav__item--container"
            onClick={() => setArtworks(
                state => ({
                    ...state,
                    filtersArray: state.filtersArray.includes(slug)
                    ? state.filtersArray.filter(filter => filter !== slug) 
                    : [...state.filtersArray, slug]
                })
            )}    
        >
            <p
               className={artworks.filtersArray.includes(slug) ? "filter-nav__name filter-nav__name--active" : "filter-nav__name" }
            >
                {name}
            </p>
            <div 
                className="filter-nav__box" 
                style={{
                    backgroundColor: color,
                    borderRadius: artworks.filtersArray.includes(slug) ? "50%" : ""
                }}    
            />
        </div>
    )
}

export default FilterItem;