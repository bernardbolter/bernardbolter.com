const PlaySvg = ({ showSlideshow }) => {
    return (
        <svg viewBox="0 0 52 50">
        <path 
            d="M43.8242 44.5L50.0742 49.5H8.6582L1.5752 44.5H43.8242ZM51 11.6484V48.959L44.5 43.7588V1.68164L51 11.6484Z" 
            className={showSlideshow ? "svgs-light-stroke svgs-transparent-fill" : "svgs-dark-stroke svgs-transparent-fill"}
        />
        <path 
            d="M0 6L6 0H44V44H0V6Z" 
            className={showSlideshow ? "svgs-light-stroke svgs-transparent-fill" : "svgs-dark-fill"}
        />
        <path 
            d="M13.2064 35.9397C13.3303 36.0201 13.4748 36.0201 13.5987 35.9397L35.7935 22.98C35.9381 22.8996 36 22.7991 36 22.6384C36 22.4977 35.9174 22.3772 35.7935 22.3169L13.5987 10.0603C13.5987 10.0603 13.4749 10 13.3923 10C13.3303 10 13.2684 10.0201 13.2065 10.0603C13.0619 10.1407 13 10.2411 13 10.4019V35.5987C13 35.7594 13.0619 35.8593 13.2064 35.9397Z" 
            className="svgs-light-fill"
            style={{
                opacity: showSlideshow ? '0' : '1',
            }}
        />
        <rect 
            x="13" y="12" width="21" height="21" 
            className="svgs-light-fill"
            style={{
                opacity: showSlideshow ? '1' : '0',
            }}   
        />
        </svg>
    )
}

export default PlaySvg;