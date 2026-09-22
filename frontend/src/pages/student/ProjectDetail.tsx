import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import type { Project } from '@/types/project.types'
import EmptyState from '@/components/shared/EmptyState'
import { FolderKanban, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProjectById } = useProjectStore()
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'team'>('overview')

  useEffect(() => {
    let isMounted = true
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    getProjectById(id).then((found) => {
      if (isMounted) {
        setProject(found)
        setLoading(false)
        if (found) {
          document.title = `${found.title} — Kollab`
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-semibold">Loading project details...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/student/projects')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <EmptyState
          icon={<AlertCircle size={32} className="text-amber-400" />}
          title="Project Not Found"
          description="The requested project could not be found or may have been removed."
          action={{ label: 'View My Projects', onClick: () => navigate('/student/projects') }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/student/projects')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
      >
        <ArrowLeft size={16} /> Back to Projects
      </button>

      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {project.status || 'Active'}
              </span>
              <span className="text-xs text-slate-500">Started {project.startDate}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">{project.title}</h2>
          </div>
          <button
            onClick={() => navigate(`/student/kanban/${project.id}`)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <FolderKanban size={16} /> Open Kanban Workspace
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{project.description || 'No description provided.'}</p>

        {/* Tech Badges */}
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1e293b]">
            {project.techStack.map((t, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg bg-[#080d18] border border-[#1e293b] text-xs font-semibold text-indigo-300">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b] gap-6 text-sm font-semibold">
        {(['overview', 'tasks', 'milestones', 'team'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-3 capitalize transition-colors relative ${
              activeTab === t ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
          <h3 className="text-base font-bold text-white">Project Overview & Milestones</h3>
          <p className="text-xs text-slate-300">
            Current overall progress is standing at <span className="font-bold text-emerald-400">{project.progress}%</span>.
          </p>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${project.progress}%` }} />
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3">
          <h3 className="text-base font-bold text-white mb-2">Project Tasks List</h3>
          {project.tasks && project.tasks.length > 0 ? (
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <div key={task.id} className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{task.title}</h4>
                    <p className="text-[10px] text-slate-400">{task.description}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold">{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs">No tasks have been added to this project yet.</p>
          )}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3">
          <h3 className="text-base font-bold text-white mb-2">Milestone Schedule</h3>
          <p className="text-slate-400 text-xs">No milestones have been set up for this project.</p>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Team Members</h3>
            <button
              onClick={() => navigate('/student/teammates')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              + Invite Teammates
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.members && project.members.length > 0 ? (
              project.members.map((m) => (
                <div key={m.id} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
                    {m.name ? m.name[0] : 'S'}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{m.name}</h4>
                    <span className="text-[10px] text-slate-400">{m.role}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-xs">No team members assigned yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
