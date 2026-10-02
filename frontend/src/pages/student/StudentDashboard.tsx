import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'
import { studentsApi, type PlacementReadinessResult } from '@/api/students.api'
import StatCard from '@/components/dashboard/StatCard'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import { Award, FolderKanban, ClipboardList, Compass, ArrowRight, UserPlus, FileText, CheckCircle2, ShieldCheck, Target, BarChart3 } from 'lucide-react'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, fetchProjects } = useProjectStore()
  const [readiness, setReadiness] = useState<PlacementReadinessResult | null>(null)
  const [assignedTests, setAssignedTests] = useState<any[]>([])
  const [testHistory, setTestHistory] = useState<any[]>([])

  useEffect(() => {
    document.title = 'Dashboard — Kollab'
    fetchProjects()
    studentsApi.getPlacementReadiness().then((res) => {
      setReadiness(res)
    }).catch(() => {})

    import('@/api/tests.api').then(({ testsApi }) => {
      testsApi.listTests().then(setAssignedTests).catch(() => {})
      testsApi.getMyTestHistory().then(setTestHistory).catch(() => {})
    })
  }, [])

  const activeProjects = projects.filter((p) => p.status === 'Active')
  const completedProjectsCount = projects.filter((p) => p.status === 'Completed').length
  const verifiedSkills = user?.skills?.filter((s: any) => s.status === 'verified') || []

  // Deduplicate assigned tests first
  const uniqueAssignedTests = assignedTests.filter((t: any, index: number, self: any[]) =>
    index === self.findIndex((other: any) => (
      (other.id && other.id === t.id) || (other.title && other.title === t.title)
    ))
  )

  // Filter out tests that student has ALREADY attempted/completed
  const uncompletedTests = uniqueAssignedTests.filter((t: any) => {
    if (!t || !t.id) return false
    const attempted = testHistory.some(
      (h) => h.testId === t.id || (h.skillName && t.skillName && h.skillName.toLowerCase() === t.skillName.toLowerCase())
    )
    return !attempted
  })

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-[#0e1526] border border-[#1a2438] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Student Portal
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {user?.placementStatus || 'Eligible'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Welcome back, {user?.name || 'Student'} 👋
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Year {user?.year || 4} · {user?.batch || 'Batch A'} · {user?.department || 'Computer Science & Engineering'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/student/assessments')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ClipboardList size={15} /> My Assessments ({uncompletedTests.length})
          </button>
        </div>
      </div>

      {/* P1: Onboarding banner — shown for new students with no skills or projects yet */}
      {verifiedSkills.length === 0 && projects.length === 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-violet-900/30 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <Compass size={18} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-white">🚀 Welcome to Kollab! Let's set you up.</p>
              <p className="text-xs text-slate-400 mt-0.5">Complete these 3 steps to activate your placement profile and start earning skill badges.</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#0f172a] border border-[#1e293b] text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-slate-500" /> Join or Create a Project
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#0f172a] border border-[#1e293b] text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-slate-500" /> Take a Skill Assessment
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#0f172a] border border-[#1e293b] text-[10px] font-semibold text-slate-300 flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-slate-500" /> Complete Your Profile
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate('/student/projects')}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
            >
              Get Started →
            </button>
          </div>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Trust Score" value={user?.trustScore || 85} subtitle={user?.trustScore ? `Trust score rating` : "Verified rating"} icon={<Award size={20} />}>
          <TrustScoreGauge score={user?.trustScore || 85} size={60} showLabel={false} />
        </StatCard>

        <StatCard
          title="Skills Verified"
          value={verifiedSkills.length}
          subtitle="Verified skill badges"
          icon={<Award size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />

        <StatCard
          title="Projects Joined"
          value={projects.length}
          subtitle={`${completedProjectsCount} Completed · ${activeProjects.length} Active`}
          icon={<FolderKanban size={20} />}
          iconBg="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />

        <StatCard
          title="Assessments Taken"
          value={testHistory.length}
          subtitle={testHistory.length > 0 ? `${testHistory.length} tests completed` : "No tests taken"}
          icon={<ClipboardList size={20} />}
          iconBg="bg-violet-500/10 text-violet-400 border border-violet-500/20"
        />
      </div>

      {/* Main 2-Column Content Grid - Perfectly Balanced 6:6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Pending Tests, Projects & Verified Skill Badges */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Assigned Assessments Card */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <ClipboardList size={18} className="text-indigo-400" /> Pending Proctored Tests
                </h3>
                {uncompletedTests.length > 0 ? (
                  <button
                    onClick={() => navigate('/student/assessments')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                  >
                    View All ({uncompletedTests.length}) →
                  </button>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Up to Date
                  </span>
                )}
              </div>

              {uncompletedTests.length > 0 ? (
                <div className="space-y-2.5">
                  {uncompletedTests.slice(0, 3).map((t) => (
                    <div key={t.id} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 flex items-center justify-between text-xs transition-all">
                      <div>
                        <h4 className="font-bold text-white text-sm">{t.title || `${t.skillName} Assessment`}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t.questionCount || 20} Questions · {t.timeLimit || 45} Mins
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/student/test/${t.id}`)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                      >
                        Start Test <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#080d18] border border-[#1e293b] text-center space-y-2">
                  <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
                  <p className="text-xs font-semibold text-slate-300">All assigned tests completed!</p>
                  <p className="text-[11px] text-slate-500">You have completed all pending assessments.</p>
                </div>
              )}
            </div>

            {/* Active Projects Card */}
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <FolderKanban size={18} className="text-amber-400" /> Collaborative Projects
                </h3>
                <button
                  onClick={() => navigate('/student/projects')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  View All →
                </button>
              </div>

              {activeProjects.length > 0 ? (
                <div className="space-y-2.5">
                  {activeProjects.slice(0, 2).map((p) => (
                    <div key={p.id} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-bold text-white text-sm">{p.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{p.techStack?.slice(0, 3).join(' · ')}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-xl bg-[#080d18] border border-[#1e293b] text-center space-y-2">
                  <FolderKanban size={28} className="mx-auto text-slate-600" />
                  <p className="text-xs font-semibold text-slate-300">No active projects</p>
                  <button
                    onClick={() => navigate('/student/teammates')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
                  >
                    Find Teammates →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Verified Skill Badges Card (Placed at bottom of left column for height symmetry) */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" /> Verified Skill Badges
              </h3>
              <span className="text-xs font-bold text-emerald-400">{verifiedSkills.length} Verified</span>
            </div>

            {verifiedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {verifiedSkills.map((sk: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"
                  >
                    <Award size={13} /> {sk.name} ({sk.score || 85}%)
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 pt-1">No verified skill badges yet. Complete proctored assessments to earn badges.</p>
            )}
          </div>
        </div>

        {/* Right Column: Placement Readiness & Quick Tools */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          {/* Placement Guidance Card */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Target size={18} /> Placement Readiness
              </div>
              {readiness && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {readiness.readinessScore}% Score
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => navigate('/student/teammates')}
                className="p-3.5 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 cursor-pointer flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-400">
                    <UserPlus size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-400">Find Project Teammates</h4>
                    <p className="text-[10px] text-slate-400">Matched peer recommendations</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </div>

              <div
                onClick={() => navigate('/student/ai-tools')}
                className="p-3.5 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 cursor-pointer flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-600/10 text-emerald-400">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400">Resume Optimizer</h4>
                    <p className="text-[10px] text-slate-400">Generate high-impact action bullets</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </div>

              <div
                onClick={() => navigate('/student/analytics')}
                className="p-3.5 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 cursor-pointer flex items-center justify-between group transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-violet-600/10 text-violet-400">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-violet-400">Skill Growth Analytics</h4>
                    <p className="text-[10px] text-slate-400">Track peer ranking and readiness level</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </div>
            </div>
          </div>

          {/* Growth Action Plan */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-3 flex-1 flex flex-col justify-between mt-6">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2 mb-3">
                <Compass size={18} className="text-indigo-400" /> Placement Action Plan
              </h3>
              {readiness?.recommendations && readiness.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {readiness.recommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-slate-300 flex items-start gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2">
                  <li className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 mt-1 shrink-0" />
                    <span>Attempt proctored assessments in Python or React to verify 2 more skill badges.</span>
                  </li>
                  <li className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                    <span>Complete pending Kanban tasks on your active collaborative project to boost contribution velocity.</span>
                  </li>
                  <li className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-slate-300 flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 mt-1 shrink-0" />
                    <span>High CGPA unlocked eligibility for Tier-1 Amazon & Google campus placement drives.</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



