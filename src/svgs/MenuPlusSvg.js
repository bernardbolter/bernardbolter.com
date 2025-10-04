'use client'

import { useState } from'react'
import { useArtworks } from '@/providers/ArtworkProvider'

const MenuPlusSvg = () => {
    const [artworks] = useArtworks()
    const [isHovered, setIsHovered] = useState(false)
    let styles, navHighlight 
    let dark = '#393b3e'

    if (typeof window !== "undefined") {
        styles = window.getComputedStyle(document.documentElement)
        navHighlight = styles.getPropertyValue('--nav-highlight')
        dark = styles.getPropertyValue('--dark-color')
    }

    const plusPathFill = artworks.infoOpen 
        ? navHighlight 
        : (isHovered ? navHighlight : dark)

    return (
        <svg 
            viewBox="0 0 66 69"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ cursor: 'pointer' }}
        >
            <path 
                d="M29.3132 50.136V57.2983H0.664062V50.136H29.3132ZM65.1247 25.068V32.2303H0.664062V25.068H65.1247ZM65.1247 0V7.16229H0.664062V0H65.1247Z" 
                fill={dark}
            />
            <path 
                d="M54.3777 50.136L54.3813 39.3926H47.219L47.2154 50.136H36.4756V57.2983H47.2154L47.219 68.0417H54.3813L54.3777 57.2983H65.1247V50.136H54.3777Z" 
                fill={plusPathFill}
                style={{
                    transition: 'fill .5s ease-in-out'
                }}
            />
        </svg>
    )
}

export default MenuPlusSvg
