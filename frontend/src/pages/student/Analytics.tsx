import { useState, useEffect } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import ActivityAreaChart from '@/components/charts/ActivityAreaChart'
import SkillRadarChart from '@/components/charts/SkillRadarChart'
import { useProjectStore } from '@/store/projectStore'
import { useAuthStore } from '@/store/authStore'
import { testsApi } from '@/api/tests.api'
import type { TestResult } from '@/types/test.types'
import { BarChart3, TrendingUp, Award, ClipboardList, FolderKanban, Star, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'

import { useCacheStore } from '@/store/cacheStore'

export default function Analytics() {
  const { user } = useAuthStore()
  const { projects } = useProjectStore()
  const { myTestHistory: testHistory, setMyTestHistory: setTestHistory } = useCacheStore()
  const [loadingTests, setLoadingTests] = useState(testHistory.length === 0)
  const [activeTestTab, setActiveTestTab] = useState<'all' | 'passed' | 'failed'>('all')

  useEffect(() => {
    document.title = 'Analytics — Kollab'
    testsApi.getMyTestHistory()
      .then((history) => {
        if (history && history.length > 0) setTestHistory(history)
      })
      .catch((err) => {
        console.warn('Failed to load test history:', err)
      })
      .finally(() => {
        setLoadingTests(false)
      })
  }, [])

  const activeProjectsCount = projects.filter((p) => p.status === 'Active').length
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length

  const testsCount = testHistory.length
  const avgTestScore = testsCount > 0 ? Math.round(testHistory.reduce((acc, t) => acc + t.percentage, 0) / testsCount) : 0

  const filteredHistory = testHistory.filter((t) => {
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
        <StatCard
          title="Tests Taken"
          value={testsCount}
          subtitle={testsCount > 0 ? `${testsCount} proctored attempts` : "No proctored tests completed"}
          icon={<ClipboardList size={20} />}
        />
        <StatCard
          title="Avg Assessment Score"
          value={`${avgTestScore}%`}
          subtitle={testsCount > 0 ? `Based on ${testsCount} attempts` : "No assessments taken"}
          icon={<Award size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <StatCard
          title="Projects Delivered"
          value={projects.length}
          subtitle={`${completedProjectsCount} Completed · ${activeProjectsCount} Active`}
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

      {/* Activity Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Verification & Activity Telemetry (60 Days)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Track your test completions, project activity, and profile updates over time</p>
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
        {user?.skills && user.skills.length > 0 ? (
          <div className="space-y-3">
            {user.skills.map((sk: any) => (
              <div key={sk.id || sk.name} className="p-3.5 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${sk.status === 'verified' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="font-bold text-white">{sk.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${sk.score}%` }} />
                  </div>
                  <span className="font-bold text-emerald-400">{sk.score}% Score</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 text-slate-400 text-xs p-4 bg-[#080d18] rounded-xl border border-[#1e293b] text-center">
            No skill progress telemetry available. Complete a proctored assessment to record baseline skill metrics.
          </div>
        )}
      </div>

      {/* Test History */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">Proctored Assessment History</h3>
            <p className="text-xs text-slate-400 mt-0.5">Complete record of all your verified skill assessments</p>
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

        {loadingTests ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading test history...</div>
        ) : filteredHistory.length === 0 ? (
          <div className="space-y-2 text-slate-400 text-xs p-8 bg-[#080d18] rounded-xl border border-[#1e293b] text-center">
            <ClipboardList size={28} className="mx-auto text-slate-600 mb-1" />
            <p className="font-semibold text-white">No Assessment Attempts Found</p>
            <p className="text-slate-400 max-w-sm mx-auto">Take an assigned skill test to record score history and earn verified badges.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{t.testTitle}</h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {t.passed ? 'PASSED' : 'RETAKE REQUIRED'}
                    </span>
                  </div>
                  <p className="text-slate-400">
                    Skill: <span className="text-indigo-400 font-semibold">{t.skillName}</span> · Date: {t.completedAt}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="font-extrabold text-base text-white">{t.score} / {t.total}</span>
                    <span className="block text-[11px] text-emerald-400 font-bold">{t.percentage}% Score</span>
                  </div>
                  {t.tabSwitches > 0 && (
                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                      <AlertTriangle size={12} /> {t.tabSwitches} Switch(es)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

