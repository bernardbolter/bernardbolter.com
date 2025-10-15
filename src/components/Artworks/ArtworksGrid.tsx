"use client"

import { useArtworks } from '@/providers/ArtworkProvider'
import useWindowSize from '@/hooks/useWindowSize'

import ArtworkGridImage from './ArtworkGridImage'

import { getGridItemContainerSize } from '@/helpers/getGridItemContainerSize'

const ArtworkGrid = ()  => {
    const [artworks] = useArtworks()
    const size = useWindowSize()

    const itemSize = getGridItemContainerSize(size.width)
    const paddingValue = `${itemSize.gap}px`

    return (
        <div 
            className='artwork-grid__container'
            style={{ padding: paddingValue }}    
        >
            {artworks.filtered.map((artwork, i) => {
                return (
                    <div 
                        key={i}
                        className="artwork-grid__item"
                    >
                        <ArtworkGridImage
                            artwork={artwork}
                            itemSize={itemSize}
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default ArtworkGrid