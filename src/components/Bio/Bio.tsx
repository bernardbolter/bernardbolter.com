"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useArtworks } from "@/providers/ArtworkProvider";
import { BiographyData, BioImageNode } from '@/types/bioTypes';
import Image from 'next/image';
import Link from 'next/link';

import CloseCircleSvg from '@/svgs/CloseCircleSvg';
import HeaderTitle from '@/components/Info/HeaderTitle';
import Loading from '@/components/Loading';
import LeftArrowSvg from '@/svgs/LeftArrowSvg';
import ArtworkPauseSvg from '@/svgs/ArtworkPauseSvg';
import ArtworkTimerSvg from '@/svgs/ArtworkTimerSvg';

/* ==============================================================
   NORMALIZE BIO IMAGES – extracts non-null images from bio object
   ============================================================== */
const normalizeBioImages = (bioData: BiographyData | null): BioImageNode[] => {
  if (!bioData) return [];

  const imageKeys: (keyof BiographyData)[] = [
    'bioimage1', 'bioimage2', 'bioimage3', 'bioimage4',
    'bioimage5', 'bioimage6', 'bioimage7', 'bioimage8',
    'bioimage9', 'bioimage10'
  ];

  return imageKeys
    .map(key => bioData[key])
    .filter((img): img is BioImageNode => img !== null);
};

interface LightboxState {
  isOpen: boolean;
  currentIndex: number;
}

const Bio = () => {
  const [artworks] = useArtworks();
  const [bioLoading, setBioLoading] = useState<boolean>(true);
  const [bioImages, setBioImages] = useState<BioImageNode[]>([]);
  const [bioContent, setBioContent] = useState<string | null>(null);
  const [masonrySpans, setMasonrySpans] = useState<{ colSpan: number; rowSpan: number }[]>([]);

  const masonryRef = useRef<HTMLDivElement>(null);

  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    currentIndex: 0
  });

  const [lightboxPlaying, setLightboxPlaying] = useState<boolean>(true);
  const [timerProgress, setTimerProgress] = useState<number>(0);

  const openLightbox = useCallback((index: number) => {
    setLightbox({ isOpen: true, currentIndex: index });
    setLightboxPlaying(true);
    setTimerProgress(0);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightbox({ isOpen: false, currentIndex: 0 });
    setLightboxPlaying(false);
    setTimerProgress(0);
  }, []);

  const handleNextImage = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === bioImages.length - 1 ? 0 : prev.currentIndex + 1
    }));
    setTimerProgress(0);
  }, [bioImages.length]);

  const handlePrevImage = useCallback(() => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? bioImages.length - 1 : prev.currentIndex - 1
    }));
    setTimerProgress(0);
  }, [bioImages.length]);

  // Timer for auto-advance in lightbox
  useEffect(() => {
    if (!lightbox.isOpen || !lightboxPlaying || bioImages.length <= 1) {
      setTimerProgress(0);
      return;
    }

    const INTERVAL = 4000;
    const UPDATE_FREQUENCY = 50;
    const INCREMENT = (100 / INTERVAL) * UPDATE_FREQUENCY;

    let progress = 0;
    
    const progressInterval = setInterval(() => {
      progress += INCREMENT;
      if (progress >= 100) {
        progress = 0;
        handleNextImage();
      }
      setTimerProgress(progress);
    }, UPDATE_FREQUENCY);

    return () => {
      clearInterval(progressInterval);
      setTimerProgress(0);
    };
  }, [lightbox.isOpen, lightboxPlaying, bioImages.length, handleNextImage]);

  /* --------------------------------------------------------------
     CALCULATE SPANS – uses **real column width from DOM**
     -------------------------------------------------------------- */
  const calculateMasonrySpans = useCallback((images: BioImageNode[]) => {
    if (!masonryRef.current || images.length === 0) return;

    const grid = masonryRef.current;
    const gridComputedStyle = window.getComputedStyle(grid);
    const gridWidth = grid.clientWidth;
    const gap = parseFloat(gridComputedStyle.gap) || 7;
    const gridAutoRows = gridComputedStyle.gridAutoRows;
    
    const rowHeight = parseFloat(gridAutoRows) || 7;
    const columnCount = gridComputedStyle.gridTemplateColumns.split(' ').length;
    const totalGapWidth = gap * (columnCount - 1);
    const columnWidth = (gridWidth - totalGapWidth) / columnCount;

    const spans = images.map((image) => {
      const w = image.node.mediaDetails?.width;
      const h = image.node.mediaDetails?.height;

      if (!w || !h) {
        console.warn('Missing dimensions', image.node.sourceUrl);
        return { colSpan: 1, rowSpan: 40 };
      }

      const aspect = w / h;

      let colSpan = 1;
      if (columnCount >= 3) {
        if (aspect > 2.0) colSpan = 3;
        else if (aspect > 1.4) colSpan = 2;
      } else if (columnCount === 2) {
        if (aspect > 1.5) colSpan = 2;
      }

      const imageWidth = (columnWidth * colSpan) + (gap * (colSpan - 1));
      const imageHeight = imageWidth / aspect;
      const rowSpan = Math.ceil((imageHeight + gap) / (rowHeight + gap));

      return { colSpan, rowSpan };
    });

    setMasonrySpans(spans);
  }, []);

  /* --------------------------------------------------------------
     RECALCULATE ON RESIZE
     -------------------------------------------------------------- */
  useEffect(() => {
    if (bioImages.length === 0) return;

    const handleResize = () => {
      calculateMasonrySpans(bioImages);
    };

    const timer = setTimeout(() => {
      calculateMasonrySpans(bioImages);
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [bioImages, calculateMasonrySpans]);

  /* --------------------------------------------------------------
     LOAD BIO DATA
     -------------------------------------------------------------- */
  useEffect(() => {
    const wrapper = artworks.bioData;

    if (wrapper) {
      setBioContent(wrapper.content || null);
      const images = normalizeBioImages(wrapper.bio);
      setBioImages(images);
      setBioLoading(false);
    } else if (artworks.bioData === null && bioLoading) {
      // still waiting
    } else {
      setBioLoading(false);
    }
  }, [artworks.bioData, bioLoading]);

  const tagline = artworks.bioData?.bio?.tagline;

  if (bioLoading) return <Loading />;

  const currentLightboxImage = bioImages[lightbox.currentIndex];

  return (
    <div className="bio-container">
      <HeaderTitle title="BIO" large={false} />

      <Link href="/" className="bio__close-container">
        <CloseCircleSvg />
        <p>close</p>
      </Link>

      <div className="bio__content-container">
        {tagline && <h2 className="bio__tagline">{tagline}</h2>}
        {bioContent && (
          <div
            className="bio__main-content"
            dangerouslySetInnerHTML={{ __html: bioContent }}
          />
        )}
      </div>

      {/* ---------- CSS GRID MASONRY ---------- */}
      {bioImages.length > 0 && (
        <div ref={masonryRef} className="bio__masonry-grid">
          {bioImages.map((image, idx) => {
            const spans = masonrySpans[idx] || { colSpan: 1, rowSpan: 40 };
            const { colSpan, rowSpan } = spans;

            return (
              <div
                key={idx}
                className="bio__masonry-item"
                style={{
                  gridColumn: `span ${colSpan}`,
                  gridRow: `span ${rowSpan}`,
                }}
                onClick={() => openLightbox(idx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(idx);
                  }
                }}
              >
                <Image
                  src={image.node.sourceUrl}
                  alt={image.node.altText || `Bio image ${idx + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width:549px) 100vw, (max-width:978px) 50vw, 33vw"
                  className="bio__image-masonry"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- LIGHTBOX ---------- */}
      {lightbox.isOpen && currentLightboxImage && (
        <div
          className={`lightbox__overlay ${lightbox.isOpen ? 'lightbox__overlay--open' : ''}`}
          onClick={closeLightbox}
        >
          <div 
            className="lightbox__content" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lightbox__image-wrapper">
              <Image
                src={currentLightboxImage.node.sourceUrl}
                alt={currentLightboxImage.node.altText || `Bio image ${lightbox.currentIndex + 1}`}
                width={currentLightboxImage.node.mediaDetails?.width || 1200}
                height={currentLightboxImage.node.mediaDetails?.height || 800}
                style={{ 
                  objectFit: 'contain',
                  width: '100%',
                  height: 'auto',
                  maxHeight: '85vh'
                }}
                quality={95}
                priority
              />
            </div>

            {currentLightboxImage.node.altText && (
              <div className="lightbox__alt-text">
                {currentLightboxImage.node.altText}
              </div>
            )}
          </div>

          {/* Navigation controls */}
          {bioImages.length > 1 && (
            <div className="lightbox__controls">
                <div 
                    className="lightbox__close"
                    onClick={closeLightbox}    
                >
                    <CloseCircleSvg />
                </div>
              <div className="lightbox__counter">
                <p>{lightbox.currentIndex + 1} / {bioImages.length}</p>
              </div>
              <div 
                className="lightbox__nav-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                aria-label="Previous Image"
              >
                <LeftArrowSvg isRight={false} />
              </div>
              <div 
                className="lightbox__nav-button lightbox__nav-button--next" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                aria-label="Next Image"
              >
                <LeftArrowSvg isRight={true} />
              </div>
              <div 
                className="lightbox__nav-button"
                onClick={(e) => e.stopPropagation()}
              >
                <ArtworkPauseSvg 
                  artworkPlaying={lightboxPlaying}
                  setArtworkPlaying={setLightboxPlaying}
                />
              </div>
              <div className="lightbox__nav-button lightbox__nav-button--timer">
                <ArtworkTimerSvg progress={timerProgress} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Bio;