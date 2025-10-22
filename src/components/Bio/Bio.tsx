"use client"

import { useState, useEffect, useCallback } from 'react'
import { useArtworks } from "@/providers/ArtworkProvider"
import { BiographyData, BioImageNode } from '@/types/bioTypes'
import Image from 'next/image'
import Link from 'next/link'

import CloseCircleSvg from '@/svgs/CloseCircleSvg'
import HeaderTitle from '@/components/Info/HeaderTitle'
import Loading from '@/components/Loading'

const normalizeBioImages = (bioData: BiographyData | null): BioImageNode[] => {
    if (!bioData) return [];

    const imageKeys: (keyof BiographyData)[] = [
        'bioimage1', 'bioimage2', 'bioimage3', 'bioimage4', 
        'bioimage5'
    ];

    // Filter out null images and cast to the desired BioImageNode type
    const images = imageKeys
        .map(key => bioData[key])
        .filter((img): img is BioImageNode => img !== null);
        
    return images;
};

interface LightboxState {
    isOpen: boolean;
    src: string;
    alt: string;
}

const Bio = () => {
    const [artworks] = useArtworks()
    const [bioLoading, setBioLoading] = useState<boolean>(true)
    const [bioImages, setBioImages] = useState<BioImageNode[]>([])
    const [bioContent, setBioContent] = useState<string | null>(null)

    const [lightbox, setLightbox] = useState<LightboxState>({
        isOpen: false,
        src: '',
        alt: ''
    })

    const openLightbox = useCallback((src: string, alt: string) => {
        setLightbox({ isOpen: true, src, alt})
    }, [])

    const closeLightbox = useCallback(() => {
        setLightbox({ isOpen: false, src: '', alt: '' })
    }, [])

   useEffect(() => {
        const wrapper = artworks.bioData;

        if (wrapper) {
            setBioContent(wrapper.content || null);
            const images = normalizeBioImages(wrapper.bio);
            setBioImages(images);
            setBioLoading(false);
        } else if (artworks.bioData === null && bioLoading) {
            // Keep loading if data hasn't arrived yet (initial state)
        } else {
            setBioLoading(false);
        }
    }, [artworks.bioData, bioLoading]);

    const tagline = artworks.bioData?.bio?.tagline;

    if (bioLoading) {
        return <Loading />
    }

    return (
        <div className="bio-container">
            <HeaderTitle title='BIO' />

            <Link
                href='/'
                className="bio__close-container"
            >
                <CloseCircleSvg />
                <p>close</p>
            </Link>

            <div className="bio__content-container">
                {tagline && <h2 className="bio__tagline">&quot;{tagline}&quot;</h2>}
                {bioContent && (
                    <div
                        className="bio__main-content"
                        dangerouslySetInnerHTML={{ __html: bioContent }} 
                    />
                )}
            </div>

            {bioImages.length > 0 && (
                <div className="bio__image-grid">
                    {bioImages.map((image, index) => (
                        <div
                            key={index}
                            className="bio__grid-item"
                            onClick={() => openLightbox(image.node.sourceUrl, image.node.altText || `Bio image ${index + 1}`)}
                            role="buttom"
                            tabIndex={0}
                        >
                            <Image
                                src={image.node.sourceUrl}
                                alt={image.node.altText || `Bio image ${index + 1}`}
                                // Use arbitrary large values for the square container's dimensions
                                width={600} 
                                height={600} 
                                loading={index < 3 ? 'eager' : 'lazy'}
                                // Crucial props for the square grid:
                                sizes="(max-width: 768px) 50vw, 33vw"
                                className="bio__image-square"
                            />
                        </div>
                    ))}
                </div>
            )}

            {lightbox.isOpen && (
                <div 
                    className="lightbox__overlay lightbox__overlay--open"
                    onClick={closeLightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Image Viewer: ${lightbox.alt}`}
                >
                    <button 
                        className="lightbox__close-button" 
                        onClick={closeLightbox}
                        aria-label="Close image viewer"
                    >
                        &times;
                    </button>
                    <div 
                        className="lightbox__content" 
                        // Prevent closing the modal when clicking on the content image/alt area
                        onClick={(e) => e.stopPropagation()}
                    >
                        {lightbox.src && (
                            // Container required for Next.js Image with fill property
                            <div className="lightbox__image-container">
                                <Image 
                                    src={lightbox.src} 
                                    alt={lightbox.alt} 
                                    className="lightbox__image" 
                                    // Use 'fill' to make the image size itself based on the parent container
                                    fill 
                                    // Use 'contain' to ensure the entire image is visible without cropping
                                    sizes="(max-width: 1200px) 90vw, 80vw" 
                                />
                            </div>
                        )}
                        {lightbox.alt && (
                            <div className="lightbox__alt-text">
                                {lightbox.alt}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default Bio