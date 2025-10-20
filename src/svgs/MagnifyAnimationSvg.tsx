'use client'
import React from 'react'

interface MagnifyAnimationProps {
  enlargeArtwork: boolean
  color?: string
  stroke?: number
}

const MagnifyAnimationSvg = ({
  enlargeArtwork,
  color = 'currentColor',
  stroke = 1.6,
}: MagnifyAnimationProps) => {
  return (
    <svg viewBox="0 0 40 40" role="img" aria-hidden="true">
      {/* Large thin circle for the glass */}
      <circle
        cx="16"
        cy="16"
        r="12"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'transform 260ms ease' }}
      />

      {/* Handle */}
      <line
        x1="25"
        y1="25"
        x2="30"
        y2="30"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        style={{
          transition: 'opacity 180ms ease, transform 260ms cubic-bezier(.2,.9,.3,1)',
        }}
      />

      {/* Plus / Minus group centered inside the glass */}
      <g transform="translate(16,16)" style={{ pointerEvents: 'none' }}>
        {/* horizontal bar (stays visible for both plus and minus) */}
        <rect
          x={-6}
          y={-stroke / 2}
          width={12}
          height={stroke}
          rx={stroke / 2}
          fill={color}
          style={{ transition: 'transform 220ms ease, opacity 220ms ease' }}
        />

        {/* vertical bar (fades and scales away when minimized) */}
        <rect
          className="vertical-bar"
          x={-stroke / 2}
          y={-6}
          width={stroke}
          height={12}
          rx={stroke / 2}
          fill={color}
          style={{
            transition: 'transform 220ms ease, opacity 180ms ease',
            transformOrigin: 'center',
            transform: enlargeArtwork ? 'scaleY(0.08)' : 'scaleY(1)',
            opacity: enlargeArtwork ? 0 : 1,
          }}
        />
      </g>
    </svg>
  )
}

export default MagnifyAnimationSvg