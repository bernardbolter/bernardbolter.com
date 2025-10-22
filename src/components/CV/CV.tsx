"use client"

import {useState, useEffect, JSX } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider'
import Link from 'next/link'

import Loading from '../Loading'

import { groupCvNodesBySection } from '@/helpers/cv'

import HeaderTitle from '../Info/HeaderTitle'

import CloseCircleSvg from '@/svgs/CloseCircleSvg'

// Define the type for a single CV Node
interface CvNode {
    __typename: string;
    city: string | null;
    gallery: string | null;
    role: string | null;
    school: string | null;
    section: string[];
    title: string | null;
    year: number | null;
}

// Define the type for the grouped/formatted CV data
interface GroupedCvNodes {
    [section: string]: CvNode[]; 
}

const CV = () => {
    const [artworks] = useArtworks()
    // console.log(artworks.cvData)

    const [formattedCV, setFormattedCV] = useState<GroupedCvNodes>({})
    const [buttonHovered, setButtonHovered] = useState<boolean>(false)

    const handlePrint = () => {
        window.print();
    };
        
    useEffect(() => {
        const cvNodesArray = artworks.cvData as CvNode[] | undefined;

        if (Array.isArray(cvNodesArray) && cvNodesArray.length > 0) {
            const newCvData: GroupedCvNodes = groupCvNodesBySection(cvNodesArray)
            setFormattedCV(newCvData)
        }
    }, [artworks.cvData])

    // Helper to render a section, ensuring unique keys and handling potential missing data
    // The key now includes sectionKey, item title, and index
    const renderSection = (
        sectionKey: keyof GroupedCvNodes, 
        title: string, 
        renderEntry: (item: CvNode, uniqueKey: string) => JSX.Element
    ) => {
        const entries = formattedCV[sectionKey];
        if (!entries || entries.length === 0) {
            return null; 
        }

        return (
            <>
                <h1 className="cv__header">{title}</h1>
                {entries.map((item, index) => {
                    // 🔑 Create a unique key by combining section, title, and index
                    const uniqueKey = `${sectionKey}-${item.title}-${index}`; 
                    return renderEntry(item, uniqueKey);
                })}
            </>
        );
    }

    const isLoading = Object.keys(formattedCV).length === 0;

    return (
        <div className="cv__container">
            {isLoading
            ? (
                <Loading />
            ): (
                <>
                    <HeaderTitle title='CV' />

                    <Link
                        href='/'
                        className="cv__close-container"
                    >
                        <CloseCircleSvg />
                        <p>close</p>
                    </Link>

                    <button 
                        onClick={handlePrint} 
                        className="cv__print-button"
                        aria-label="Print Curriculum Vitae (A4 Format)"
                        onMouseEnter={() => setButtonHovered(true)}
                        onMouseLeave={() => setButtonHovered(false)}
                        style={{
                            background: buttonHovered ? '#999' : '#ededed',
                            color: buttonHovered ? '#ededed' : '#222'
                        }}
                    >
                        Print CV
                    </button>
                    <div className="cv__content">
                        {/* Render SOLO */}
                        {renderSection('SOLO', 'SOLO', (solo, key) => (
                            <div className="cv__entry" key={key}> 
                                <h2>{solo.year}</h2>
                                <h3>{solo.gallery}</h3>
                                <h4>&apos;{solo.title}&apos;</h4>
                                <h5>- {solo.city}</h5>
                            </div>
                        ))}

                        {/* Render GROUP */}
                        {renderSection('GROUP', 'GROUP', (group, key) => (
                            <div className="cv__entry" key={key}>
                                <h2>{group.year}</h2>
                                <h3>{group.gallery}</h3>
                                <h4>&apos;{group.title}&apos;</h4>
                                <h5>- {group.city}</h5>
                            </div>
                        ))}
                        
                        {/* Render PERFORMANCE */}
                        {renderSection('PERFORMANCE', 'PERFORMANCE', (performance, key) => (
                            <div className="cv__entry" key={key}>
                                <h2>{performance.year}</h2>
                                <h3>{performance.gallery}</h3>
                                <h4>&apos;{performance.title}&apos;</h4>
                                <h5>- {performance.city}</h5>
                            </div>
                        ))}

                        {/* Render EDUCATION */}
                        {renderSection('EDUCATION', 'EDUCATION', (edu, key) => (
                            <div className="cv__entry" key={key}>
                                <h2>{edu.year}</h2>
                                <h3>{edu.school}</h3>
                                <h4>&apos;{edu.title}&apos;</h4>
                                <h5>- {edu.city}</h5>
                            </div>
                        ))}
                        
                        {/* Render PUBLICATIONS */}
                        {renderSection('PUBLICATIONS', 'PUBLICATIONS', (pubs, key) => (
                            <div className="cv__entry" key={key}>
                                <h2>{pubs.year}</h2>
                                <h3>{pubs.title}</h3>
                                <h4>{pubs.role}</h4>
                            </div>
                        ))}

                        {/* Render ORGANIZATIONS */}
                        {renderSection('ORGANIZATIONS', 'ORGANIZATIONS', (orgs, key) => (
                            <div className="cv__entry" key={key}>
                                <h2>{orgs.year}</h2>
                                <h3>{orgs.title}</h3>
                                <h4>{orgs.role}</h4>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default CV