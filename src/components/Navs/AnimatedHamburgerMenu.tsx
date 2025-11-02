'use client'

import { useArtworks } from "@/providers/ArtworkProvider"

const AnimatedHamburgerMenu = () => {
  const [artworks] = useArtworks()

  return (
    <div className={`menu-link ${artworks.infoOpen ? 'menu-trigger-open' : ''}`}>
        <span className="lines"></span>
        <div className="plus-symbol"></div>
    </div>
  );
};

export default AnimatedHamburgerMenu