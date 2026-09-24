import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProjectStore } from '@/store/projectStore'
import { TECH_STACK_OPTIONS } from '@/utils/constants'
import type { Project } from '@/types/project.types'
import EmptyState from '@/components/shared/EmptyState'
import { Plus, FolderKanban, Eye, X, Loader2 } from 'lucide-react'

export default function MyProjects() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { projects, fetchProjects, createProject, loading: isSubmitting } = useProjectStore()
  const [activeTab, setActiveTab] = useState<'all' | 'Active' | 'Completed'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Modal Form
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTech, setSelectedTech] = useState<string[]>([TECH_STACK_OPTIONS[0]])

  useEffect(() => {
    document.title = 'Projects — Kollab'
    fetchProjects()
  }, [])

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'all') return true
    return p.status === activeTab
  })

  const toggleTech = (t: string) => {
    if (selectedTech.includes(t)) {
      setSelectedTech(selectedTech.filter((x) => x !== t))
    } else {
      setSelectedTech([...selectedTech, t])
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSaving) return
    setIsSaving(true)

    try {
      const created = await createProject(
        {
          title: title.trim(),
          description: description.trim(),
          techStack: selectedTech,
        },
        user?.id ?? '',
        user?.name || 'Student'
      )

      setTitle('')
      setDescription('')
      setIsModalOpen(false)

      if (created?.id) {
        navigate(`/student/projects/${created.id}`)
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Collaborative Student Projects</h2>
          <p className="text-xs text-slate-400">Build real-world group projects with proctored Kanban tracking</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Plus size={16} /> Create New Project
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b] gap-6 text-sm font-semibold">
        {(['all', 'Active', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === tab ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab} Projects
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all duration-300 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      proj.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}
                  >
                    {proj.status}
                  </span>
                  <span className="text-xs text-slate-500">Started {proj.startDate}</span>
                </div>

                <h3 className="text-lg font-extrabold text-white">{proj.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{proj.description}</p>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.techStack.map((tech, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-lg bg-[#080d18] border border-[#1e293b] text-[10px] text-indigo-300 font-semibold">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#1e293b]">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Milestone Progress</span>
                    <span className="font-bold text-emerald-400">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${proj.progress}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/student/kanban/${proj.id}`)}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-1.5"
                  >
                    <FolderKanban size={14} /> Open Kanban
                  </button>
                  <button
                    onClick={() => navigate(`/student/projects/${proj.id}`)}
                    className="py-2 px-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Eye size={14} /> Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderKanban size={24} />}
          title="No Projects Found"
          description="Create your first team project or get invited by peers."
          action={{ label: 'Create Project', onClick: () => setIsModalOpen(true) }}
        />
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>
            <h3 className="text-lg font-bold text-white">Create New Project</h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AI Placement Matchmaker App"
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief summary of project goals..."
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Tech Stack</label>
                <div className="flex flex-wrap gap-1.5">
                  {TECH_STACK_OPTIONS.slice(0, 8).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTech(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        selectedTech.includes(t)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-[#080d18] border border-[#1e293b] text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-4 py-2 text-xs font-semibold text-slate-400">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : null}
                  {isSaving ? 'Saving Project...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
