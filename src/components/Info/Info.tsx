'use client'

import { useArtworks } from '@/providers/ArtworkProvider';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import MenuPlusSvg from '@/svgs/MenuPlusSvg'
import InstaPlainSvg from '@/svgs/InstaPlainSvg'
import TiktokPlainSvg from '@/svgs/TiktokPlainSvg'
import LinkedinPlainSvg from '@/svgs/LinkedinPlainSvg'
import YoutubePlainSvg from '@/svgs/YoutubePlainSvg'
import LinkSvg from '@/svgs/LinkSvg'
import BackArrowSvg from '@/svgs/BackArrowSvg'

const Info = () => {
    const [artworks, setArtworks] = useArtworks();
    const pathname = usePathname()
    // console.log(pathname)
    // console.log(artworks.artistData)

    const staticRoutes = ['/', '/bio', '/cv', '/statement', '/contact']
    const isDynamicRoute = !staticRoutes.includes(pathname)

    return (
        <>
            <div className="name__container">
                <h1 className="name__full">{artworks.artistData.name}</h1>
                {!isDynamicRoute 
                    ? (
                    <>
                        <h3 className="name__city">b. {artworks.artistData.birthcity}, {artworks.artistData.birthyear}</h3>
                        <h2 className="name__location">Lives and works {artworks.artistData.workcity1} and {artworks.artistData.workcity2}</h2>  
                    </>
                    ) : (
                    <Link 
                        className="name__back--container"
                        href="/"
                    >
                        <div className="name__back--svg">
                            <BackArrowSvg />
                        </div>
                        <p>All Artwork</p>
                    </Link>
                )}
            </div>
            <div 
                className={artworks.infoOpen ? "info-button__container info-button__container--open" : "info-button__container"}
                onClick={() => setArtworks(prevState => ({...prevState, infoOpen: !prevState.infoOpen}))}    
            >
                <MenuPlusSvg />
            </div>
            <div className={artworks.infoOpen ? "info__content info__content--open" : "info__content"}>
                <div className="info-links">
                    {pathname !== '/' && <Link href="/">Artwork</Link>}
                    {pathname !== '/bio' && <Link href="/bio">Bio</Link>}
                    {pathname !== '/cv' && <Link href="/cv">CV</Link>}
                    {pathname !== '/statement' && <Link href="/statement">Statement</Link>}
                    {pathname !== '/contact' && <Link href="contact">Contact</Link>}
                </div>
                <div className="info__divider" />
                <div className="info-socials">
                    <a
                        className="info-socials__svg-container info-socials__insta"
                        href="https://www.instagram.com/bernardbolter" rel="noopener noreferrer"
                    >
                        <InstaPlainSvg />
                    </a>
                    <a
                        className="info-socials__svg-container info-socials__tiktok"
                        href="https://www.tiktok.com/@acolorfulhistory" rel="noopener noreferrer"
                    >
                        <TiktokPlainSvg />
                    </a>
                    <a
                        className="info-socials__svg-container info-socials__youtube"
                        href="https://www.youtube.com/channel/UCL5q08QoZ6yjHwYkGzJpKXg" rel="noopener noreferrer"
                    >
                        <YoutubePlainSvg />
                    </a>
                    <a
                        className="info-socials__svg-container info-socials__linkedin"
                        href="https://www.linkedin.com/in/bernard-bolter-iv/" rel="noopener noreferrer"
                    >
                        <LinkedinPlainSvg />
                    </a>
                </div>
                <div className="info__divider" />
                <div className="info-websites">
                    <a href="https://megacities.world" rel="noopener noreferrer">
                        <LinkSvg />
                        <h3>megacities.world</h3>
                    </a>
                    <a href="https://smoothism.com" rel="noopener noreferrer">
                        <LinkSvg />
                        <h3>smoothism.com</h3>
                    </a>
                </div> 
            </div>
        </>
    )
}

export default Info;