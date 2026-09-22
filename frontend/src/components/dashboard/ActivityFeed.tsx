import React from 'react'
import { formatRelative } from '@/utils/formatDate'

interface EventItem {
  id: string
  type: string
  text: string
  timestamp: string
}

interface ActivityFeedProps {
  events: EventItem[]
}

const getDotColor = (type: string) => {
  switch (type) {
    case 'test':
      return 'bg-indigo-500 ring-indigo-500/20'
    case 'project':
      return 'bg-emerald-500 ring-emerald-500/20'
    case 'profile':
      return 'bg-amber-500 ring-amber-500/20'
    default:
      return 'bg-slate-500 ring-slate-500/20'
  }
}

export function ActivityFeed({ events }: ActivityFeedProps) {
  return (
    <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-start gap-3 p-3 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:bg-[#152035] transition-colors"
        >
          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ring-4 ${getDotColor(event.type)}`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-200 leading-snug">{event.text}</p>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              {formatRelative(event.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
export default ActivityFeed
