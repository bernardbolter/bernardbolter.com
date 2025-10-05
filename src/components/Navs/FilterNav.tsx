'use client'

import { useArtworks } from '@/providers/ArtworkProvider'

import SortSvg from '@/svgs/SortSvg'
import FilterLightSvg from '@/svgs/FilterLightSvg'

import FilterItem from '@/components/Navs/FilterItem'
import SortItem from '@/components/Navs/SortItem'

import { filterValues } from '@/data/filterValues'
import { sortValues } from '@/data/sortValues'

import { FilterNavProps} from '@/types/filterTypes'


const FilterNav: React.FC<FilterNavProps> = () => {
    const [artworks] = useArtworks()
    // console.log(filterValues)
    return (
        <div 
            className={artworks.filterNavOpen ? "filter-nav__container filter-nav__container--open" : "filter-nav__container"}
            style={{ display: artworks.showSlideshow ? "none": "" }}    
        >
            <div className="filter-nav__header filter-nav__header--sort">
                <h3>Sort</h3>
                <SortSvg />
            </div>

            <div className="filter-nav__content">
                {sortValues.map(value => {
                    return <SortItem key={value.id} {...value} />
                })}
            </div>

            <div className="filter-nav__header filter-nav__header--filters">
                <h3>Filters</h3>
                <FilterLightSvg />
            </div>

            <div className="filter-nav__content">
                {filterValues.map(value => {
                    // console.log(value)
                    return <FilterItem key={value.id} {...value} />
                })}
            </div>

        </div>
    )
}

export default FilterNav