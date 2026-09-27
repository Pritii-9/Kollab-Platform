import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { batchesApi } from '@/api/batches.api'
import type { Batch } from '@/types/batch.types'
import { DEPARTMENTS } from '@/utils/constants'
import { Plus, Users, Award, FolderKanban, CheckCircle, Eye, Edit3, Trash2, X, Loader2, AlertTriangle } from 'lucide-react'
import CustomSelect from '@/components/shared/CustomSelect'
import { useCacheStore } from '@/store/cacheStore'

export default function BatchManagement() {
  const navigate = useNavigate()
  const { batches, setBatches } = useCacheStore()
  const [loading, setLoading] = useState(batches.length === 0)
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)
  const [deletingBatch, setDeletingBatch] = useState<Batch | null>(null)

  // Create Form state
  const [dept, setDept] = useState(DEPARTMENTS[0])
  const [year, setYear] = useState('4')
  const [section, setSection] = useState('Batch A')
  const [coordinatorName, setCoordinatorName] = useState('Prof. Sarah Jenkins')
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [submitting, setSubmitting] = useState(false)

  // Edit Form state
  const [editName, setEditName] = useState('')
  const [editCoordinator, setEditCoordinator] = useState('')
  const [editStatus, setEditStatus] = useState<'Active' | 'Completed' | 'Upcoming'>('Active')
  const [editSaving, setEditSaving] = useState(false)

  useEffect(() => {
    document.title = 'Batches — Kollab'
    loadBatches()
  }, [])

  const loadBatches = async () => {
    try {
      const data = await batchesApi.listBatches()
      if (data && data.length > 0) setBatches(data)
    } catch (err) {
      console.error('Failed to fetch batches:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    const cleanSection = section.startsWith('Batch ') ? section : `Batch ${section}`
    const cleanName = `${dept} ${cleanSection}`
    try {
      const created = await batchesApi.createBatch({
        department: dept,
        year: Number(year),
        section: cleanSection,
        coordinator: coordinatorName || 'Prof. Sarah Jenkins',
        academicYear: academicYear || '2025-2026',
      })
      setBatches([created, ...batches])
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error('Failed to create batch:', err)
      const newBatch: Batch = {
        id: `b${Date.now()}`,
        name: cleanName,
        department: dept,
        year: Number(year),
        section: cleanSection,
        coordinator: coordinatorName || 'Prof. Sarah Jenkins',
        totalStudents: 0,
        skillVerified: 0,
        activeProjects: 0,
        placementReady: 0,
        readinessPercent: 0,
        academicYear: academicYear || '2025-2026',
        status: 'Active'
      }
      setBatches([newBatch, ...batches])
      setIsCreateModalOpen(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setEditName(batch.name)
    setEditCoordinator(batch.coordinator)
    setEditStatus(batch.status)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBatch) return
    setEditSaving(true)
    try {
      const updated = await batchesApi.updateBatch(editingBatch.id, {
        name: editName,
        coordinator: editCoordinator,
        status: editStatus
      })
      setBatches(batches.map(b => b.id === editingBatch.id ? { ...b, ...updated } : b))
      setEditingBatch(null)
    } catch (err) {
      console.error('Failed to update batch:', err)
      // Optimistic update
      setBatches(batches.map(b => b.id === editingBatch.id ? {
        ...b,
        name: editName,
        coordinator: editCoordinator,
        status: editStatus
      } : b))
      setEditingBatch(null)
    } finally {
      setEditSaving(false)
    }
  }

  const handleDeleteBatch = async () => {
    if (!deletingBatch) return
    try {
      await batchesApi.deleteBatch(deletingBatch.id)
    } catch (err) {
      console.error('Failed to delete batch:', err)
    } finally {
      setBatches(batches.filter(b => b.id !== deletingBatch.id))
      setDeletingBatch(null)
    }
  }

  // View mode tab state: 'branches' | 'sections'
  const [viewMode, setViewMode] = useState<'branches' | 'sections'>('branches')

  const matchDept = (bDept: string, bName: string, targetKey: 'CSE' | 'IT' | 'AI&DS' | 'AIML') => {
    const d = (bDept || '').toLowerCase()
    const n = (bName || '').toLowerCase()
    if (targetKey === 'CSE') return d.includes('computer') || d.includes('cse') || n.includes('cse')
    if (targetKey === 'IT') return d.includes('information') || d.includes('it') || n.includes('it')
    if (targetKey === 'AI&DS') return d.includes('data') || d.includes('aids') || d.includes('ai&ds') || n.includes('aids')
    if (targetKey === 'AIML') return d.includes('machine') || d.includes('aiml') || n.includes('aiml')
    return false
  }

  // Branch summaries
  const branchSummaries = [
    {
      id: 'branch-cse',
      name: 'Computer Science & Engineering (CSE)',
      shortCode: 'CSE',
      deptName: 'Computer Science & Engineering',
      academicYear: '2025-2026',
      coordinator: 'Dr. Ravi Shankar',
      sections: batches.filter(b => matchDept(b.department, b.name, 'CSE')),
    },
    {
      id: 'branch-it',
      name: 'Information Technology (IT)',
      shortCode: 'IT',
      deptName: 'Information Technology',
      academicYear: '2025-2026',
      coordinator: 'Prof. Sarah Jenkins',
      sections: batches.filter(b => matchDept(b.department, b.name, 'IT')),
    },
    {
      id: 'branch-aids',
      name: 'Artificial Intelligence & Data Science (AI&DS)',
      shortCode: 'AI&DS',
      deptName: 'Artificial Intelligence & Data Science',
      academicYear: '2025-2026',
      coordinator: 'Dr. Meena Iyer',
      sections: batches.filter(b => matchDept(b.department, b.name, 'AI&DS')),
    },
    {
      id: 'branch-aiml',
      name: 'Artificial Intelligence & Machine Learning (AIML)',
      shortCode: 'AIML',
      deptName: 'Artificial Intelligence & Machine Learning',
      academicYear: '2025-2026',
      coordinator: 'Prof. Sarah Jenkins',
      sections: batches.filter(b => matchDept(b.department, b.name, 'AIML')),
    },
  ].map(branch => {
    const totalStuds = branch.sections.reduce((acc, s) => acc + s.totalStudents, 0)
    const verified = branch.sections.reduce((acc, s) => acc + s.skillVerified, 0)
    const projects = Math.max(0, ...branch.sections.map(s => s.activeProjects))
    const nonZeroReadiness = branch.sections.filter(s => s.totalStudents > 0)
    const avgReadiness = nonZeroReadiness.length > 0
      ? Math.round(nonZeroReadiness.reduce((acc, s) => acc + s.readinessPercent, 0) / nonZeroReadiness.length)
      : 0
    return {
      ...branch,
      totalStudents: totalStuds,
      skillVerified: verified,
      activeProjects: projects,
      readinessPercent: avgReadiness
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Branch & Batch Management</h2>
          <p className="text-xs text-slate-400">Track dedicated engineering branches, manage sub-batches & monitor readiness</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="p-1 rounded-xl bg-[#0f172a] border border-[#1e293b] flex items-center gap-1 text-xs">
            <button
              onClick={() => setViewMode('branches')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'branches'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Branch Overview
            </button>
            <button
              onClick={() => setViewMode('sections')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'sections'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sub-batch Sections
            </button>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus size={16} /> Create New Batch
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">
          <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto mb-2" />
          Loading department branches...
        </div>
      ) : viewMode === 'branches' ? (
        /* Branch Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branchSummaries.map((branch) => (
            <div
              key={branch.id}
              className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {branch.academicYear} · {branch.shortCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {['Batch A', 'Batch B', 'Batch C'].map((sec) => (
                      <span key={sec} className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#080d18] text-slate-300 border border-[#1e293b]">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-white mb-1">{branch.name}</h3>
                <p className="text-xs text-slate-400 mb-4">Coordinator: {branch.coordinator}</p>

                {/* 4 Mini Stats Grid */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs">
                  <div className="flex items-center gap-2.5">
                    <Users size={16} className="text-indigo-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Branch Students</span>
                      <span className="font-extrabold text-white text-sm">{branch.totalStudents}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Award size={16} className="text-emerald-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Verified Skills</span>
                      <span className="font-extrabold text-white text-sm">{branch.skillVerified}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <FolderKanban size={16} className="text-amber-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Active Projects</span>
                      <span className="font-extrabold text-white text-sm">{branch.activeProjects}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle size={16} className="text-violet-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">Branch Readiness</span>
                      <span className="font-extrabold text-white text-sm">{branch.readinessPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Branch Readiness</span>
                  <span className="font-bold text-emerald-400">{branch.readinessPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${branch.readinessPercent}%` }}
                  />
                </div>
              </div>

              {/* View Branch Students Action Button */}
              <div className="pt-2 border-t border-[#1e293b]">
                <button
                  onClick={() => navigate(`/coordinator/students?dept=${encodeURIComponent(branch.deptName)}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-white text-xs font-bold flex items-center justify-center gap-2 border border-indigo-500/20 cursor-pointer transition-all"
                >
                  <Eye size={16} /> View {branch.shortCode} Branch Students ({branch.totalStudents}) →
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Sub-batch Sections Grid */
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
                  <span className="text-slate-400">Batch Readiness</span>
                  <span className="font-bold text-emerald-400">{batch.readinessPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${batch.readinessPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#1e293b]">
                <button
                  onClick={() => navigate(`/coordinator/students?dept=${encodeURIComponent(batch.department)}&batch=${encodeURIComponent(batch.section)}`)}
                  className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold flex items-center justify-center gap-1.5 border border-indigo-500/20 cursor-pointer"
                >
                  <Eye size={14} /> View Students
                </button>
                <button
                  onClick={() => handleOpenEdit(batch)}
                  title="Edit Batch"
                  className="p-1.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => setDeletingBatch(batch)}
                  title="Delete Batch"
                  className="p-1.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Dashed Add Card */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-6 rounded-2xl border-2 border-dashed border-[#1e293b] hover:border-indigo-500/50 bg-[#0f172a]/40 hover:bg-[#0f172a] transition-all flex flex-col items-center justify-center text-center space-y-3 min-h-[280px] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center">
              <Plus size={24} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Add New Batch</h4>
              <p className="text-xs text-slate-400">Setup a new academic section batch</p>
            </div>
          </button>
        </div>
      )}

      {/* Create Batch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
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
                  placeholder="e.g. Prof. Sarah Jenkins"
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2025-2026"
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  {submitting ? 'Creating...' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Batch Modal */}
      {editingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => setEditingBatch(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Edit Batch Details</h3>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coordinator Name</label>
                <input
                  type="text"
                  value={editCoordinator}
                  onChange={(e) => setEditCoordinator(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                <CustomSelect
                  value={editStatus}
                  onChange={(val) => setEditStatus(val as any)}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Upcoming', label: 'Upcoming' },
                    { value: 'Completed', label: 'Completed' }
                  ]}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setEditingBatch(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {editSaving && <Loader2 size={14} className="animate-spin" />}
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/20">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Delete Batch</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <span className="text-white font-semibold">{deletingBatch.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBatch(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#080d18] border border-[#1e293b] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteBatch}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/20"
              >
                Delete Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

