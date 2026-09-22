import { useState, useEffect } from 'react'
import { MOCK_STUDENTS } from '@/utils/mockData'
import { SKILLS } from '@/utils/constants'
import type { StudentCardData } from '@/types/student.types'
import StudentCard from '@/components/student/StudentCard'
import SearchInput from '@/components/shared/SearchInput'
import EmptyState from '@/components/shared/EmptyState'
import { Sparkles, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'
import CustomSelect from '@/components/shared/CustomSelect'

// Initialize empty teammates list
const studentCards: StudentCardData[] = []

export default function FindTeammates() {
  const [search, setSearch] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedStudentModal, setSelectedStudentModal] = useState<StudentCardData | null>(null)

  useEffect(() => {
    document.title = 'Find Teammates — Kollab'
  }, [])

  const toggleSkill = (sk: string) => {
    if (selectedSkills.includes(sk)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== sk))
    } else {
      setSelectedSkills([...selectedSkills, sk])
    }
  }

  const filteredStudents = studentCards.filter((student: StudentCardData) => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase())
    const matchesYear = selectedYear === 'all' || student.year === Number(selectedYear)
    const matchesSkills =
      selectedSkills.length === 0 || selectedSkills.every((sk) => student.skills.includes(sk))
    return matchesSearch && matchesYear && matchesSkills
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">AI-Powered Teammate Matchmaking</h2>
        <p className="text-xs text-slate-400">Discover peers with complementary verified skills for your project team</p>
      </div>

      {/* AI Match Recommendation Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-[#0f172a] border border-indigo-500/30 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 shrink-0">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">AI Skill Gap Recommendations Active</h3>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            Based on your profile, you need a teammate proficient in Python and DevOps to complete your full-stack project team setup.
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchInput value={search} onChange={setSearch} placeholder="Search student name..." className="md:col-span-2" />
          <CustomSelect
            value={selectedYear}
            onChange={setSelectedYear}
            options={[
              { value: 'all', label: 'All Years' },
              { value: '1', label: 'Year 1' },
              { value: '2', label: 'Year 2' },
              { value: '3', label: 'Year 3' },
              { value: '4', label: 'Year 4' }
            ]}
          />
        </div>

        {/* Skill Chips */}
        <div>
          <span className="block text-xs font-semibold text-slate-400 mb-2">Filter by Required Skills:</span>
          <div className="flex flex-wrap gap-2">
            {SKILLS.slice(0, 10).map((sk) => {
              const isSelected = selectedSkills.includes(sk)
              return (
                <button
                  key={sk}
                  onClick={() => toggleSkill(sk)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
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

      {/* Grid of Student Cards */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((st: StudentCardData) => (
            <StudentCard
              key={st.id}
              student={st}
              onViewProfile={() => setSelectedStudentModal(st)}
              onInvite={() => toast.success(`Invitation sent to ${st.name}!`)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users size={24} />}
          title="No Matching Teammates Found"
          description="Try broadening your skill or year filter criteria to discover more students."
          action={{
            label: 'Clear All Filters',
            onClick: () => {
              setSearch('')
              setSelectedSkills([])
              setSelectedYear('all')
            }
          }}
        />
      )}

      {/* Student Profile Dialog Modal */}
      {selectedStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedStudentModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center">
                {selectedStudentModal.name[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{selectedStudentModal.name}</h3>
                <p className="text-xs text-slate-400">
                  Yr {selectedStudentModal.year} · {selectedStudentModal.batch} · Trust Score:{' '}
                  <span className="font-bold text-emerald-400">{selectedStudentModal.trustScore}</span>
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Verified Skill Profile</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudentModal.skills.map((sk: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-600/10 text-indigo-300 text-xs font-semibold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedStudentModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toast.success(`Invitation sent to ${selectedStudentModal.name}!`)
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
