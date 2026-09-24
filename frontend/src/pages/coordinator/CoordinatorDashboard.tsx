import { useEffect, useState } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import ActivityAreaChart from '@/components/charts/ActivityAreaChart'
import BatchProgressTable from '@/components/dashboard/BatchProgressTable'
import AIInsightCard from '@/components/dashboard/AIInsightCard'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import { batchesApi } from '@/api/batches.api'
import { studentsApi } from '@/api/students.api'
import type { Batch } from '@/types/batch.types'
import type { Student } from '@/types/student.types'
import { Users, Award, FolderKanban, GraduationCap } from 'lucide-react'

// Real 30-day telemetry baseline (0 initial activity until live events recorded)
const generateRealTelemetryData = (studentsCount: number) => {
  return Array.from({ length: 30 }, (_, i) => {
    const dateStr = new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    return {
      date: dateStr,
      tests: 0,
      projects: 0,
      profiles: studentsCount > 0 && i === 29 ? studentsCount : 0,
    }
  })
}

import { useCacheStore } from '@/store/cacheStore'

export default function CoordinatorDashboard() {
  const { batches, students, setBatches, setStudents } = useCacheStore()
  const [loading, setLoading] = useState(batches.length === 0 && students.length === 0)

  useEffect(() => {
    document.title = 'Dashboard — Kollab'
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [batchList, studentList] = await Promise.all([
        batchesApi.listBatches().catch(() => []),
        studentsApi.getRoster().catch(() => [])
      ])
      if (batchList && batchList.length > 0) setBatches(batchList)
      if (studentList && studentList.length > 0) setStudents(studentList)
    } catch (err) {
      console.error('Failed to load coordinator dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading dashboard...
      </div>
    )
  }

  const totalStudentsCount = students.length
  const verifiedSkillsCount = students.reduce(
    (acc, s) => acc + (s.skills ? s.skills.filter((sk) => sk.status === 'verified').length : 0),
    0
  )
  const avgTrustScore =
    students.length > 0
      ? Math.round(students.reduce((acc, s) => acc + (s.trustScore || 0), 0) / students.length)
      : 0

  const telemetryData = generateRealTelemetryData(totalStudentsCount)

  return (
    <div className="space-y-6">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={totalStudentsCount > 0 ? totalStudentsCount : 0}
          subtitle={`Across ${batches.length} active cohorts`}
          trend={{ value: 100, isPositive: true }}
          icon={<Users size={20} />}
        />
        <StatCard
          title="Skill Badges Verified"
          value={verifiedSkillsCount}
          subtitle="Proctored assessment badges"
          trend={{ value: 0, isPositive: true }}
          icon={<Award size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <StatCard
          title="Active Batches"
          value={batches.length}
          subtitle="Department academic cohorts"
          trend={{ value: 0, isPositive: true }}
          icon={<FolderKanban size={20} />}
          iconBg="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />
        <StatCard
          title="Placement Readiness"
          value={`${avgTrustScore}%`}
          subtitle="Average platform readiness score"
          icon={<GraduationCap size={20} />}
          iconBg="bg-violet-500/10 text-violet-400 border border-violet-500/20"
        >
          <div className="flex items-center gap-3 pt-1">
            <TrustScoreGauge score={avgTrustScore} size={70} showLabel={false} />
            <span className="text-xs text-slate-300 font-medium">Department readiness rating</span>
          </div>
        </StatCard>
      </div>

      {/* Main Activity Area Chart */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100">30-Day Platform Telemetry & Verification Growth</h3>
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
        <ActivityAreaChart data={telemetryData} height={280} />
      </div>

      {/* 2 Column Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Batch Progress Table */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100">Batch Progress Overview</h3>
            <a href="/coordinator/batches" className="text-xs text-indigo-400 font-semibold cursor-pointer hover:underline">
              View All Batches →
            </a>
          </div>
          <BatchProgressTable batches={batches} />
        </div>

        {/* Right Column: AI Insight + Activity Feed */}
        <div className="lg:col-span-5 space-y-6">
          <AIInsightCard insight={`Department has ${students.length} registered students with an average readiness of ${avgTrustScore}%.`} />
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
            <h3 className="text-base font-bold text-slate-100 mb-4">Live Activity Feed</h3>
            <ActivityFeed events={[]} />
          </div>
        </div>
      </div>
    </div>
  )
}
