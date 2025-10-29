'use client'

import { useArtworks } from '@/providers/ArtworkProvider'
import useWindowSize from '@/hooks/useWindowSize'

import SortSvg from '@/svgs/SortSvg'
import FilterLightSvg from '@/svgs/FilterLightSvg'
import CloseCircleSvg from '@/svgs/CloseCircleSvg'

import FilterItem from '@/components/Navs/FilterItem'
import SortItem from '@/components/Navs/SortItem'

import { filterValues } from '@/data/filterValues'
import { sortValues } from '@/data/sortValues'

const FilterNav: React.FC = () => {
    const [artworks, setArtworks] = useArtworks()
    const size = useWindowSize()
    
    return (
        <div 
            className={artworks.filterNavOpen ? "filter-nav__container filter-nav__container--open" : "filter-nav__container"}
            style={{
                top: size.width && size.width < 768
                ? 79
                : artworks.artworkViewTimeline ? 204 : 79,
                display: artworks.showSlideshow ? "none": "",
                maxHeight: size.width && size.width < 768
                ? (size.height || 500) - 83
                : artworks.artworkViewTimeline ? (size.height || 400) - 210 : (size.height || 500) - 83 
            }}    
        >
            <div className="filter-nav__container--inner">
                <div 
                    className="filter-nav__close-container"
                    onClick={() => setArtworks(state => ({
                        ...state,
                        filtersArray: [],
                        searchValue: '',
                        filterNavOpen: false
                    }))}    
                >
                    <CloseCircleSvg />
                    <p>clear</p>
                </div>
                <div className="filter-nav__header filter-nav__header--sort">
                    <h3>Sort</h3>
                    <SortSvg />
                </div>

                <div className='filter-nav__line' />

                <div className="filter-nav__content">
                    {sortValues.map(value => {
                        return <SortItem key={value.id} {...value} />
                    })}
                </div>

                <div className="filter-nav__header filter-nav__header--filters">
                    <h3>Filters</h3>
                    <FilterLightSvg />
                </div>

                <div className='filter-nav__line' />
                
                <div 
                    className="filter-nav__item--container"
                    onClick={() => setArtworks(state => ({...state, isAvailableFilter: !state.isAvailableFilter}))}    
                >
                    <p
                    className={artworks.isAvailableFilter ? "filter-nav__name filter-nav__name--active" : "filter-nav__name" }
                    >
                        Available
                    </p>
                    <div 
                        className="filter-nav__box" 
                        style={{
                            backgroundColor: '#d4af37',
                            borderRadius: artworks.isAvailableFilter ? "50%" : ""
                        }}    
                    />
                </div>

                <div className='filter-nav__line' />

                <div className="filter-nav__content">
                    {filterValues.map(value => {
                        return <FilterItem key={value.id} {...value} />
                    })}
                </div>
            </div>
        </div>
    )
}

export default FilterNav