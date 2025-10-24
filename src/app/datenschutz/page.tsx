'use client'

import { useState, useEffect } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import Link from 'next/link'
import Loading from '@/components/Loading'
import CloseCircleSvg from '@/svgs/CloseCircleSvg'

const Datenschutz = () => {
    const [artworks] = useArtworks()
    const [datenLoading, setDatenLoading] = useState<boolean>(true)
    const [datenData, setDatenData] = useState<string>('')

    console.log(artworks.datenschutzData)

    useEffect(() => {
        if (artworks.datenschutzData?.content) {
            setDatenData(artworks.datenschutzData.content)
            setDatenLoading(false)
        }
    }, [artworks.datenschutzData])

    if (datenLoading) return <Loading />

    return (
        <div className="datenschutz__container">
            <Link
                className="datenschutz__close"
                href="/contact"
            >
                <CloseCircleSvg />
            </Link>
            <div
                className="datenschutz__content"
                dangerouslySetInnerHTML={{__html: datenData}}
            />
        </div>
    )
}

export default Datenschutz