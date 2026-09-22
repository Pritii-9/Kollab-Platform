import React from 'react'
import type { TimelineEvent } from '@/types/student.types'
import { User, ClipboardList, FolderKanban, Star, GitBranch, Briefcase } from 'lucide-react'

interface TimelineStepProps {
  event: TimelineEvent
  isLast?: boolean
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'test':
      return <ClipboardList size={14} />
    case 'project':
      return <FolderKanban size={14} />
    case 'review':
      return <Star size={14} />
    case 'github':
      return <GitBranch size={14} />
    case 'placement':
      return <Briefcase size={14} />
    default:
      return <User size={14} />
  }
}

export function TimelineStep({ event, isLast = false }: TimelineStepProps) {
  return (
    <div className="relative pl-6 pb-6 group">
      {!isLast && <div className="absolute left-2 top-3 bottom-0 w-0.5 bg-[#1e293b]" />}
      <div
        className={`absolute left-0 top-1 w-4 h-4 rounded-full flex items-center justify-center text-white ${
          event.status === 'completed'
            ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
            : event.status === 'active'
            ? 'bg-indigo-500 ring-4 ring-indigo-500/20 animate-pulse'
            : 'bg-slate-700'
        }`}
      >
        {getEventIcon(event.type)}
      </div>

      <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-1">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-indigo-400 uppercase">Year {event.year}</span>
          <span className="text-slate-500">{event.date}</span>
        </div>
        <h4 className="font-bold text-white text-sm">{event.title}</h4>
        <p className="text-xs text-slate-400">{event.description}</p>
      </div>
    </div>
  )
}
export default TimelineStep
