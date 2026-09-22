import { trustScoreColor } from '@/utils/trustScore'

interface TrustScoreGaugeProps {
  score: number
  size?: number
  showLabel?: boolean
}

export function TrustScoreGauge({ score, size = 120, showLabel = true }: TrustScoreGaugeProps) {
  const normalizedScore = Math.min(Math.max(score, 0), 100)
  const strokeWidth = size * 0.1
  const radius = (size - strokeWidth) / 2
  const center = size / 2

  // Semicircle arc length = Math.PI * radius
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference
  const color = trustScoreColor(normalizedScore)

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 10 }}>
        <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`} className="overflow-visible">
          {/* Background Track */}
          <path
            d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Fill Track */}
          <path
            d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Score Text */}
        <div className="absolute bottom-0 text-center flex flex-col items-center">
          <span className="font-extrabold text-slate-100" style={{ fontSize: size * 0.26, lineHeight: 1 }}>
            {normalizedScore}
          </span>
          {showLabel && (
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              Trust Score
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
export default TrustScoreGauge
