"use client"

import { useArtworks } from '@/providers/ArtworkProvider'
import useWindowSize from '@/hooks/useWindowSize'
import Masonry from 'react-masonry-css'

import ArtworkGridImage from './ArtworkGridImage'

import { getGridItemContainerSize } from '@/helpers/getGridItemContainerSize'

const BREAKPOINT_COL_COUNTS = {
    default: 5,
    1200: 4,
    980: 3,
    768: 2,
    550: 1
}

const ArtworkGrid = ()  => {
    const [artworks] = useArtworks()
    const size = useWindowSize()

    const itemSize = getGridItemContainerSize(size.width)
    const calculateItemSize = {
        width: itemSize.width,
        height: 0,
        gap: itemSize.gap
    }

    const columnClassName = `artwork-grid__column`
    // const columnGutter = `${itemSize.gap}px`

    return (
        <Masonry
            breakpointCols={BREAKPOINT_COL_COUNTS}
            className='artwork-grid__container'
            columnClassName={columnClassName}
            // columnGutter={columnGutter}
        >
            {artworks.filtered.map((artwork, i) => {
                return (
                    <div key={i} >
                        <ArtworkGridImage
                            artwork={artwork}
                            itemSize={calculateItemSize}
                        />
                    </div>
                )
            })}
        </Masonry>
    )
}

export default ArtworkGrid