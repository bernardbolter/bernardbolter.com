'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Artwork } from '@/types/artworks'

interface ArtworkDetailProps {
	artwork: Artwork
}

const ArtworkDetail: React.FC<ArtworkDetailProps> = ({ artwork }) => {
    console.log(artwork)
    const [artworkDate] = useState<Date>(new Date(artwork.date))

    return (
        <figure className="artwork-detail-container">
            <p>{artwork.title}</p>
            <p>{artworkDate.getMonth()} {artworkDate.getFullYear()}</p>
        </figure>
    )
}

export default ArtworkDetail