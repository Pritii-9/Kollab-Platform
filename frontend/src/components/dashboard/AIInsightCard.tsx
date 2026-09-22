import { useState, useEffect } from 'react'
import { Sparkles, RotateCw } from 'lucide-react'

interface AIInsightCardProps {
  insight?: string
  onRefresh?: () => void
  isLoading?: boolean
}

export function AIInsightCard({
  insight = "Batch 2026 exhibits a 15% increase in React skill verification after the recent MCQ proctored test. 12 students are recommended for advanced full-stack project pairing.",
  onRefresh,
  isLoading: externalLoading = false
}: AIInsightCardProps) {
  const [internalLoading, setInternalLoading] = useState(false)

  const handleRefresh = () => {
    setInternalLoading(true)
    if (onRefresh) onRefresh()
    setTimeout(() => {
      setInternalLoading(false)
    }, 1200)
  }

  const isLoading = externalLoading || internalLoading

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#131d33] border border-[#1e293b] border-l-4 border-l-indigo-500 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles size={18} />
          </div>
          <h3 className="text-sm font-bold text-slate-100">AI Intelligence Insight</h3>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
          title="Refresh Insight"
        >
          <RotateCw size={16} className={isLoading ? 'animate-spin text-indigo-400' : ''} />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2 py-1">
          <div className="h-3.5 bg-slate-800 rounded-md animate-pulse w-full" />
          <div className="h-3.5 bg-slate-800 rounded-md animate-pulse w-5/6" />
          <div className="h-3.5 bg-slate-800 rounded-md animate-pulse w-4/6" />
        </div>
      ) : (
        <p className="text-sm text-slate-300 leading-relaxed font-normal">{insight}</p>
      )}
    </div>
  )
}
export default AIInsightCard
