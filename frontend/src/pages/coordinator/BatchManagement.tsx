import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOCK_BATCHES } from '@/utils/mockData'
import { DEPARTMENTS } from '@/utils/constants'
import { Plus, Users, Award, FolderKanban, CheckCircle, Eye, Edit3, Archive, X } from 'lucide-react'
import CustomSelect from '@/components/shared/CustomSelect'

export default function BatchManagement() {
  const navigate = useNavigate()
  const [batches, setBatches] = useState(MOCK_BATCHES)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [dept, setDept] = useState(DEPARTMENTS[0])
  const [year, setYear] = useState('3')
  const [section, setSection] = useState('Batch A')
  const [coordinatorName, setCoordinatorName] = useState('Prof. Sarah Jenkins')
  const [academicYear, setAcademicYear] = useState('2025-2026')

  useEffect(() => {
    document.title = 'Batches — Kollab'
  }, [])

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault()
    const newBatch = {
      id: `b${Date.now()}`,
      name: `${dept} - Year ${year} (${section})`,
      department: dept,
      year: Number(year),
      section: section,
      coordinator: coordinatorName,
      totalStudents: 40,
      skillVerified: 0,
      activeProjects: 0,
      placementReady: 0,
      readinessPercent: 0,
      academicYear: academicYear,
      status: 'Active' as const
    }
    setBatches([newBatch, ...batches])
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Batch Management</h2>
          <p className="text-xs text-slate-400">Track and create department student cohorts across 4 years</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={16} /> Create New Batch
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <div
            key={batch.id}
            className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {batch.academicYear}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                    batch.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : batch.status === 'Upcoming'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}
                >
                  {batch.status}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-white mb-1">{batch.name}</h3>
              <p className="text-xs text-slate-400 mb-4">Coordinator: {batch.coordinator}</p>

              {/* 4 Mini Stats Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-indigo-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Students</span>
                    <span className="font-bold text-white">{batch.totalStudents}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award size={14} className="text-emerald-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Verified</span>
                    <span className="font-bold text-white">{batch.skillVerified}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FolderKanban size={14} className="text-amber-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Projects</span>
                    <span className="font-bold text-white">{batch.activeProjects}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-violet-400" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Readiness</span>
                    <span className="font-bold text-white">{batch.readinessPercent}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-400">Cohort Readiness</span>
                <span className="font-bold text-emerald-400">{batch.readinessPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${batch.readinessPercent}%` }}
                />
              </div>
            </div>

            {/* 3 Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#1e293b]">
              <button
                onClick={() => navigate('/coordinator/students')}
                className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-indigo-500/20"
              >
                <Eye size={14} /> View Students
              </button>
              <button className="p-1.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-400 hover:text-white">
                <Edit3 size={14} />
              </button>
              <button className="p-1.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-400 hover:text-rose-400">
                <Archive size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Dashed Add Card */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-6 rounded-2xl border-2 border-dashed border-[#1e293b] hover:border-indigo-500/50 bg-[#0f172a]/40 hover:bg-[#0f172a] transition-all flex flex-col items-center justify-center text-center space-y-3 min-h-[280px]"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
            <Plus size={24} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Add New Batch</h4>
            <p className="text-xs text-slate-400">Setup a new academic section cohort</p>
          </div>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Create New Batch</h3>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                <CustomSelect
                  value={dept}
                  onChange={setDept}
                  options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                  <CustomSelect
                    value={year}
                    onChange={setYear}
                    options={[
                      { value: '1', label: 'Year 1' },
                      { value: '2', label: 'Year 2' },
                      { value: '3', label: 'Year 3' },
                      { value: '4', label: 'Year 4' }
                    ]}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Section</label>
                  <CustomSelect
                    value={section}
                    onChange={setSection}
                    options={[
                      { value: 'Batch A', label: 'Batch A' },
                      { value: 'Batch B', label: 'Batch B' },
                      { value: 'Batch C', label: 'Batch C' }
                    ]}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coordinator Name</label>
                <input
                  type="text"
                  value={coordinatorName}
                  onChange={(e) => setCoordinatorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
