import React from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  icon: React.ReactNode
  iconBg?: string
  children?: React.ReactNode
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBg = 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20',
  children
}: StatCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">{value}</h2>
          {trend && (
            <span
              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {trend.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend.value}%
            </span>
          )}
        </div>
      </div>

      {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  )
}
export default StatCard
