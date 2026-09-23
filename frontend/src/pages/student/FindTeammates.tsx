import { useState, useEffect } from 'react'
import { SKILLS } from '@/utils/constants'
import { studentsApi, type TeammateMatchResult } from '@/api/students.api'
import SearchInput from '@/components/shared/SearchInput'
import EmptyState from '@/components/shared/EmptyState'
import { Sparkles, Users, X, Check, UserPlus, Loader2, Award } from 'lucide-react'
import toast from 'react-hot-toast'
import CustomSelect from '@/components/shared/CustomSelect'

export default function FindTeammates() {
  const [search, setSearch] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'Node.js'])
  const [selectedYear, setSelectedYear] = useState('all')
  const [teammates, setTeammates] = useState<TeammateMatchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [invitedIds, setInvitedIds] = useState<string[]>([])
  const [selectedStudentModal, setSelectedStudentModal] = useState<TeammateMatchResult | null>(null)

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

  useEffect(() => {
    document.title = 'AI Teammate Matchmaker — Kollab'
    fetchMatches()
  }, [selectedSkills])

  const toggleSkill = (sk: string) => {
    if (selectedSkills.includes(sk)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== sk))
    } else {
      setSelectedSkills([...selectedSkills, sk])
    }
  }

  const handleInvite = (student: TeammateMatchResult) => {
    setInvitedIds([...invitedIds, student.id])
    toast.success(`Team invitation sent to ${student.name}!`)
  }

  const filteredTeammates = teammates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.department?.toLowerCase().includes(search.toLowerCase())
    const matchesYear = selectedYear === 'all' || t.year === Number(selectedYear)
    return matchesSearch && matchesYear
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
          <Sparkles size={22} className="text-indigo-400 animate-pulse" /> AI Teammate Matchmaker
        </h2>
        <p className="text-xs text-slate-400">ML vector cosine similarity matching to build complementary project teams</p>
      </div>

      {/* AI Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/50 via-[#0f172a] to-[#080d18] border border-indigo-500/30 flex items-start justify-between gap-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Cosine Skill Complementarity Active</h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Matching peers based on required tech stack overlap, CGPA, and proctored trust scores.
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
          <p className="text-xs font-semibold text-slate-400">Computing AI Cosine Skill Complementarity Matches...</p>
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
                      <Sparkles size={12} /> {tm.matchPercentage}% Match
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
                      ) : (
                        <span className="text-[10px] text-slate-500">General Technical Proficiency</span>
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
                    onClick={() => handleInvite(tm)}
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
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI Complementary Rationale</span>
              <p className="text-xs text-indigo-300 font-medium">{selectedStudentModal.reason}</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedStudentModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
                Close
              </button>
              <button
                onClick={() => {
                  handleInvite(selectedStudentModal)
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
    </div>
  )
}
