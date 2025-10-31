// app/components/ArtworkVideo.tsx
'use client';

import React, { useMemo, useEffect, useState } from 'react';
import useWindowSize from '@/hooks/useWindowSize';
import Info from '../Info/Info';
import { Artwork } from '@/types/artworkTypes';
import YoutTubePlainSvg from '@/svgs/YoutubePlainSvg';

// ────────────────────── TYPE DECLARATIONS ──────────────────────
interface WindowWithKlaro extends Window {
  klaro?: {
    show?: () => void;
    getManager?: () => any;
  };
  klaroConfig?: any;
}
declare const window: WindowWithKlaro;

// ────────────────────── COOKIE HELPER ──────────────────────
const getKlaroConsent = (): Record<string, boolean> => {
  try {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('klaro='));
    if (!cookie) return {};
    const json = decodeURIComponent(cookie.split('=')[1]);
    return JSON.parse(json);
  } catch {
    return {};
  }
};

// ────────────────────── HELPER ──────────────────────
const calculateVideoDisplayDimensions = (
  videoWidth: number,
  videoHeight: number,
  containerWidth: number,
  containerHeight: number
): { displayWidth: number; displayHeight: number } => {
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
      displayHeight: Math.round(scaledHeight),
    };
  }

  const aspectRatio = videoWidth / videoHeight;
  let scaledWidth = containerWidth;
  let scaledHeight = scaledWidth / aspectRatio;

  if (scaledHeight > containerHeight) {
    scaledHeight = containerHeight;
    scaledWidth = scaledHeight * aspectRatio;
  }

  if (scaledWidth > videoWidth) {
    scaledWidth = videoWidth;
    scaledHeight = videoHeight;
  }

  return {
    displayWidth: Math.round(scaledWidth),
    displayHeight: Math.round(scaledHeight),
  };
};

// ────────────────────── COMPONENT ──────────────────────
const ArtworkVideo: React.FC<{ artwork: Artwork }> = ({ artwork }) => {
  const size = useWindowSize();
  const fields = artwork.artworkFields;
  const videoSource = fields?.videoYouttubeLink || null;
  const posterNode = fields?.videoPoster?.node;
  const intrinsicWidth = posterNode?.mediaDetails?.width || 0;
  const intrinsicHeight = posterNode?.mediaDetails?.height || 0;
  const containerWidth = (size.width || 0) * 0.9;
  const containerHeight = (size.height || 0) * 0.9;

  const { displayWidth, displayHeight } = useMemo(() => {
    return calculateVideoDisplayDimensions(
      intrinsicWidth,
      intrinsicHeight,
      containerWidth,
      containerHeight
    );
  }, [intrinsicWidth, intrinsicHeight, containerWidth, containerHeight]);

  const topMargin = useMemo(() => {
    return size.height ? (size.height - displayHeight) / 2 : 100;
  }, [size.height, displayHeight]);

  const [consentGiven, setConsentGiven] = useState(false);
  const [klaroReady, setKlaroReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkConsent = () => {
      const consents = getKlaroConsent();
      if (consents.youtube === true) {
        setConsentGiven(true);
        return;
      }

      if (window.klaro?.getManager) {
        try {
          const manager = window.klaro.getManager();
          const consent = manager.getConsent('youtube');
          setConsentGiven(!!consent);
        } catch (e) {
          console.error('[Klaro] API error:', e);
        }
      }
    };

    const checkKlaroReady = () => {
      // Check multiple possible ways Klaro exposes the show function
      const isReady = !!(
        window.klaro?.show ||
        window.klaro?.getManager ||
        window.klaroConfig?.manager?.show
      );
      setKlaroReady(isReady);
    };

    checkConsent();
    checkKlaroReady();

    const handler = () => {
      checkConsent();
      checkKlaroReady();
    };
    document.addEventListener('klaro', handler);

    const interval = setInterval(() => {
      checkConsent();
      checkKlaroReady();
    }, 300);

    return () => {
      document.removeEventListener('klaro', handler);
      clearInterval(interval);
    };
  }, []);

  const youtubeId = videoSource
    ? videoSource.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([^?&"'>]+)/)?.[1]
    : null;

  if (!videoSource || !youtubeId) return null;

  const openPrivacySettings = () => {
    console.log('[Klaro] Attempting to open modal...');
    
    // Try multiple methods to open the modal
    if (window.klaro?.show) {
      console.log('[Klaro] Using window.klaro.show()');
      window.klaro.show();
    } else if (window.klaro?.getManager) {
      try {
        console.log('[Klaro] Using window.klaro.getManager().show()');
        const manager = window.klaro.getManager();
        if (manager?.show) {
          manager.show();
        }
      } catch (e) {
        console.error('[Klaro] Manager show error:', e);
      }
    } else if (window.klaroConfig?.manager?.show) {
      console.log('[Klaro] Using window.klaroConfig.manager.show()');
      window.klaroConfig.manager.show();
    } else {
      console.error('[Klaro] No method available to show modal');
    }
  };

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
          marginTop: topMargin,
        }}
      >
        <div
          className="artwork-video__player-wrapper"
          style={{
            width: displayWidth,
            height: displayHeight,
            position: 'relative',
            overflow: 'hidden',
            background: '#000',
            borderRadius: '12px',
          }}
        >
          {consentGiven ? (
            <iframe
              data-name="youtube"
              src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=0&rel=0`}
              title={artwork.title}
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: '#111',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <div className="artwork-video__youtube--play">
                <YoutTubePlainSvg />
              </div>
              <p style={{ margin: '1rem 0 0', fontSize: '1.1rem' }}>
                Enable videos in privacy settings to watch
              </p>
              <button
                onClick={openPrivacySettings}
                disabled={!klaroReady}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  background: klaroReady ? '#10b981' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: klaroReady ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                  opacity: klaroReady ? 1 : 0.7,
                }}
                onMouseOver={(e) => {
                  if (klaroReady) e.currentTarget.style.background = '#059669';
                }}
                onMouseOut={(e) => {
                  if (klaroReady) e.currentTarget.style.background = '#10b981';
                }}
              >
                {klaroReady ? 'Manage Privacy Settings' : 'Loading...'}
              </button>
            </div>
          )}
        </div>

        <div className="artwork-video__info-container">
          <h2 className="artwork-grid__info--title">
            {artwork.title} <span>| {fields.year}</span>
          </h2>
          {artwork.content && (
            <div
              className="artwork-video__info-content"
              dangerouslySetInnerHTML={{ __html: artwork.content }}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ArtworkVideo;