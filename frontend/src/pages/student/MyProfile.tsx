import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import PlacementStatusBadge from '@/components/student/PlacementStatusBadge'
import SkillBadge from '@/components/student/SkillBadge'
import { 
  Code, Edit3, Plus, X, Check, Award, FolderGit2, Star, ExternalLink, 
  Shield, GraduationCap, Users, ClipboardList, Megaphone, BarChart2, Briefcase, ArrowRight, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsApi } from '@/api/projects.api'
import { batchesApi } from '@/api/batches.api'
import { studentsApi } from '@/api/students.api'
import { testsApi } from '@/api/tests.api'

export default function MyProfile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  const isCoordinator = user?.role === 'coordinator'
  
  const [userSkills, setUserSkills] = useState<any[]>(user?.skills || [
    { id: 'sk-1', name: 'React', score: 92, level: 'Advanced', status: 'Verified' },
    { id: 'sk-2', name: 'Python', score: 88, level: 'Advanced', status: 'Verified' },
    { id: 'sk-3', name: 'FastAPI', score: 90, level: 'Advanced', status: 'Verified' },
    { id: 'sk-4', name: 'Docker', score: 82, level: 'Intermediate', status: 'Verified' },
  ])

  const [userProjects, setUserProjects] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  // Real DB states for Coordinator
  const [dbBatches, setDbBatches] = useState<any[]>([])
  const [dbStudents, setDbStudents] = useState<any[]>([])
  const [dbTests, setDbTests] = useState<any[]>([])
  const [dbAttempts, setDbAttempts] = useState<any[]>([])
  const [dbProjects, setDbProjects] = useState<any[]>([])
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false)

  const [activeTab, setActiveTab] = useState<string>('overview')
  const [showAddSkillModal, setShowAddSkillModal] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillScore, setNewSkillScore] = useState(85)
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate')

  const profileName = user?.name || (user as any)?.full_name || (isCoordinator ? 'Placement Coordinator' : 'Student')
  const profileId = isCoordinator 
    ? ((user as any)?.staff_id || (user as any)?.rollNumber || 'COORD-FACULTY') 
    : ((user as any)?.rollNumber || (user as any)?.roll_number || '2024CS101')
  const department = (user as any)?.department || 'Computer Science & Engineering'

  // Fetch student profile or coordinator admin data from Real Database APIs
  useEffect(() => {
    document.title = isCoordinator ? 'Coordinator Profile — Kollab' : 'My Profile — Kollab'
    
    if (isCoordinator) {
      const fetchAdminData = async () => {
        setIsLoadingAdminData(true)
        try {
          const [bList, sList, tList, aList, pList] = await Promise.all([
            batchesApi.listBatches().catch(() => []),
            studentsApi.getRoster().catch(() => []),
            testsApi.listTests().catch(() => []),
            testsApi.getTestAttempts().catch(() => []),
            projectsApi.listProjects().catch(() => [])
          ])
          setDbBatches(bList || [])
          setDbStudents(sList || [])
          setDbTests(tList || [])
          setDbAttempts(aList || [])
          setDbProjects(pList || [])
        } catch (err) {
          console.error('Failed to fetch admin data from database:', err)
        } finally {
          setIsLoadingAdminData(false)
        }
      }
      fetchAdminData()
    } else {
      const fetchProfileData = async () => {
        try {
          const profile = await studentsApi.getMyProfile()
          if (profile) {
            updateUser({
              name: profile.name,
              cgpa: profile.cgpa,
              bio: profile.bio,
              github: profile.github,
              department: profile.department,
              rollNumber: profile.rollNumber,
              year: profile.year,
              batch: profile.batch,
              placementStatus: profile.placementStatus,
              trustScore: profile.trustScore
            } as any)
            if (profile.skills && profile.skills.length > 0) {
              setUserSkills(profile.skills)
            }
          }
        } catch {
          // Fallback to auth store
        }

        try {
          setIsLoadingProjects(true)
          const projList = await projectsApi.listProjects()
          setUserProjects(projList || [])
        } catch {
          setUserProjects([])
        } finally {
          setIsLoadingProjects(false)
        }
      }
      fetchProfileData()
    }
  }, [isCoordinator])

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      toast.error('Please enter a skill name')
      return
    }
    const created = {
      id: `sk-${Date.now()}`,
      name: newSkillName.trim(),
      score: newSkillScore,
      level: newSkillLevel,
      status: 'Verified'
    }
    const updated = [...userSkills, created]
    setUserSkills(updated)
    updateUser({ skills: updated })
    toast.success(`Skill "${newSkillName.trim()}" added to profile!`)
    setShowAddSkillModal(false)
    setNewSkillName('')
  }

  // Calculated Real DB Statistics for Admin Dashboard
  const realPlacedCount = dbStudents.filter(s => {
    const st = String(s.placementStatus || s.placement_status || '').toLowerCase()
    return st === 'placed'
  }).length

  const realPlacementRate = dbStudents.length > 0 
    ? Math.round((realPlacedCount / dbStudents.length) * 100) 
    : 0

  const realAvgTrustScore = dbStudents.length > 0
    ? Math.round(dbStudents.reduce((acc, s) => acc + Number(s.trustScore || s.trust_score || 0), 0) / dbStudents.length)
    : 0

  // Skill Gap Analysis calculated from real DB student skills
  const requiredSkills = ['System Design', 'Docker', 'PostgreSQL', 'FastAPI', 'React', 'Kubernetes']
  const skillCoverageMap: Record<string, number> = {}
  requiredSkills.forEach(s => { skillCoverageMap[s] = 0 })

  dbStudents.forEach(st => {
    const skillsArr = st.skills || []
    skillsArr.forEach((sk: any) => {
      const skName = typeof sk === 'string' ? sk : sk.name
      if (skName && skillCoverageMap[skName] !== undefined) {
        skillCoverageMap[skName]++
      }
    })
  })

  return (
    <div className="space-y-6">
      {/* Cover Banner */}
      <div className="h-36 rounded-2xl bg-gradient-to-r from-[#0b1329] via-[#0f172a] to-[#151d38] border border-[#1a2438] shadow-xl relative" />

      {/* Main Profile Header Card */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl relative -mt-16 mx-4 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-[#0f172a] shadow-xl ring-2 ring-indigo-500/30">
              {profileName.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl font-extrabold text-white">{profileName}</h2>
                {isCoordinator ? (
                  <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center gap-1.5">
                    <Shield size={14} /> Head Department Coordinator
                  </span>
                ) : (
                  <PlacementStatusBadge status={(user as any)?.placementStatus || 'Searching'} />
                )}
              </div>
              <p className="text-xs font-mono text-indigo-400 mt-1">{profileId}</p>
              <p className="text-xs text-slate-400">
                {department} {isCoordinator ? '· Academic & Placement Leadership' : `· Year ${(user as any)?.year || 4} · CGPA: `}
                {!isCoordinator && <span className="font-bold text-white">{(user as any)?.cgpa || 8.5}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isCoordinator && <TrustScoreGauge score={(user as any)?.trustScore || 94} size={90} />}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate(isCoordinator ? '/coordinator/settings' : '/student/settings')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Edit3 size={14} /> Edit Settings
              </button>
              {isCoordinator && (
                <button
                  onClick={() => navigate('/coordinator/assign-test')}
                  className="px-4 py-2 rounded-xl bg-[#080d18] hover:bg-slate-800 text-slate-200 border border-[#1e293b] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ClipboardList size={14} /> Assign Test
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Coordinator Live DB Overview Stats Bar */}
        {isCoordinator && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Registered Batches</span>
                <p className="text-xl font-extrabold text-white mt-0.5">
                  {isLoadingAdminData ? <Loader2 size={16} className="animate-spin text-slate-500" /> : `${dbBatches.length} Batches`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users size={20} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">Enrolled DB Students</span>
                <p className="text-xl font-extrabold text-indigo-400 mt-0.5">
                  {isLoadingAdminData ? <Loader2 size={16} className="animate-spin text-slate-500" /> : `${dbStudents.length} Students`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">DB Placement Rate</span>
                <p className="text-xl font-extrabold text-emerald-400 mt-0.5">
                  {isLoadingAdminData ? <Loader2 size={16} className="animate-spin text-slate-500" /> : `${realPlacementRate}%`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <BarChart2 size={20} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 font-medium">DB Proctored Exams</span>
                <p className="text-xl font-extrabold text-amber-400 mt-0.5">
                  {isLoadingAdminData ? <Loader2 size={16} className="animate-spin text-slate-500" /> : `${dbTests.length} Created`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <ClipboardList size={20} />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-[#1e293b] gap-6 text-sm font-semibold pt-2">
          {(isCoordinator 
            ? ['overview', 'batches', 'projects', 'gaps', 'tests'] 
            : ['overview', 'skills', 'projects']
          ).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-3 capitalize transition-colors relative ${
                activeTab === t ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'tests' ? 'Created Tests' : t === 'batches' ? 'Department Batches' : t === 'projects' ? 'Project Oversight' : t === 'gaps' ? 'Skill Gap Matrix' : t}
            </button>
          ))}
        </div>

        {/* ── REAL DB COORDINATOR TABS ── */}
        {isCoordinator && activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-2">
              <h4 className="font-bold text-white text-sm">Coordinator Bio & Governance Policy</h4>
              <p className="text-slate-300 leading-relaxed">
                {user?.bio || 'Academic & Placement Coordinator responsible for batch management, proctored skill testing, and placement readiness tracking.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Shield size={16} className="text-indigo-400" /> Real-time System Metrics Summary
                </h4>
                <div className="space-y-2 text-slate-300">
                  <div className="flex justify-between py-1 border-b border-[#1e293b]/60">
                    <span>Average Student Trust Score:</span>
                    <strong className="text-indigo-400">{realAvgTrustScore} / 100</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#1e293b]/60">
                    <span>Total Test Submissions in DB:</span>
                    <strong className="text-emerald-400">{dbAttempts.length} Submissions</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Placed Students in DB:</span>
                    <strong className="text-white">{realPlacedCount} of {dbStudents.length}</strong>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <Briefcase size={16} className="text-emerald-400" /> Department Contact & Credentials
                </h4>
                <div className="space-y-1.5 text-slate-300">
                  <p><strong>Department:</strong> {department}</p>
                  <p><strong>Official Email:</strong> {user?.email || 'coordinator@kollab.edu'}</p>
                  <p><strong>Role Authority:</strong> Full Placement & Assessment Coordinator</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCoordinator && activeTab === 'batches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Department Batches in Database</h3>
                <p className="text-xs text-slate-400">Live records from backend database tables</p>
              </div>
              <button
                onClick={() => navigate('/coordinator/batches')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Users size={14} /> Open Batch Management
              </button>
            </div>

            {isLoadingAdminData ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-400" /> Loading database batches...
              </div>
            ) : dbBatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dbBatches.map((b) => (
                  <div key={b.id || b._id} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 transition-all space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{b.department || department} - Section {b.section || 'A'}</h4>
                        <p className="text-[11px] text-slate-400">Year {b.year} ({b.academic_year || b.academicYear || 'Current'})</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {b.studentCount || b.student_count || 0} Students
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Coordinator: <strong className="text-slate-200">{b.coordinator || user?.name || 'Assigned'}</strong></p>
                    <button
                      onClick={() => navigate('/coordinator/students')}
                      className="w-full py-1.5 rounded-lg bg-[#0f172a] border border-[#1e293b] hover:border-slate-600 text-xs text-slate-300 hover:text-white font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      View Student Roster <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[#080d18] border border-[#1e293b] text-center space-y-3">
                <Users size={32} className="mx-auto text-slate-600" />
                <p className="text-slate-300 text-xs font-semibold">No batches created in the database yet.</p>
                <button
                  onClick={() => navigate('/coordinator/batches')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
                >
                  + Create First Batch
                </button>
              </div>
            )}
          </div>
        )}

        {isCoordinator && activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Department Project Portfolio Oversight</h3>
                <p className="text-xs text-slate-400">Audit all live software projects created across student teams</p>
              </div>
              <button
                onClick={() => navigate('/coordinator/reports')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <BarChart2 size={14} /> View Analytics Reports
              </button>
            </div>

            {isLoadingAdminData ? (
              <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-400" /> Loading student projects...
              </div>
            ) : dbProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dbProjects.map((p) => {
                  const techList = p.techStack || p.tech_stack || ['React', 'FastAPI', 'Python']
                  const isCompleted = p.status === 'COMPLETED' || p.status === 'Completed'
                  return (
                    <div key={p.id} className="p-5 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 transition-all space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide mb-1.5 ${
                            isCompleted 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                          }`}>
                            {p.status || 'IN PROGRESS'} · {p.sprint || 'Sprint Active'}
                          </span>
                          <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                            {p.title}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-400">
                          <span>Progress: <strong className="text-emerald-400">{p.progress || 80}%</strong></span>
                          <span>Team Size: <strong className="text-white">{p.teamSize || 4} Members</strong></span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                            style={{ width: `${p.progress || 80}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between pt-2 text-xs border-t border-[#1e293b]/60 gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {techList.slice(0, 4).map((tech: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#0f172a] border border-[#1e293b] text-[10px] font-semibold text-slate-300">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[#080d18] border border-[#1e293b] text-center space-y-3">
                <FolderGit2 size={32} className="mx-auto text-slate-600" />
                <p className="text-slate-300 text-xs font-semibold">No student projects created in database yet.</p>
              </div>
            )}
          </div>
        )}

        {isCoordinator && activeTab === 'gaps' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Department Skill Gap & Placement Vulnerability Matrix</h3>
                <p className="text-xs text-slate-400">Automated AI breakdown of verified student skills vs industry hiring requirements</p>
              </div>
              <button
                onClick={() => navigate('/coordinator/assign-test')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Plus size={14} /> Assign Remedial Test
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-3">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <BarChart2 size={16} className="text-indigo-400" /> Skill Verification Coverage in Database
                </h4>
                <div className="space-y-2 text-xs">
                  {requiredSkills.map((sk) => {
                    const count = skillCoverageMap[sk] || 0
                    const pct = dbStudents.length > 0 ? Math.round((count / dbStudents.length) * 100) : 0
                    return (
                      <div key={sk} className="space-y-1">
                        <div className="flex justify-between text-slate-300 font-medium">
                          <span>{sk}</span>
                          <span>{count} / {dbStudents.length} Students ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct > 60 ? 'bg-emerald-500' : pct > 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${Math.max(pct, 8)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-4">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Shield size={16} className="text-amber-400" /> Coordinator Intervention Directives
                </h4>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3 rounded-lg bg-[#0f172a] border border-[#1e293b]">
                    <span className="font-bold text-white block mb-1">1. Docker & Containerization Deficit</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Assign a targeted proctored assessment on Docker & Container Deployment to boost student trust scores.</p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#0f172a] border border-[#1e293b]">
                    <span className="font-bold text-white block mb-1">2. System Architecture Readiness Gap</span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">Schedule mock placement tests for final year students lacking verified System Design badges.</p>
                  </div>

                  <button
                    onClick={() => navigate('/coordinator/assign-test')}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-colors"
                  >
                    Assign Batch Assessment Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── STUDENT TABS ── */}
        {!isCoordinator && activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-2">
              <h4 className="font-bold text-white text-sm">Student Bio & Placement Goal</h4>
              <p className="text-slate-300 leading-relaxed">
                {user?.bio || 'Add a bio to your profile in Settings to let recruiters know about your technical interests, system architecture expertise, and placement goals.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Verified Skills</span>
                <p className="text-xl font-extrabold text-white">{userSkills.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Active Software Projects</span>
                <p className="text-xl font-extrabold text-indigo-400">{userProjects.length}</p>
              </div>
              <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Trust Score Rating</span>
                <p className="text-xl font-extrabold text-emerald-400">{(user as any)?.trustScore || 94}/100</p>
              </div>
            </div>
          </div>
        )}

        {!isCoordinator && activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Verified Skill Badges & Benchmark Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">Skills listed here feed into your AI Skill Gap Analysis and Recruiter Placement Dossier.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddSkillModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Plus size={14} /> Add Skill
                </button>
                <button
                  onClick={() => navigate('/student/analytics')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#080d18] hover:bg-slate-800 text-slate-200 border border-[#1e293b] text-xs font-bold transition-all cursor-pointer"
                >
                  + Take Skill Test
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {userSkills.length > 0 ? userSkills.map((s: any, idx: number) => (
                <div key={s.id || idx} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between text-xs hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <SkillBadge status={s.status || 'Verified'} />
                    <div>
                      <span className="font-bold text-white text-sm">{s.name}</span>
                      <p className="text-[10px] text-slate-400">Level: <span className="text-indigo-400 font-semibold">{s.level || 'Intermediate'}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full" style={{ width: `${s.score || 85}%` }} />
                    </div>
                    <span className="font-bold text-emerald-400">{s.score || 85}%</span>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-xs text-center py-6">No skills added yet. Click "+ Add Skill" or take a proctored assessment to add your first skill.</p>
              )}
            </div>
          </div>
        )}

        {!isCoordinator && activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Active Software Engineering Portfolio</h3>
                <p className="text-xs text-slate-400">Real-time status tracking of associated team & solo projects</p>
              </div>
              <button
                onClick={() => navigate('/student/projects')}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <FolderGit2 size={14} /> Open My Projects Workspace
              </button>
            </div>

            {isLoadingProjects ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading project portfolio...</div>
            ) : userProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userProjects.map((p: any) => {
                  const techList = p.techStack || p.tech_stack || ['React', 'FastAPI', 'Python']
                  const isCompleted = p.status === 'COMPLETED' || p.status === 'Completed'
                  return (
                    <div key={p.id} className="p-5 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-indigo-500/40 transition-all space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide mb-1.5 ${
                            isCompleted 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                          }`}>
                            {p.status || 'IN PROGRESS'} · {p.sprint || 'Sprint Active'}
                          </span>
                          <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                            {p.title}
                          </h4>
                        </div>
                        <button
                          onClick={() => navigate('/student/projects')}
                          className="p-1.5 rounded-lg bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]"
                          title="Open Project"
                        >
                          <ExternalLink size={14} />
                        </button>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-400">
                          <span>Role: <strong className="text-white">{p.role || 'Contributor'}</strong></span>
                          <span>Progress: <strong className="text-emerald-400">{p.progress || 80}%</strong></span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-violet-500'}`}
                            style={{ width: `${p.progress || 80}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between pt-2 text-xs border-t border-[#1e293b]/60 gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {techList.slice(0, 4).map((tech: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-[#0f172a] border border-[#1e293b] text-[10px] font-semibold text-slate-300">
                              {tech}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Team of {p.teamSize || 4}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-[#080d18] border border-[#1e293b] text-center space-y-3">
                <FolderGit2 size={32} className="mx-auto text-slate-600" />
                <p className="text-slate-300 text-xs font-semibold">No active projects found on your engineering profile.</p>
                <button
                  onClick={() => navigate('/student/projects')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  Create or Join Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── ADD SKILL MODAL ── */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award size={20} className="text-indigo-400" /> Add Technical Skill Badge
              </h3>
              <button
                onClick={() => setShowAddSkillModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200">Skill Name</label>
                <input
                  type="text"
                  placeholder="e.g. React, Python, FastAPI, Docker, PostgreSQL"
                  value={newSkillName}
                  onChange={e => setNewSkillName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200">Proficiency Level</label>
                  <select
                    value={newSkillLevel}
                    onChange={e => setNewSkillLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-200">Benchmark Score</label>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {newSkillScore}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={100}
                    value={newSkillScore}
                    onChange={e => setNewSkillScore(Number(e.target.value))}
                    className="w-full h-2 bg-[#080d18] rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
                  />
                  <div className="flex gap-1 pt-1 justify-between text-[10px]">
                    {[75, 85, 95].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setNewSkillScore(val)}
                        className={`px-2 py-0.5 rounded border text-[10px] font-semibold transition-all ${
                          newSkillScore === val 
                            ? 'bg-indigo-600 text-white border-indigo-500' 
                            : 'bg-[#080d18] text-slate-400 border-[#1e293b] hover:text-white'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={() => setShowAddSkillModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-[#1e293b]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Check size={14} /> Add Skill to Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
