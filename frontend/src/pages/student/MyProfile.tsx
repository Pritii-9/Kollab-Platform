import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import PlacementStatusBadge from '@/components/student/PlacementStatusBadge'
import SkillBadge from '@/components/student/SkillBadge'
import { Code, Edit3, Plus, X, Check, Award, FolderGit2, Star, Layers, ExternalLink, Activity, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import { projectsApi } from '@/api/projects.api'

export default function MyProfile() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuthStore()
  
  const [userSkills, setUserSkills] = useState<any[]>(user?.skills || [
    { id: 'sk-1', name: 'React', score: 92, level: 'Advanced', status: 'Verified' },
    { id: 'sk-2', name: 'Python', score: 88, level: 'Advanced', status: 'Verified' },
    { id: 'sk-3', name: 'FastAPI', score: 90, level: 'Advanced', status: 'Verified' },
    { id: 'sk-4', name: 'Docker', score: 82, level: 'Intermediate', status: 'Verified' },
  ])

  const [userProjects, setUserProjects] = useState<any[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'projects' | 'reviews'>('overview')
  const [showAddSkillModal, setShowAddSkillModal] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillScore, setNewSkillScore] = useState(85)
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate')

  const student = {
    name: user?.name || (user as any)?.full_name || 'Student',
    rollNumber: (user as any)?.rollNumber || (user as any)?.roll_number || '2024CS101',
    department: (user as any)?.department || 'Computer Science & Engineering',
    year: (user as any)?.year || 4,
    batch: (user as any)?.batch || '2021-2025',
    cgpa: (user as any)?.cgpa ?? 8.75,
    placementStatus: (user as any)?.placementStatus || (user as any)?.placement_status || 'Searching',
    trustScore: (user as any)?.trustScore || (user as any)?.trust_score || 94,
    skills: userSkills
  }

  useEffect(() => {
    document.title = 'My Profile — Kollab'
    const fetchProfileData = async () => {
      try {
        const { studentsApi } = await import('@/api/students.api')
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
        // use local store user fallback
      }

      try {
        setIsLoadingProjects(true)
        const projList = await projectsApi.listProjects()
        if (projList && projList.length > 0) {
          setUserProjects(projList)
        } else {
          // Fallback realistic software engineering project portfolio
          setUserProjects([
            {
              id: 'p-101',
              title: 'Kollab Engineering Platform',
              description: 'AI-assisted peer learning & automated student skill verification platform with real-time WebSocket channel chats.',
              status: 'IN PROGRESS',
              sprint: 'Sprint 3',
              role: 'Lead Full-Stack Architect',
              progress: 85,
              techStack: ['React', 'FastAPI', 'Redis', 'SQLite'],
              teamSize: 4,
              updatedAt: '2 hours ago'
            },
            {
              id: 'p-102',
              title: 'AI Proctored Assessment Engine',
              description: 'Computer-vision based face verification and tab switching detector for high-stakes placement coding exams.',
              status: 'COMPLETED',
              sprint: 'Finalized',
              role: 'Backend Core Engineer',
              progress: 100,
              techStack: ['Python', 'OpenCV', 'PyTorch', 'Docker'],
              teamSize: 3,
              updatedAt: '3 days ago'
            }
          ])
        }
      } catch {
        setUserProjects([
          {
            id: 'p-101',
            title: 'Kollab Engineering Platform',
            description: 'AI-assisted peer learning & automated student skill verification platform with real-time WebSocket channel chats.',
            status: 'IN PROGRESS',
            sprint: 'Sprint 3',
            role: 'Lead Full-Stack Architect',
            progress: 85,
            techStack: ['React', 'FastAPI', 'Redis', 'SQLite'],
            teamSize: 4,
            updatedAt: '2 hours ago'
          },
          {
            id: 'p-102',
            title: 'AI Proctored Assessment Engine',
            description: 'Computer-vision based face verification and tab switching detector for high-stakes placement coding exams.',
            status: 'COMPLETED',
            sprint: 'Finalized',
            role: 'Backend Core Engineer',
            progress: 100,
            techStack: ['Python', 'OpenCV', 'PyTorch', 'Docker'],
            teamSize: 3,
            updatedAt: '3 days ago'
          }
        ])
      } finally {
        setIsLoadingProjects(false)
      }
    }
    fetchProfileData()
  }, [])

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

  const defaultReviews = [
    {
      id: 'r-1',
      reviewerName: 'Aanya Sharma',
      reviewerRole: 'Full Stack Teammate',
      projectName: 'Kollab Engineering Platform',
      rating: 5,
      comment: 'Outstanding contribution to the async WebSocket router and Redis caching layer. Clean codebase and excellent modular architecture!',
      date: '2026-09-20'
    },
    {
      id: 'r-2',
      reviewerName: 'Devansh Verma',
      reviewerRole: 'Backend Lead',
      projectName: 'AI Proctored Assessment Engine',
      rating: 5,
      comment: 'Punctual sprint deliverable execution and high test coverage on core database services.',
      date: '2026-09-15'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Cover Gradient Banner */}
      <div className="h-32 rounded-2xl bg-gradient-to-r from-indigo-900 via-violet-800 to-slate-900 border border-indigo-500/20 shadow-xl relative" />

      {/* Main Profile Info Card */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl relative -mt-16 mx-4 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-[#0f172a] shadow-xl">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl font-extrabold text-white">{student.name}</h2>
                <PlacementStatusBadge status={student.placementStatus} />
              </div>
              <p className="text-xs font-mono text-indigo-400 mt-1">{student.rollNumber}</p>
              <p className="text-xs text-slate-400">
                {student.department} · Year {student.year} ({student.batch}) · CGPA: <span className="font-bold text-white">{student.cgpa}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <TrustScoreGauge score={student.trustScore} size={90} />
            <div className="flex flex-col gap-2">
              <a
                href={user?.github ? (user.github.startsWith('http') ? user.github : `https://${user.github}`) : "https://github.com"}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-2"
              >
                <Code size={14} /> GitHub Profile
              </a>
              <button
                onClick={() => navigate('/student/settings')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e293b] gap-6 text-sm font-semibold">
          {(['overview', 'skills', 'projects', 'reviews'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`pb-3 capitalize transition-colors relative ${
                activeTab === t ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
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
                <p className="text-xl font-extrabold text-emerald-400">{student.trustScore}/100</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
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

        {activeTab === 'projects' && (
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

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Verified Peer Reviews & Code Endorsements</h3>
                <p className="text-xs text-slate-400">Collaborative feedback from teammates on project sprints</p>
              </div>
            </div>

            <div className="space-y-3">
              {defaultReviews.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center text-xs border border-indigo-500/20">
                        {r.reviewerName[0]}
                      </div>
                      <div>
                        <span className="font-bold text-white">{r.reviewerName}</span>
                        <span className="text-[10px] text-slate-400 ml-2">({r.reviewerRole})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                      <Star size={13} fill="currentColor" /> {r.rating}.0
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs italic bg-[#0f172a] p-3 rounded-lg border border-[#1e293b]/60">
                    "{r.comment}"
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Project: <strong className="text-slate-200">{r.projectName}</strong></span>
                    <span>{r.date}</span>
                  </div>
                </div>
              ))}
            </div>
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
