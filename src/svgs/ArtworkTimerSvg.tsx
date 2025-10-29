interface ArtworkTimerSvg {
  progress: number
}

const ArtworkTimerSvg = ({ progress }: ArtworkTimerSvg) => {

  const circumference = Math.PI * 2 * 13;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // console.log('timer progress: ', progress)

  return (
    <svg className="timer-svg__container" viewBox="-2 -2 40 40">
      {/* Background circle */}
      <circle
        cx={13}
        cy={13}
        r={13}
        fill="none"
        strokeWidth={2}
        className="artwork-image__background-circle"
      />
      
      {/* Progress circle */}
      <circle
        cx={13}
        cy={13}
        r={13}
        fill="none"
        strokeWidth={2}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="artwork-image__progress-circle"
      />
    </svg>
  )
}

export default ArtworkTimerSvg;