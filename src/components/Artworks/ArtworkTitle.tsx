'use client'

import { useArtworks } from '@/providers/ArtworkProvider'
import useWindowSize from '@/hooks/useWindowSize'

import { getSeriesColor } from '@/helpers/seriesColor'

import ArtworkSize from './ArtworkSize'
import TitleCornerTopLeft from '@/svgs/TitleCornerTopLeft'
import TitleCornerTopRight from '@/svgs/TitleCornerTopRight'
import TitleCornerBottomLeft from '@/svgs/TitleCornerBottomLeft'
import TitleCornerBottomRight from '@/svgs/TitleCornerBottomRight'

const ArtworkTitle = () => {
    const [artworks] = useArtworks()
    const size = useWindowSize()

    // Get current artwork from formattedArtworks or fall back to filtered
    const currentArtwork = artworks.formattedArtworks?.artworksArray?.[artworks.currentArtworkIndex] 
        ?? artworks.filtered[artworks.currentArtworkIndex];

    // useEffect(() => {
    //     if (currentArtwork?.artworkFields?.width && currentArtwork?.artworkFields?.height) {
    //         const width = String(currentArtwork.artworkFields.width);
    //         const height = String(currentArtwork.artworkFields.height);

    //     }
    // }, [currentArtwork])

    if (!currentArtwork) {
        return null;
    }

    return (
        <div 
            className={
                !artworks.artworkViewTimeline && !artworks.showSlideshow 
                ? 'artwork-title__container artwork-title__container--hide'
                : artworks.showSlideshow
                ? "artwork-title__container artwork-title__container--slideshow"
                : size.width && size.width <= 768
                ? "artwork-title__container artwork-title__container--mobile"
                : "artwork-title__container artwork-title__container--desktop"
            }>
            <div className="artwork-title__border-top">
                <div className="artwork-title__border-top--left">
                    <TitleCornerTopLeft />
                </div>
                <div 
                    className={
                        artworks.showSlideshow 
                        ? 'artwork-title__border-top--middle'
                        : size.width && size.width > 768 
                        ? "artwork-title__border-top--middle artwork-title__border-top--show" 
                        : 'artwork-title__border-top--middle'}
                />
                <div className="artwork-title__border-top--right">
                    <TitleCornerTopRight />
                </div>
            </div>
            <div className="artwork-title__border-middle">
                <div 
                    className={
                        artworks.showSlideshow
                        ? "artwork-title__border-middle--left artwork-title__border-middle-left--show"
                        : "artwork-title__border-middle--left"
                    }
                    
                />
                {currentArtwork && 
                    <div
                    className={
                        artworks.showSlideshow
                        ? "artwork-title__inside artwork-title__inside--slideshow"
                        : size.width && size.width <= 768
                        ? "artwork-title__inside artwork-title__inside--mobile"
                        : "artwork-title__inside artwork-title__inside--desktop"
                    }>
                        <h1 className="artwork-title__title">{currentArtwork.title}</h1>
                        
                        <h2 className="artwork-title__year">{new Date(currentArtwork.date).getFullYear()}</h2>
                        {currentArtwork.artworkFields.style ? (
                            <h3 className="artwork-title__medium">{currentArtwork.artworkFields.style}</h3>
                        ) : (
                            <h3 className="artwork-title__medium">{currentArtwork.artworkFields.medium}</h3> 
                        )}
                        <ArtworkSize
                            width={currentArtwork.artworkFields.width || '0'}
                            height={currentArtwork.artworkFields.height || '0'}
                            units={currentArtwork.artworkFields.units || 'metric'}
                            isImage={false}
                        />
                        <div
                            className="artwork-title__series-box"
                            style={{
                                background: getSeriesColor(currentArtwork.artworkFields?.series|| 'a-colorful-history'),
                                right: artworks.showSlideshow ? 0 : 10,
                                bottom: size.width && size.width <= 768 ? 10 : 0,
                            }}
                        />
                    </div>
                }
                <div 
                    className={
                        ! artworks.showSlideshow
                        ? "artwork-title__border-middle--right artwork-title__border-middle-right--show"
                        : "artwork-title__border-middle--right"
                    }
                />
            </div>
            <div className="artwork-title__border-bottom">
                <div className="artwork-title__border-bottom--left">
                    <TitleCornerBottomLeft />
                </div>
                <div 
                    className={
                        artworks.showSlideshow || (size.width !== undefined && size.width <= 768)
                        ? "artwork-title__border-bottom--middle artwork-title__border-bottom--show" 
                        : "artwork-title__border-bottom--middle" 
                    }
                />
                <div className="artwork-title__border-bottom--right">
                    <TitleCornerBottomRight />
                </div>
            </div>
        </div>
    )
}

export default ArtworkTitle