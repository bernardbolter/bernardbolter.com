'use client'

import { useContext } from'react';
import { ArtworksContext } from '@/providers/ArtworkProvider';

const MenuPlusSvg = () => {
    const [artworks] = useContext(ArtworksContext);
    let styles;
    if (typeof window !== "undefined") {
        styles = window.getComputedStyle(document.documentElement);
    }
    
    const navHighlight = styles.getPropertyValue('--nav-highlight');
    const dark = styles.getPropertyValue('--dark-color');

    return (
        <svg  viewBox="0 0 66 69">
            <path 
                d="M29.3132 50.136V57.2983H0.664062V50.136H29.3132ZM65.1247 25.068V32.2303H0.664062V25.068H65.1247ZM65.1247 0V7.16229H0.664062V0H65.1247Z" 
                fill={dark}
            />
            <path 
                d="M54.3777 50.136L54.3813 39.3926H47.219L47.2154 50.136H36.4756V57.2983H47.2154L47.219 68.0417H54.3813L54.3777 57.2983H65.1247V50.136H54.3777Z" 
                fill={artworks.infoOpen ? navHighlight : dark}
                style={{
                    transition: 'fill .5s ease-in-out'
                }}
            />
        </svg>
    )
}

export default MenuPlusSvg
