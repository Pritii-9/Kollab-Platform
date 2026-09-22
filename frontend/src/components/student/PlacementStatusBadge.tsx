import React from 'react'

interface PlacementStatusBadgeProps {
  status: 'Placed' | 'Eligible' | 'Ineligible' | 'In Process'
}

export function PlacementStatusBadge({ status }: PlacementStatusBadgeProps) {
  const styles = {
    Placed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Eligible: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'In Process': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Ineligible: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  }

  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
        styles[status] || styles.Eligible
      }`}
    >
      {status}
    </span>
  )
}
export default PlacementStatusBadge
