'use client'

import { useState, useEffect, useContext } from 'react'
import { ArtworksContext } from '@/providers/ArtworkProvider'
import useWindowSize from '@/hooks/useWindowSize'

import { convertUnits } from '@/helpers/sizeConversion'

import { TimelineResult } from '@/types/timline'

import TitleCornerTopLeft from '@/svgs/TitleCornerTopLeft'
import TitleCornerTopRight from '@/svgs/TitleCornerTopRight'
import TitleCornerBottomLeft from '@/svgs/TitleCornerBottomLeft'
import TitleCornerBottomRight from '@/svgs/TitleCornerBottomRight'

const ArtworkTitle = ({formattedArtworks}: { formattedArtworks: TimelineResult}) => {
    const [artworks] = useContext(ArtworksContext)
    const [convertedWidth, setConvertedWidth] = useState('')
    const [convertedHeight, setConvertedHeight] = useState('')
    const size = useWindowSize()
    console.log(formattedArtworks.artworksArray[artworks.currentArtworkIndex])

    useEffect(() => {
        if (formattedArtworks.artworksArray.length > 0) {
             setConvertedWidth(convertUnits(formattedArtworks.artworksArray[artworks.currentArtworkIndex].artworkFields.width).value)
             setConvertedHeight(convertUnits(formattedArtworks.artworksArray[artworks.currentArtworkIndex].artworkFields.height).value)
        }
       
    }, [formattedArtworks.artworksArray, artworks.currentArtworkIndex])

    return (
        <div 
            className={
                artworks.showSlideshow
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
                    className={size.width && size.width > 768 ? "artwork-title__border-top--middle artwork-title__border-top--show" : 'artwork-title__border-top--middle'}
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
                {formattedArtworks.artworksArray.length > 0  && 
                    <div
                    className={
                        artworks.showSlideshow
                        ? "artwork-title__inside artwork-title__inside--slideshow"
                        : size.width && size.width <= 768
                        ? "artwork-title__inside artwork-title__inside--mobile"
                        : "artwork-title__inside artwork-title__inside--desktop"
                    }>
                        <h1 className="artwork-title__title">{formattedArtworks.artworksArray[artworks.currentArtworkIndex].title}</h1>
                        
                        <h2 className="artwork-title__year">{new Date(formattedArtworks.artworksArray[artworks.currentArtworkIndex].date).getFullYear()}</h2>
                        {formattedArtworks.artworksArray[artworks.currentArtworkIndex].artworkFields.style ? (
                            <h3 className="artwork-title__medium">{formattedArtworks.artworksArray[artworks.currentArtworkIndex].artworkFields.style}</h3>
                        ) : (
                            <h3 className="artwork-title__medium">{formattedArtworks.artworksArray[artworks.currentArtworkIndex].artworkFields.medium}</h3> 
                        )}
                        <h4 className="artwork-title__size">{formattedArtworks.artworksArray[artworks.currentArtworkIndex].artworkFields.width} x {formattedArtworks.artworksArray[artworks.currentArtworkIndex].artworkFields.height}</h4>
                        <h5 className="artwork-title__size--converted">({convertedWidth} X {convertedHeight})</h5>
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