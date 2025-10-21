'use client'

import { useState } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import styles from './MenuPlusSvg.module.css'

const MenuPlusSvg = () => {
  const [artworks] = useArtworks()
  const [isHovered, setIsHovered] = useState(false)
  let navHighlight, dark

  if (typeof window !== 'undefined') {
    const computedStyles = window.getComputedStyle(document.documentElement)
    navHighlight = computedStyles.getPropertyValue('--nav-highlight').trim()
    dark = computedStyles.getPropertyValue('--dark-color').trim()
  } else {
    navHighlight = '#ffffff' // Fallback color
    dark = '#393b3e' // Fallback color
  }

  const plusPathFill = artworks.infoOpen
    ? navHighlight
    : isHovered
    ? navHighlight
    : dark

  return (
    <svg
      viewBox="0 0 66 69"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={styles.svg}
    >
      {/* Top hamburger line */}
      <path
        d="M0.664062 0H65.1247V7.16229H0.664062V0Z"
        fill={dark}
        className={artworks.infoOpen ? styles.fadeOut : styles.fadeIn}
      />
      {/* Middle hamburger line */}
      <path
        d="M0.664062 25.068H65.1247V32.2303H0.664062V25.068Z"
        fill={dark}
      />
      {/* Bottom hamburger line */}
      <path
        d="M0.664062 50.136H29.3132V57.2983H0.664062V50.136Z"
        fill={dark}
        className={artworks.infoOpen ? styles.fadeOut : styles.fadeIn}
      />
      {/* Plus symbol */}
      <path
        d="M54.3777 50.136L54.3813 39.3926H47.219L47.2154 50.136H36.4756V57.2983H47.2154L47.219 68.0417H54.3813L54.3777 57.2983H65.1247V50.136H54.3777Z"
        fill={plusPathFill}
        className={artworks.infoOpen ? styles.fadeOut : styles.fadeIn}
        style={{ transition: 'fill 0.5s ease-in-out, opacity 0.5s ease-in-out' }}
      />
      {/* Arrow line: Up-right (45 degrees) */}
      <path
        d="M0.664062 32.2303L19.3281 13.5663"
        stroke={dark}
        strokeWidth="7.16229"
        className={`${artworks.infoOpen ? styles.arrowGrow : styles.arrowShrink} ${styles.arrowUp}`}
      />
      {/* Arrow line: Down-right (45 degrees) */}
      <path
        d="M0.664062 32.2303L19.3281 50.8943"
        stroke={dark}
        strokeWidth="7.16229"
        className={`${artworks.infoOpen ? styles.arrowGrow : styles.arrowShrink} ${styles.arrowDown}`}
      />
    </svg>
  )
}

export default MenuPlusSvg