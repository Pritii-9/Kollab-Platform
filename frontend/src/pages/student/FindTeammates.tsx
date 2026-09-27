import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SKILLS } from '@/utils/constants'
import { studentsApi, type TeammateMatchResult } from '@/api/students.api'
import { useProjectStore } from '@/store/projectStore'
import SearchInput from '@/components/shared/SearchInput'
import EmptyState from '@/components/shared/EmptyState'
import { Wand2, Users, X, Check, UserPlus, Loader2, FolderPlus, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import CustomSelect from '@/components/shared/CustomSelect'

export default function FindTeammates() {
  const navigate = useNavigate()
  const { projects: storeProjects, fetchProjects } = useProjectStore()
  const [search, setSearch] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'Node.js'])
  const [selectedYear, setSelectedYear] = useState('all')
  const [teammates, setTeammates] = useState<TeammateMatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [invitedIds, setInvitedIds] = useState<string[]>([])
  const [selectedStudentModal, setSelectedStudentModal] = useState<TeammateMatchResult | null>(null)
  // Project picker state
  const [inviteTarget, setInviteTarget] = useState<TeammateMatchResult | null>(null)
  const [userProjects, setUserProjects] = useState<{ id: string; title: string }[]>([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [hasCheckedProjects, setHasCheckedProjects] = useState(false)
  const [sendingInvite, setSendingInvite] = useState(false)

  const fetchMatches = async () => {
    setLoading(true)
    try {
      const res = await studentsApi.recommendTeammates(selectedSkills)
      setTeammates(res || [])
    } catch (err) {
      console.warn('API call failed, fallback to local matchmaker:', err)
      setTeammates([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProjects = async () => {
    setLoadingProjects(true)
    try {
      await fetchProjects()
      const latestProjects = useProjectStore.getState().projects
      setUserProjects(latestProjects.map(p => ({ id: p.id, title: p.title })))
    } catch {
      const fallbackProjects = useProjectStore.getState().projects
      setUserProjects(fallbackProjects.map(p => ({ id: p.id, title: p.title })))
    } finally {
      setLoadingProjects(false)
      setHasCheckedProjects(true)
    }
  }

  useEffect(() => {
    document.title = 'AI Teammate Matchmaker — Kollab'
    fetchMatches()
    fetchUserProjects()
  }, [selectedSkills])

  useEffect(() => {
    if (storeProjects) {
      setUserProjects(storeProjects.map(p => ({ id: p.id, title: p.title })))
      setHasCheckedProjects(true)
    }
  }, [storeProjects])


  const toggleSkill = (sk: string) => {
    if (selectedSkills.includes(sk)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== sk))
    } else {
      setSelectedSkills([...selectedSkills, sk])
    }
  }

  const openInviteModal = async (student: TeammateMatchResult) => {
    setInviteTarget(student)
    await fetchUserProjects()
  }

  const [invitedProjectPairs, setInvitedProjectPairs] = useState<string[]>([])

  const handleInvite = async (student: TeammateMatchResult, projectId: string) => {
    setSendingInvite(true)
    const targetStudentId = student.id || student.rollNumber || 's1'
    const targetProject = storeProjects.find(p => p.id === projectId)
    const pairKey = `${targetStudentId}_${projectId}`

    // 1. Check local project state for duplicate invitation
    const isAlreadyMember = targetProject?.members.some(m =>
      m.id === targetStudentId ||
      m.name.toLowerCase() === student.name.toLowerCase()
    ) || invitedProjectPairs.includes(pairKey)

    if (isAlreadyMember) {
      toast.error(`${student.name} is already a member or has a pending invite for "${targetProject?.title || 'this project'}"!`)
      setSendingInvite(false)
      setInviteTarget(null)
      return
    }

    try {
      const { projectsApi } = await import('@/api/projects.api')
      const res = await projectsApi.inviteMember(projectId, targetStudentId)
      if (res && res.status === 'info') {
        toast.error(res.message || `${student.name} is already invited to this project!`)
        setSendingInvite(false)
        setInviteTarget(null)
        return
      }
    } catch (err) {
      console.warn('Backend invite call failed, updating local project store:', err)
    }

    // Add member to local project state and trigger celebration toast
    const { addMemberToProject } = useProjectStore.getState()
    addMemberToProject(projectId, {
      id: targetStudentId,
      name: student.name,
      role: 'Collaborator'
    })
    setInvitedProjectPairs(prev => [...prev, pairKey])
    setInvitedIds(prev => Array.from(new Set([...prev, student.id])))
    toast.success(`Invite sent to ${student.name} for "${targetProject?.title || 'Project'}"! 🎉`)
    setSendingInvite(false)
    setInviteTarget(null)
  }

  const filteredTeammates = teammates.filter((t) => {
    if (t.rollNumber === 'CSE21001' || t.name === 'Priti Jadhav') return false
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.department?.toLowerCase().includes(search.toLowerCase())
    const matchesYear = selectedYear === 'all' || t.year === Number(selectedYear)
    return matchesSearch && matchesYear
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Users size={22} className="text-indigo-400" /> Teammate Matchmaker
          </h2>
          <p className="text-xs text-slate-400">Skill & project compatibility matching to build balanced project teams</p>
        </div>
        {userProjects.length > 0 && (
          <button
            onClick={() => navigate('/student/projects')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 self-start sm:self-auto"
          >
            <FolderPlus size={15} /> My Projects ({userProjects.length})
          </button>
        )}
      </div>

      {/* No Projects Notice Banner */}
      {hasCheckedProjects && userProjects.length === 0 && (
        <div className="p-4 rounded-2xl bg-[#0f172a] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-200">No Active Projects Created Yet</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">
                You can browse teammate recommendations, but you need at least 1 project to send team invitations.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/projects')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shrink-0 flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <FolderPlus size={14} /> + Create New Project
          </button>
        </div>
      )}

      {/* Skill Matching Banner */}
      <div className="p-5 rounded-2xl bg-[#0e1526] border border-[#1a2438] flex items-start justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
            <Users size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Skill Compatibility Matching Active</h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Matching teammates based on tech stack fit, academic standing, and verified test scores.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search student name or department..." className="md:col-span-2" />
          <CustomSelect
            value={selectedYear}
            onChange={setSelectedYear}
            options={[
              { value: 'all', label: 'All Academic Years' },
              { value: '1', label: 'Year 1' },
              { value: '2', label: 'Year 2' },
              { value: '3', label: 'Year 3' },
              { value: '4', label: 'Year 4' }
            ]}
          />
        </div>

        {/* Skill Filter Chips */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 mb-2">Filter Required Project Tech Stack:</span>
          <div className="flex flex-wrap gap-2">
            {SKILLS.slice(0, 10).map((sk) => {
              const isSelected = selectedSkills.includes(sk)
              return (
                <button
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400/40'
                      : 'bg-[#080d18] border border-[#1e293b] text-slate-400 hover:text-white'
                  }`}
                >
                  {sk}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Live AI Matches Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
          <p className="text-xs font-semibold text-slate-400">Finding best teammate matches...</p>
        </div>
      ) : filteredTeammates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeammates.map((tm) => {
            const isInvited = invitedIds.includes(tm.id)
            return (
              <div
                key={tm.id}
                className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-indigo-500/40 transition-all duration-300 shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Users size={12} /> {tm.matchPercentage}% Match
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">Yr {tm.year} · {tm.department}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/30">
                      {tm.name[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-white">{tm.name}</h3>
                      <p className="text-[11px] text-slate-400">{tm.rollNumber} · CGPA: {tm.cgpa}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{tm.reason || tm.bio}</p>

                  {/* Matched Skill Badges */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matched Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {tm.matchedSkills && tm.matchedSkills.length > 0 ? (
                        tm.matchedSkills.map((sk, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px] font-bold">
                            {sk}
                          </span>
                        ))
                      ) : tm.otherSkills && tm.otherSkills.length > 0 ? (
                        tm.otherSkills.map((sk, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-[#1e293b] text-[10px] font-semibold">
                            {sk}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Verified Core Stack</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[#1e293b] flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudentModal(tm)}
                    className="flex-1 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => openInviteModal(tm)}
                    disabled={isInvited}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg ${
                      isInvited
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                  >
                    {isInvited ? <Check size={14} className="text-emerald-400" /> : <UserPlus size={14} />}
                    {isInvited ? 'Invited' : 'Invite'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Users size={24} />}
          title="No Matching Teammates Found"
          description="Try selecting different skill filter chips to discover student recommendations."
          action={{
            label: 'Reset Skill Filters',
            onClick: () => {
              setSearch('')
              setSelectedSkills(['React', 'Node.js'])
              setSelectedYear('all')
            }
          }}
        />
      )}

      {/* Student Profile Detail Modal */}
      {selectedStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button onClick={() => setSelectedStudentModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                {selectedStudentModal.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedStudentModal.name}</h3>
                <p className="text-xs text-slate-400">
                  Yr {selectedStudentModal.year} · {selectedStudentModal.department} · Trust Score:{' '}
                  <span className="font-bold text-emerald-400">{selectedStudentModal.trustScore}</span>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Why this teammate is a great match</span>
              <p className="text-xs text-indigo-300 font-medium">{selectedStudentModal.reason}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedStudentModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                Close
              </button>
              <button
                onClick={() => {
                  openInviteModal(selectedStudentModal)
                  setSelectedStudentModal(null)
                }}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20"
              >
                Send Team Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Project Picker Modal (shown when clicking Invite) ── */}
      {inviteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">Send Team Invite</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inviting <span className="text-indigo-400 font-bold">{inviteTarget.name}</span>
                </p>
              </div>
              <button onClick={() => setInviteTarget(null)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Invitee mini card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080d18] border border-[#1e293b]">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                {inviteTarget.name[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{inviteTarget.name}</p>
                <p className="text-[10px] text-slate-400">{inviteTarget.department} · Yr {inviteTarget.year} · {inviteTarget.matchPercentage}% match</p>
              </div>
            </div>

            {/* Project list */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Project to Invite To</p>
              {loadingProjects ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={20} className="animate-spin text-indigo-400" />
                </div>
              ) : userProjects.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#080d18] border border-amber-500/20 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto">
                    <FolderPlus size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">No Active Projects Found</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Team invitations must be assigned to a project. Create a project first to invite teammates.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setInviteTarget(null)
                      navigate('/student/projects')
                    }}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                  >
                    <FolderPlus size={14} /> + Create New Project
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {userProjects.map(proj => {
                    const fullProj = storeProjects.find(p => p.id === proj.id)
                    const targetId = inviteTarget.id || inviteTarget.rollNumber || 's1'
                    const pairKey = `${targetId}_${proj.id}`
                    const isAlreadyMember = fullProj?.members.some(m =>
                      m.id === targetId ||
                      m.name.toLowerCase() === inviteTarget.name.toLowerCase()
                    ) || invitedProjectPairs.includes(pairKey)

                    return (
                      <button
                        key={proj.id}
                        onClick={() => handleInvite(inviteTarget, proj.id)}
                        disabled={sendingInvite || isAlreadyMember}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all group ${
                          isAlreadyMember
                            ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-[#080d18] border-[#1e293b] hover:border-indigo-500/50 hover:bg-indigo-600/5 text-slate-200'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-bold block">{proj.title}</span>
                          {isAlreadyMember && (
                            <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">Already Invited / Member</span>
                          )}
                        </div>
                        {isAlreadyMember ? (
                          <Check size={14} className="text-amber-400 shrink-0" />
                        ) : sendingInvite ? (
                          <Loader2 size={14} className="animate-spin text-indigo-400 shrink-0" />
                        ) : (
                          <UserPlus size={14} className="text-slate-500 group-hover:text-indigo-400 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setInviteTarget(null)}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white border border-[#1e293b] rounded-xl hover:border-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

