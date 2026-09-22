import { useEffect, useState } from 'react'
import { MOCK_MILESTONES } from '@/utils/mockData'
import { CheckCircle2, Clock, Lock, Trophy, Calendar, ArrowRight, Target, Flame } from 'lucide-react'

export default function Milestones() {
  const [activeView, setActiveView] = useState<'timeline' | 'grid'>('timeline')

  useEffect(() => {
    document.title = 'Milestones — Kollab'
  }, [])

  const completed = 0
  const active = 0
  const total = 0
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Project Milestone Timeline</h2>
          <p className="text-xs text-slate-400 mt-0.5">Track deliverable checkpoints for your department proctored project</p>
        </div>
        {/* View Toggle */}
        <div className="flex p-1 rounded-xl bg-[#0f172a] border border-[#1e293b]">
          {(['timeline', 'grid'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                activeView === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Summary Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-[#0f172a] to-[#0f172a] border border-indigo-500/20 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-3 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
              <Trophy size={28} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">
                {completed} of {total} Milestones Completed
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {active} currently active · {total - completed - active} upcoming
              </p>
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Overall Progress</span>
              <span className="font-bold text-indigo-400">{progressPct}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <CheckCircle2 size={18} className="text-emerald-400 mx-auto mb-1" />
            <span className="block text-lg font-extrabold text-white">{completed}</span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wide">Completed</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <Flame size={18} className="text-indigo-400 mx-auto mb-1" />
            <span className="block text-lg font-extrabold text-white">{active}</span>
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wide">In Progress</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-700/20 border border-slate-700/40 text-center">
            <Lock size={18} className="text-slate-500 mx-auto mb-1" />
            <span className="block text-lg font-extrabold text-white">{total - completed - active}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-center p-8 bg-[#0f172a] border border-[#1e293b] rounded-2xl text-slate-400 text-xs">
            No active milestones to display. Join a project to see your milestones.
          </div>
        </div>
      )}

      {/* Grid View */}
      {activeView === 'grid' && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-center p-8 bg-[#0f172a] border border-[#1e293b] rounded-2xl text-slate-400 text-xs">
            No active milestones to display. Join a project to see your milestones.
          </div>
        </div>
      )}
    </div>
  )
}
