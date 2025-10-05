"use client"

import {useState, useEffect, JSX } from 'react'
import { useArtworks } from '@/providers/ArtworkProvider';
import { groupCvNodesBySection } from '@/helpers/cv'

// Define the type for a single CV Node
interface CvNode {
    __typename: string;
    city: string | null;
    gallery: string | null;
    role: string | null;
    school: string | null;
    section: string;
    title: string | null;
    year: number | null;
}

// Define the type for the grouped/formatted CV data
interface GroupedCvNodes {
    [section: string]: CvNode[]; 
}

const CV = () => {
    const [artworks] = useArtworks()
    console.log(artworks.cvData)

    const [formattedCV, setFormattedCV] = useState<GroupedCvNodes>({})
        
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
                <h1>{title}</h1>
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
                <p>Loading CV</p>
            ): (
                <>
                    <h1>Solo</h1>
                    {/* Render SOLO */}
                    {renderSection('SOLO', 'SOLO', (solo, key) => (
                        <div className="cv-entry" key={key}> 
                            <h4>{solo.year}</h4>
                            <h3>{solo.gallery}</h3>
                            <h2>&apos;{solo.title}&apos;</h2>
                            <h5>- {solo.city}</h5>
                        </div>
                    ))}

                    <h1>Group</h1>
                    {/* Render GROUP */}
                    {renderSection('GROUP', 'GROUP', (group, key) => (
                        <div className="cv-entry" key={key}>
                            <h4>{group.year}</h4>
                            <h3>{group.gallery}</h3>
                            <h2>&apos;{group.title}&apos;</h2>
                            <h5>- {group.city}</h5>
                        </div>
                    ))}
                    
                    {/* Render PERFORMANCE */}
                    {renderSection('PERFORMANCE', 'PERFORMANCE', (performance, key) => (
                        <div className="cv-entry" key={key}>
                            <h4>{performance.year}</h4>
                            <h3>{performance.gallery}</h3>
                            <h2>&apos;{performance.title}&apos;</h2>
                            <h5>- {performance.city}</h5>
                        </div>
                    ))}

                    {/* Render EDUCATION */}
                    {renderSection('EDUCATION', 'EDUCATION', (edu, key) => (
                        <div className="cv-entry" key={key}>
                            <h4>{edu.year}</h4>
                            <h2>{edu.school}</h2>
                            <h3>&apos;{edu.title}&apos;</h3>
                            <h5>- {edu.city}</h5>
                        </div>
                    ))}
                    
                    {/* Render PUBLICATIONS */}
                    {renderSection('PUBLICATIONS', 'PUBLICATIONS', (pubs, key) => (
                        <div className="cv-entry" key={key}>
                            <h4>{pubs.year}</h4>
                            <h2>{pubs.title}</h2>
                            <h5>{pubs.role}</h5>
                        </div>
                    ))}

                    {/* Render ORGANIZATIONS */}
                    {renderSection('ORGANIZATIONS', 'ORGANIZATIONS', (orgs, key) => (
                        <div className="cv-entry" key={key}>
                            <h4>{orgs.year}</h4>
                            <h2>{orgs.title}</h2>
                            <h5>{orgs.role}</h5>
                        </div>
                    ))}
                </>
            )}
            <h1>CV</h1>
        </div>
    )
}

export default CV