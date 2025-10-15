import { Artwork } from '@/types/artworkTypes'

export type ArtworkImageProps = {
    artwork: Artwork
}

export type OrientationKey = 'portrait' | 'landscape' | 'square'
export type SizeKey = 'xl' | 'lg' | 'md' | 'sm'

export const SIZE_FACTORS = {
    xl: 0.95,
    lg: 0.90,
    md: 0.85,
    sm: 0.80
}

export interface ArtworkDimensions {
    width: number
    height: number
}

export interface MagnifiedDimensions extends ArtworkDimensions {
    canDrag: boolean
}

export interface DragBounds {
    left: number
    right: number
    top: number
    bottom: number
}