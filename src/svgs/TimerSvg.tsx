import { useArtworks } from '@/providers/ArtworkProvider'

const TimerSvg = () => {
  const [ artworks ] = useArtworks()

  const circumference = Math.PI * 2 * 13;
  // console.log("timer: ", artworks.slideshowTimerProgress)
  const progress = artworks.slideshowTimerProgress;
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
        className="timer-svg__background-circle"
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
        className="timer-svg__progress-circle"
      />
    </svg>
  )
}

export default TimerSvg;