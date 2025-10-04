import { useEffect, useState } from "react";
import { useArtworks } from "@/providers/ArtworkProvider";
import useWindowSize from "@/hooks/useWindowSize";


const TitleCornerBottomRight = () => {
    const [artworks] = useArtworks()
    const size = useWindowSize()
    const [viewState, setViewState] = useState('desktop')

    const titleDark = getComputedStyle(document.documentElement)
    .getPropertyValue('--title-dark').trim()
    const titleShadow = getComputedStyle(document.documentElement)
    .getPropertyValue('--title-shadow').trim()

    useEffect(() => {
        if (artworks.showSlideshow) {
            setViewState('slideshow')
        } else if (size.width && size.width < 768) {
            setViewState('mobile')
        } else {
            setViewState('desktop')
        }
    }, [size, artworks.showSlideshow])


    return (
        <svg width="10" height="10">
            {viewState === 'desktop' && <polygon points="0,10 0,0 10,0" fill={titleShadow} />}
            {viewState === 'mobile'  && <polygon points="0,0 10,0, 10,10 0,10" />}
            {viewState === 'mobile'  && <polygon points="0,0 10,0, 10,10" fill={titleShadow} />}
            {viewState === 'slideshow' && <polygon points="0,0 10,0 0,10" />}

            {viewState === 'desktop' && <line x1="0" y1="0" x2="o" y2="10" stroke={titleDark} strokeWidth="1" />}
            {viewState === 'desktop' && <line x1="0" y1="10" x2="10" y2="0" stroke={titleDark} strokeWidth="1" />}
            {viewState === 'mobile' && <line x1="0" y1="0" x2="10" y2="10" stroke={titleDark} strokeWidth="1" />}
            {viewState === 'slideshow' && <line x1="0" y1="0" x2="10" y2="0" stroke={titleDark} strokeWidth="2" />}
        </svg>
    )
}

export default TitleCornerBottomRight