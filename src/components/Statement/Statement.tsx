'use client'

import { useState, useEffect } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import Link from 'next/link'

import HeaderTitle from '../Info/HeaderTitle'
import Loading from '../Loading'

import CloseCircleSvg from '@/svgs/CloseCircleSvg'

const Statement = () => {
    const [artworks] = useArtworks()
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [statementContent, setStatementContent] = useState<string>('')
    console.log(artworks.statementData)

    useEffect(() => {
        if (artworks.statementData?.content) {
            setStatementContent(artworks.statementData.content)
            setIsLoading(false)
        }
    }, [artworks.statementData])

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className="statement__container">
            <HeaderTitle title='STATE' large={true} />

            <Link
                href="/"
                className="statement__close-container"
            >
                <CloseCircleSvg />
                <p>close</p>
            </Link>

            <div 
                className="statement__content"
                dangerouslySetInnerHTML={{__html: statementContent}}    
            />
        </div>
    )
}

export default Statement