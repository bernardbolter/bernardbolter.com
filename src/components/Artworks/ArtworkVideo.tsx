// ArtworkVideo.tsx
'use client'

import React, { useMemo } from 'react'
import ReactPlayer from 'react-player'
import useWindowSize from '@/hooks/useWindowSize'

import Info from '../Info/Info'

import { Artwork } from '@/types/artworkTypes'

import YoutTubePlainSvg from '@/svgs/YoutubePlainSvg'

interface ArtworkVideoProps {
    artwork: Artwork,
    containerWidth: number,
    containerHeight: number,
}

const calculateVideoDisplayDimensions = (
    videoWidth: number, 
    videoHeight: number, 
    containerWidth: number, 
    containerHeight: number
) => {
    if (videoWidth === 0 || videoHeight === 0) {
        const fallbackRatio = 16 / 9;
        let scaledWidth = containerWidth;
        let scaledHeight = scaledWidth / fallbackRatio;

        if (scaledHeight > containerHeight) {
            scaledHeight = containerHeight;
            scaledWidth = scaledHeight * fallbackRatio;
        }
        return { 
            displayWidth: Math.round(scaledWidth), 
            displayHeight: Math.round(scaledHeight) 
        };
    }

    const aspectRatio = videoWidth / videoHeight;
    
    // --- 1. Calculate Maximum Size to Fit Container ---
    let scaledWidth = containerWidth;
    let scaledHeight = scaledWidth / aspectRatio;

    // If scaled height overflows the container height, adjust based on height
    if (scaledHeight > containerHeight) {
        scaledHeight = containerHeight;
        scaledWidth = scaledHeight * aspectRatio;
    }
    
    // --- 2. Clamp Size to Intrinsic Video Resolution ---
    // Clamping isn't usually necessary for YouTube, but kept for logic consistency
    if (scaledWidth > videoWidth) {
        scaledWidth = videoWidth;
        scaledHeight = videoHeight; 
    }

    return { 
        displayWidth: Math.round(scaledWidth), 
        displayHeight: Math.round(scaledHeight) 
    };
}


const ArtworkVideo: React.FC<ArtworkVideoProps> = ({ 
    artwork
}) => {
    const size = useWindowSize()
    const fields = artwork.artworkFields
    console.log(artwork)
    
    const videoSource = fields?.videoYouttubeLink || null
    const posterNode = fields?.videoPoster?.node
    const intrinsicWidth = posterNode?.mediaDetails?.width || 0
    const intrinsicHeight = posterNode?.mediaDetails?.height || 0
    const containerWidth = (size.width || 0) * .9
    const containerHeight = (size.height || 0) * .9

    
    // --- 3. Calculate Display Dimensions ---
    const { displayWidth, displayHeight } = useMemo(() => {
        return calculateVideoDisplayDimensions(
            intrinsicWidth, 
            intrinsicHeight, 
            containerWidth, 
            containerHeight
        );
    }, [intrinsicWidth, intrinsicHeight, containerWidth, containerHeight]);

    const topMargin = useMemo(() => {
        if (size.height) {
            return (size.height - displayHeight) / 2
        } else {
            return 100
        }
    }, [size.height, displayHeight])
    
    if (!videoSource) {
        return null 
    }

    return (
        <>
            <Info />
            <div className="artwork-video__youtube-link">
                <p>visit the channel</p>
                <div className="artwork-video__youtube-svg">
                    <YoutTubePlainSvg />
                </div>
            </div>     
            <div 
                className="artwork-video__container"
                style={{ 
                    width: size.width,
                    marginTop: topMargin
                }}
            >
                <div 
                    className="artwork-video__player-wrapper"
                    style={{
                        width: displayWidth,
                        height: displayHeight,
                        position: 'relative', 
                        overflow: 'hidden'
                    }}
                >
                    <ReactPlayer
                        src="https://youtu.be/FFw_jIrXbgk?si=p6cpu5HagjoNlZCc"
                        width='100%'
                        height='100%'
                        controls={true}
                        config={{
                            youtube: {
                                color: 'white'
                            }
                        }}
                    />
                </div>
                <div className="artwork-video__info-container">
                    <h2 className="artwork-grid__info--title">{artwork.title} <span>| {fields.year}</span></h2>
                    {artwork.content && (
                        <div 
                            className="artwork-video__info-content"
                            dangerouslySetInnerHTML={{ __html: artwork.content }} 
                        />
                    )}
                </div>
            </div>
        </>
    )
}

export default ArtworkVideo