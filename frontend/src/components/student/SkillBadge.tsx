import React from 'react'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

interface SkillBadgeProps {
  status: 'verified' | 'pending' | 'failed'
  name?: string
  showName?: boolean
}

export function SkillBadge({ status, name, showName = true }: SkillBadgeProps) {
  const configs = {
    verified: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      icon: <CheckCircle2 size={12} />,
      label: 'Verified'
    },
    pending: {
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      icon: <Clock size={12} />,
      label: 'Pending'
    },
    failed: {
      bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      icon: <XCircle size={12} />,
      label: 'Unverified'
    }
  }

  const config = configs[status] || configs.pending

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${config.bg}`}>
      {config.icon}
      {showName && name ? `${name} · ${config.label}` : config.label}
    </span>
  )
}
export default SkillBadge
