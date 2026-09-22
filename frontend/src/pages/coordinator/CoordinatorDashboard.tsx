import { useEffect, useState } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import ActivityAreaChart from '@/components/charts/ActivityAreaChart'
import BatchProgressTable from '@/components/dashboard/BatchProgressTable'
import AIInsightCard from '@/components/dashboard/AIInsightCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import { MOCK_ACTIVITY_DATA, MOCK_BATCHES, MOCK_EVENTS } from '@/utils/mockData'
import { Users, Award, FolderKanban, GraduationCap } from 'lucide-react'

export default function CoordinatorDashboard() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Dashboard — Kollab'
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#0f172a] rounded-2xl border border-[#1e293b]" />
          ))}
        </div>
        <div className="h-72 bg-[#0f172a] rounded-2xl border border-[#1e293b]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={240}
          subtitle="Across 6 active department batches"
          trend={{ value: 8, isPositive: true }}
          icon={<Users size={20} />}
        />
        <StatCard
          title="Skill Verified"
          value={168}
          subtitle="70% passed proctored tests"
          trend={{ value: 12, isPositive: true }}
          icon={<Award size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <StatCard
          title="Active Projects"
          value={34}
          subtitle="Collaborative student Kanban teams"
          trend={{ value: 4, isPositive: true }}
          icon={<FolderKanban size={20} />}
          iconBg="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />
        <StatCard
          title="Placement Ready"
          value="89 / 240"
          subtitle="Batch 2026 overall readiness score"
          icon={<GraduationCap size={20} />}
          iconBg="bg-violet-500/10 text-violet-400 border border-violet-500/20"
        >
          <div className="flex items-center gap-3 pt-1">
            <TrustScoreGauge score={89} size={70} showLabel={false} />
            <span className="text-xs text-slate-300 font-medium">High department employability rating</span>
          </div>
        </StatCard>
      </div>

      {/* Main Activity Area Chart */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">30-Day Activity & Verification Growth</h3>
            <p className="text-xs text-slate-400">Track tests taken, project commits, and verified profiles</p>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Tests
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Projects
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Profiles
            </span>
          </div>
        </div>
        <ActivityAreaChart data={MOCK_ACTIVITY_DATA} height={280} />
      </div>

      {/* 2 Column Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Batch Progress Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Batch Progress Overview</h3>
            <span className="text-xs text-indigo-400 font-semibold cursor-pointer hover:underline">View All Batches →</span>
          </div>
          <BatchProgressTable batches={MOCK_BATCHES} />
        </div>

        {/* Right Column: AI Insight + Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          <AIInsightCard />
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
            <h3 className="text-base font-bold text-slate-100 mb-4">Live Activity Feed</h3>
            <ActivityFeed events={MOCK_EVENTS} />
          </div>
        </div>
      </div>
    </div>
  )
}
