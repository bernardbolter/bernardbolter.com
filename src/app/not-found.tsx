import Info from '@/components/Info/Info'
import Image from 'next/image'
import Link from 'next/link'
import { getRandomArtwork } from '@/lib/dataService'; 
import { Artwork } from '@/types/artworkTypes';

export default async function NotFound() {
    const randomArtwork: Artwork | null = await getRandomArtwork();
    const imageNode = randomArtwork?.artworkFields?.artworkImage?.node;

    const imageUrl = randomArtwork?.artworkFields?.artworkImage?.node?.sourceUrl || ''
    const altText = randomArtwork?.title || 'Artwork not found.'
    const displayTitle = randomArtwork?.title || 'Random Artwork Title'
    const imageWidth = imageNode?.mediaDetails?.width ?? 500;
    const imageHeight = imageNode?.mediaDetails?.height ?? 500;

    return (
        <>
        <Info />
            <section className="not-found__container">
                
                <h1>This Canvas is Blank (Page Not Found)</h1>
                <p>It seems the artwork (or page) you were looking for has moved, been archived, or never existed here. Don&#39;t worry, you can still find plenty of art below.</p>
                <div className="not-found__links">
                    <Link href="/" className="not-found__button--primary">
                        Return to the Art Timeline
                    </Link>
                    <div className="not-found__line" />
                    <Link href="/bio" className="not-found__button--secondary">About the Artist</Link>
                    <Link href="/contact" className="not-found__button--secondary">Contact</Link>
                </div>
                <div className="not-found__line" />
                {randomArtwork && imageUrl && (
                <div className="not-found__artwork--container">
                    <p>While you&#39;re here, check out this piece:</p>
                    <h2>{displayTitle}</h2>
                    <Link 
                        href={`/${randomArtwork.slug}`}
                        className="not-found__artwork--link"
                    >
                        <Image 
                            src={imageUrl} 
                            alt={altText} 
                            width={imageWidth}
                            height={imageHeight}
                            style={{ objectFit: 'contain' }}
                            priority={false}
                        />
                    </Link>
                    <p className="random-art__caption">
                        Perhaps you&#39;ll find what you&#39;re looking for here?
                    </p>
                </div>
                )}
            </section>
        </>
    )
}