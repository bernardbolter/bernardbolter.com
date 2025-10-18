import { useEffect, useState } from "react"
import { useArtworks } from "@/providers/ArtworkProvider"
import useWindowSize from "@/hooks/useWindowSize"

const TitleCornerBottomLeft = () => {
    const [artworks] = useArtworks()
    const size = useWindowSize()
    const [viewState, setViewState] = useState('desktop')
    const [titleDark, setTitleDark] = useState<string>('#999')

    useEffect(() => {
        if (typeof window !== 'undefined' && document.documentElement) {
            const computedColor = getComputedStyle(document.documentElement)
                .getPropertyValue('--title-dark').trim();
            if (computedColor) {
                 setTitleDark(computedColor);
            }
        }
    }, [])

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
            {viewState === 'desktop' && <polygon points="0,0 10,10 10,0" />}
            {viewState === 'mobile'  && <polygon points="0,0 10,0, 10,10" />}
            {viewState === 'slideshow' && <polygon points="0,0 10,0 10,10 0,10" />}

            {viewState === 'mobile' && <line x1="0" y1="0" x2="10" y2="0" stroke={titleDark} strokeWidth="2" />}
            {viewState === 'mobile' && <line x1="0" y1="0" x2="10" y2="10" stroke={titleDark} strokeWidth="1" />}
            {viewState === 'slideshow' && <line x1="10" y1="0" x2="0" y2="10" stroke={titleDark} strokeWidth="1" />}
        </svg>
    )
}

export default TitleCornerBottomLeft