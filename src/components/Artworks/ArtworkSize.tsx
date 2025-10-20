import { convertSizeForDisplay } from '@/helpers/convertUnits'

interface ArtworkSizeProps {
    width: string
    height: string
    units: string,
    isImage: boolean
}

const ArtworkSize = ({
    width,
    height,
    units,
    isImage
}: ArtworkSizeProps) => {
    const {
        widthMetric,
        heightMetric,
        widthImperialInches,
        heightImperialInches,
        widthImperialFraction,
        heightImperialFraction,
        widthPixels,
        heightPixels
    } = convertSizeForDisplay(width, height, units)

    console.log(widthMetric)

    if (width === '0') return

    if (units === 'pixels') {
        return (
            <div 
                className="artwork-size__container"
                style={{ alignItems: isImage ? 'flex-end' : 'flex-start' }}    
            >
                <h4 className="artwork-size__size">{widthPixels}px x {heightPixels}px</h4>
            </div>
        )
    }

    if (units === 'imperial') {
        return (
            <div 
                className="artwork-size__container"
                style={{ alignItems: isImage ? 'flex-end' : 'flex-start' }}
            >
                <h4 className="artwork-size__size">{widthImperialInches}{widthImperialFraction ? ` <span>${widthImperialFraction}<span>` : ''}&quot; x {heightImperialInches}{heightImperialFraction ? ` <span>${heightImperialFraction}</span>` : ''}&quot;</h4>
                <h5 className="artwork-size__size--converted">{widthMetric} x {heightMetric}</h5>
            </div>
        )
    }

    return (
        <div 
            className="artwork-size__container"
            style={{ alignItems: isImage ? 'flex-end' : 'flex-start' }}    
        >
            <h4 className="artwork-size__size">{widthMetric} x {heightMetric}</h4>
            <h5 className="artwork-size__size--converted">{widthImperialInches}<span>{widthImperialFraction ? ` ${widthImperialFraction}` : ''}</span>&quot; x {heightImperialInches}<span>{heightImperialFraction ? ` ${heightImperialFraction}` : ''}&quot;</span></h5>
        </div>
    )
}

export default ArtworkSize