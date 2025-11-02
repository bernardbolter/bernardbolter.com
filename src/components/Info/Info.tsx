'use client'

import { useArtworks } from '@/providers/ArtworkProvider'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import AnimatedHamburgerMenu from '../Navs/AnimatedHamburgerMenu'
// import MenuPlusSvg from '@/svgs/MenuPlusSvg'
import InstaCircleSvg from '@/svgs/InstaCircleSvg'
import TiktokCircleSvg from'@/svgs/TiktokCircleSvg'
import LinkedinCircleSvg from '@/svgs/LinkedinCircleSvg'
import YoutubeCircleSvg from '@/svgs/YoutubeCircleSvg'
import LinkSvg from '@/svgs/LinkSvg'
import BackArrowSvg from '@/svgs/BackArrowSvg'

const Info = () => {
    const [artworks, setArtworks] = useArtworks()
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
                        <p className="name__all-artwork">All Artwork</p>
                    </Link>
                )}
            </div>
            <div 
                className="info-button__container--background"
                style={{ 
                    borderBottomRightRadius: artworks.infoOpen ? 0 : 6,
                    width: artworks.infoOpen ? 149 : 50,
                    transition: 'all .3s ease-in-out'
                }}    
            >
                <div 
                    className={artworks.infoOpen ? "info-button__container info-button__container--open" : "info-button__container"}
                    onClick={() => setArtworks(prevState => ({...prevState, infoOpen: !prevState.infoOpen}))}    
                >
                    <AnimatedHamburgerMenu />
                </div>
            </div>
            
            <div className={artworks.infoOpen ? "info__content info__content--open" : "info__content"}>
                <div className="info-websites">
                    <a href="https://acolorfulhistory.com" rel="noopener noreferrer">
                        <LinkSvg />
                        <h3>acolorfulhistory.com</h3>
                    </a>
                    <a href="https://digitalcityseries.com" rel="noopener noreferrer">
                        <LinkSvg />
                        <h3>digitalcityseries.com</h3>
                    </a>
                    <a href="https://smoothism.com" rel="noopener noreferrer">
                        <LinkSvg />
                        <h3>smoothism.com</h3>
                    </a>
                </div>
                <div className="info__divider" />
                <div className="info-links">
                    {pathname !== '/' && <Link href="/" onClick={() => setArtworks(state => ({...state, infoOpen: false}))}>Artwork</Link>}
                    {pathname !== '/bio' && <Link href="/bio" onClick={() => setArtworks(state => ({...state, infoOpen: false}))}>Bio</Link>}
                    {pathname !== '/cv' && <Link href="/cv" onClick={() => setArtworks(state => ({...state, infoOpen: false}))}>CV</Link>}
                    {pathname !== '/statement' && <Link href="/statement" onClick={() => setArtworks(state => ({...state, infoOpen: false}))}>Statement</Link>}
                    {pathname !== '/contact' && <Link href="contact" onClick={() => setArtworks(state => ({...state, infoOpen: false}))}>Contact</Link>}
                </div>
                <div className="info__divider" />
                <div className="info-socials">
                    <a
                        className="info-socials__svg-container"
                        href="https://www.instagram.com/bernardbolter" rel="noopener noreferrer"
                    >
                        <InstaCircleSvg />
                    </a>
                    <a
                        className="info-socials__svg-container"
                        href="https://www.tiktok.com/@bernardbreaksdownart" rel="noopener noreferrer"
                    >
                        <TiktokCircleSvg />
                    </a>
                    <a
                        className="info-socials__svg-container"
                        href="https://www.youtube.com/channel/UCL5q08QoZ6yjHwYkGzJpKXg" rel="noopener noreferrer"
                    >
                        <YoutubeCircleSvg />
                    </a>
                    <a
                        className="info-socials__svg-container"
                        href="https://www.linkedin.com/in/bernard-bolter-iv/" rel="noopener noreferrer"
                    >
                        <LinkedinCircleSvg />
                    </a>
                </div>
            </div>
        </>
    )
}

export default Info;