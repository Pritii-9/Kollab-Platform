import { useState, useEffect } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import ActivityAreaChart from '@/components/charts/ActivityAreaChart'
import SkillRadarChart from '@/components/charts/SkillRadarChart'
import { MOCK_ACTIVITY_DATA, MOCK_RADAR_DATA } from '@/utils/mockData'
import { BarChart3, TrendingUp, Target, BrainCircuit, Calendar, ChevronDown, Award, ClipboardList, FolderKanban, Star, Clock, CheckCircle2 } from 'lucide-react'

const testHistory: any[] = []
const skillProgressData: any[] = []

export default function Analytics() {
  const [activeTestTab, setActiveTestTab] = useState<'all' | 'passed' | 'failed'>('all')

  useEffect(() => {
    document.title = 'Analytics — Kollab'
  }, [])

  const filteredTests = testHistory.filter(t => {
    if (activeTestTab === 'passed') return t.passed
    if (activeTestTab === 'failed') return !t.passed
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Performance Analytics</h2>
          <p className="text-xs text-slate-400 mt-0.5">Deep-dive performance telemetry, test score trends, and skill breakdown</p>
        </div>
        <span className="px-3 py-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold flex items-center gap-1.5">
          <TrendingUp size={14} /> Updated Today
        </span>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Tests Taken" value={0} subtitle="No tests completed" icon={<ClipboardList size={20} />} />
        <StatCard
          title="Avg Assessment Score"
          value="0%"
          subtitle="No assessments taken"
          icon={<Award size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <StatCard
          title="Projects Delivered"
          value={0}
          subtitle="No projects completed"
          icon={<FolderKanban size={20} />}
          iconBg="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />
        <StatCard
          title="Peer Rating"
          value="N/A"
          subtitle="No peer reviews yet"
          icon={<Star size={20} />}
          iconBg="bg-violet-500/10 text-violet-400 border border-violet-500/20"
        />
      </div>

      {/* 2 Column Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Verification & Activity Trend (60 Days)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track your test completions, project activity, and profile updates</p>
          </div>
          <ActivityAreaChart data={MOCK_ACTIVITY_DATA} height={260} />
        </div>

        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Platform Activity</h3>
              <p className="text-xs text-slate-400">Your engagement over time</p>
            </div>
          </div>
          <ActivityAreaChart data={[]} height={260} />
        </div>
      </div>

      {/* Skill Progress Table */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Skill Progress Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track individual skill improvement over time</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Verified</span>
            <span className="flex items-center gap-1.5 text-amber-400"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pending</span>
          </div>
        </div>
        <div className="space-y-3 text-slate-400 text-xs p-4">
          No skill progress data available. Take a skill test to establish your baseline.
        </div>
      </div>

      {/* Test History */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-white">Proctored Test History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Complete record of all your skill assessments</p>
          </div>
          {/* Tab Filter */}
          <div className="flex p-1 rounded-xl bg-[#080d18] border border-[#1e293b]">
            {(['all', 'passed', 'failed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTestTab(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  activeTestTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 text-slate-400 text-xs p-4">
          No tests taken yet.
        </div>
      </div>
    </div>
  )
}
