import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'
import { studentsApi, type PlacementReadinessResult } from '@/api/students.api'
import StatCard from '@/components/dashboard/StatCard'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import ActivityAreaChart from '@/components/charts/ActivityAreaChart'
import SkillRadarChart from '@/components/charts/SkillRadarChart'
import { Award, FolderKanban, ClipboardList, Sparkles, ArrowRight, BarChart3 } from 'lucide-react'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()
  const [loading, setLoading] = useState(false)
  const [readiness, setReadiness] = useState<PlacementReadinessResult | null>(null)

  useEffect(() => {
    document.title = 'Dashboard — Kollab'
    fetchProjects()
    studentsApi.getPlacementReadiness().then((res) => {
      setReadiness(res)
    }).catch((err) => {
      console.warn('Readiness API error:', err)
    })
  }, [])

  const activeProjectsCount = projects.filter((p) => p.status === 'Active').length
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length

  const currentYear = user?.year || 3
  const stepperData = [1, 2, 3, 4].map((y) => {
    let status = 'Upcoming'
    if (y < currentYear) status = 'Completed'
    else if (y === currentYear) status = 'Current'

    const labels: Record<number, string> = {
      1: 'Foundations',
      2: 'Core Technical',
      3: 'Specialization & Projects',
      4: 'Placement & Industry'
    }

    return {
      yr: `Year ${y}`,
      status,
      label: labels[y]
    }
  })

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-[#0f172a] to-[#080d18] border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">
            Good morning, {user?.name || 'Student'} 👋
          </h2>
          <p className="text-xs text-indigo-200 mt-1">
            Year {user?.year || 3} · {user?.batch || 'Batch A'} · {user?.department || 'Computer Science & Engineering'}
          </p>
        </div>
        <button
          onClick={() => navigate('/student/analytics')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-extrabold text-white text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all"
        >
          <BarChart3 size={16} /> View My Analytics
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Trust Score" value={user?.trustScore || 0} subtitle={user?.trustScore ? `Trust rating ${user.trustScore}` : "No assessments taken yet"} icon={<Award size={20} />}>
          <TrustScoreGauge score={user?.trustScore || 0} size={60} showLabel={false} />
        </StatCard>

        <StatCard
          title="Skills Verified"
          value={user?.skills?.filter((s: any) => s.status === 'verified').length || 0}
          subtitle="Verified skill badges"
          icon={<Award size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        >
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-0" />
          </div>
        </StatCard>

        <StatCard
          title="Collaborative Projects"
          value={projects.length}
          subtitle={`${completedProjectsCount} Completed · ${activeProjectsCount} Active`}
          icon={<FolderKanban size={20} />}
          iconBg="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />

        <StatCard
          title="Proctored Tests Taken"
          value={0}
          subtitle="No tests completed yet"
          icon={<ClipboardList size={20} />}
          iconBg="bg-violet-500/10 text-violet-400 border border-violet-500/20"
        />
      </div>

      {/* 4-Year Progression Stepper */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
        <h3 className="text-sm font-bold text-white mb-4">Degree Progression Tracker</h3>
        <div className="grid grid-cols-4 gap-2 relative">
          {stepperData.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border text-center transition-all ${
                step.status === 'Current'
                  ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/30'
                  : step.status === 'Completed'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-slate-300'
                  : 'bg-[#080d18] border-[#1e293b] text-slate-500'
              }`}
            >
              <span className="text-[10px] font-bold block uppercase tracking-wider">{step.status}</span>
              <h4 className="font-extrabold text-sm text-white mt-0.5">{step.yr}</h4>
              <p className="text-[11px] text-slate-400 mt-1 truncate">{step.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Activity & Performance</h3>
          <div className="h-[260px] flex items-center justify-center">
            <ActivityAreaChart data={[]} height={260} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
            <h3 className="text-base font-bold text-white mb-4">Skill Radar</h3>
            <SkillRadarChart data={[]} height={260} />
          </div>
        </div>
      </div>

      {/* Timeline & Notifications Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
          <h3 className="text-base font-bold text-white mb-4">Timeline & Milestones</h3>
          <div className="space-y-3">
            <p className="text-slate-400 text-xs">No timeline events recorded yet.</p>
          </div>
        </div>

        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Notifications</h3>
            <button onClick={() => navigate('/student/notifications')} className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold">View All</button>
          </div>
          <div className="space-y-0 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e293b]">
            <p className="text-slate-400 text-xs pl-8">No recent notifications.</p>
          </div>
        </div>
      </div>

      {/* Assigned Test & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Assigned Tests
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
              <ClipboardList size={28} className="text-slate-700" />
              <p className="text-sm font-semibold text-slate-400">No Tests Assigned</p>
              <p className="text-xs text-slate-600">Your coordinator hasn't assigned any tests yet. Check back soon.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <Sparkles size={16} /> AI Placement Readiness Analysis
              </div>
              {readiness && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                  readiness.readinessScore >= 80
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : readiness.readinessScore >= 60
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {readiness.readinessScore}% · {readiness.status}
                </span>
              )}
            </div>
            <div className="space-y-2 text-xs">
              {readiness && readiness.recommendations && readiness.recommendations.length > 0 ? (
                readiness.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/student/teammates')}
                    className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-slate-200 font-medium leading-relaxed">{rec}</span>
                    <ArrowRight size={14} className="text-slate-500 shrink-0 ml-2" />
                  </div>
                ))
              ) : (
                <>
                  <div
                    onClick={() => navigate('/student/teammates')}
                    className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-slate-200 font-medium">Find AI-matched teammate for Project</span>
                    <ArrowRight size={14} className="text-slate-500 shrink-0" />
                  </div>
                  <div
                    onClick={() => navigate('/student/ai-tools')}
                    className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-slate-200 font-medium">Generate AI Resume Action Bullets</span>
                    <ArrowRight size={14} className="text-slate-500 shrink-0" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
