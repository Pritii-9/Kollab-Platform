import React from 'react'
import type { StudentCardData } from '@/types/student.types'
import { trustScoreColor } from '@/utils/trustScore'
import SkillBadge from './SkillBadge'
import { User, Award, CheckCircle } from 'lucide-react'

interface StudentCardProps {
  student: StudentCardData
  onViewProfile: () => void
  onInvite: () => void
}

export function StudentCard({ student, onViewProfile, onInvite }: StudentCardProps) {
  const initials = student.name
    .split(' ')
    .map((n) => n[0])
    .join('')

  return (
    <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-indigo-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4 group">
      <div>
        {/* Match score top-right */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Yr {student.year} · {student.batch}
          </span>
          <div className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20">
            {student.matchPercentage}% Match
          </div>
        </div>

        {/* Student Avatar + Info */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-base flex items-center justify-center border border-indigo-400/30 shrink-0">
            {initials}
          </div>
          <div className="overflow-hidden">
            <h4 className="font-extrabold text-white text-sm truncate group-hover:text-indigo-400 transition-colors">
              {student.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: trustScoreColor(student.trustScore) }}
              />
              <span className="text-[11px] text-slate-400 font-medium">Trust: {student.trustScore}</span>
            </div>
          </div>
        </div>

        {/* Skills Chips */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {student.skills.slice(0, 3).map((sk, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-lg bg-[#080d18] border border-[#1e293b] text-[10px] text-slate-300 font-medium"
            >
              {sk}
            </span>
          ))}
          {student.skills.length > 3 && (
            <span className="px-2 py-0.5 rounded-lg bg-[#080d18] border border-[#1e293b] text-[10px] text-slate-500">
              +{student.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Stats & Actions */}
      <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between gap-2">
        <button
          onClick={onViewProfile}
          className="flex-1 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-slate-600 text-slate-300 text-xs font-semibold transition-colors"
        >
          View Profile
        </button>
        <button
          onClick={onInvite}
          className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-colors"
        >
          Invite to Team
        </button>
      </div>
    </div>
  )
}
export default StudentCard
