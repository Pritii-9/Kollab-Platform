import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/projectStore'
import { projectsApi } from '@/api/projects.api'
import { useAuthStore } from '@/store/authStore'
import type { Project, MemberContact, ProjectUpdate, UpdateTag } from '@/types/project.types'
import EmptyState from '@/components/shared/EmptyState'
import toast from 'react-hot-toast'
import {
  FolderKanban, ArrowLeft, Loader2, AlertCircle,
  Mail, ExternalLink, Shield, User, Settings as SettingsIcon,
  Send, Clock, ChevronDown, Trash2, AlertTriangle, Save
} from 'lucide-react'

// ─── Tag config ───────────────────────────────────────────────────────────────
const TAG_META: Record<UpdateTag, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  done:        { label: 'Done',          emoji: '✅', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  in_progress: { label: 'In Progress',   emoji: '🔄', color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
  blocked:     { label: 'Blocked',       emoji: '⚠️', color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30'    },
  review:      { label: 'Review Needed', emoji: '👀', color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'   },
  idea:        { label: 'Idea',          emoji: '💡', color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/30'  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(isoStr: string): string {
  if (!isoStr) return ''
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function Avatar({ name, avatar, size = 10 }: { name: string; avatar?: string; size?: number }) {
  if (avatar) return (
    <img src={avatar} alt={name}
      className={`w-${size} h-${size} rounded-full object-cover ring-2 ring-[#1e293b]`} />
  )
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colours = ['bg-indigo-600', 'bg-violet-600', 'bg-emerald-600', 'bg-rose-600', 'bg-amber-600']
  const idx = name.charCodeAt(0) % colours.length
  return (
    <div className={`w-${size} h-${size} rounded-full ${colours[idx]} text-white font-bold flex items-center justify-center text-xs ring-2 ring-[#1e293b]`}>
      {initials}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function TeamContacts({ projectId }: { projectId: string }) {
  const [contacts, setContacts] = useState<MemberContact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    projectsApi.getMemberContacts(projectId)
      .then(setContacts)
      .catch(() => toast.error('Could not load team contacts'))
      .finally(() => setLoading(false))
  }, [projectId])

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={24} className="animate-spin text-indigo-500" />
    </div>
  )

  if (!contacts.length) return (
    <p className="text-xs text-slate-400 text-center py-8">No team members yet. Invite teammates to see their contact details here.</p>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {contacts.map(c => {
        const memStatus = (c as any).status || 'Accepted'
        return (
          <div key={c.memberId}
            className={`p-5 rounded-2xl bg-[#080d18] border transition-all duration-200 space-y-4 ${
              memStatus === 'Pending' ? 'border-amber-500/30 bg-amber-500/5' : 'border-[#1e293b] hover:border-indigo-500/40'
            }`}>
            {/* Header */}
            <div className="flex items-center gap-3">
              <Avatar name={c.name} avatar={c.avatar} size={11} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm truncate">{c.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 ${
                    memStatus === 'Lead'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      : memStatus === 'Pending'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {memStatus === 'Lead' ? '👑 Lead' : memStatus === 'Pending' ? '⏳ Invited' : '✅ Member'}
                  </span>
                </div>
                <span className="text-[10px] text-indigo-400 font-semibold">{c.role}</span>
              </div>
              {/* Trust Badge */}
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Shield size={10} className="text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">{c.trustScore}</span>
              </div>
            </div>

            {/* Info grid */}
            <div className="space-y-1.5 text-xs">
              {c.rollNumber && (
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={12} className="text-slate-600 shrink-0" />
                  <span>{c.rollNumber} · {c.batch || c.department}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={12} className="text-slate-600 shrink-0" />
                <a href={`mailto:${c.email}`}
                  className="hover:text-indigo-400 transition-colors truncate">{c.email}</a>
              </div>
              {c.github && (
                <div className="flex items-center gap-2 text-slate-300">
                  <ExternalLink size={12} className="text-slate-600 shrink-0" />
                  <a href={c.github.startsWith('http') ? c.github : `https://github.com/${c.github}`}
                    target="_blank" rel="noreferrer"
                    className="hover:text-indigo-400 transition-colors truncate">
                    GitHub ↗
                  </a>
                </div>
              )}
              {c.linkedin && (
                <div className="flex items-center gap-2 text-slate-300">
                  <ExternalLink size={12} className="text-slate-600 shrink-0" />
                  <a href={c.linkedin.startsWith('http') ? c.linkedin : `https://linkedin.com/in/${c.linkedin}`}
                    target="_blank" rel="noreferrer"
                    className="hover:text-indigo-400 transition-colors truncate">
                    LinkedIn ↗
                  </a>
                </div>
              )}
            </div>

            {/* Quick contact button */}
            <a href={`mailto:${c.email}?subject=Kollab Project Collaboration`}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 hover:border-indigo-500/40 text-xs font-semibold transition-all">
              <Mail size={13} /> Send Email
            </a>
          </div>
        )
      })}
    </div>
  )
}


function UpdateFeed({ projectId }: { projectId: string }) {
  const { user } = useAuthStore()
  const [updates, setUpdates] = useState<ProjectUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [selectedTag, setSelectedTag] = useState<UpdateTag>('in_progress')
  const [message, setMessage] = useState('')
  const [tagOpen, setTagOpen] = useState(false)
  const tagRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) setTagOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    projectsApi.getProjectUpdates(projectId)
      .then(setUpdates)
      .catch(() => toast.error('Could not load updates'))
      .finally(() => setLoading(false))
  }, [projectId])

  const handlePost = async () => {
    if (!message.trim()) return
    setPosting(true)
    try {
      const newUpdate = await projectsApi.postProjectUpdate(projectId, selectedTag, message.trim())
      setUpdates(prev => [newUpdate, ...prev])
      setMessage('')
      toast.success('Update posted!')
    } catch {
      toast.error('Failed to post update')
    } finally {
      setPosting(false)
    }
  }

  const tag = TAG_META[selectedTag]

  return (
    <div className="space-y-5">
      {/* Composer */}
      <div className="p-4 rounded-2xl bg-[#080d18] border border-[#1e293b] space-y-3">
        <div className="flex items-center gap-3">
          {user && <Avatar name={user.name} avatar={user.avatar} size={9} />}
          <span className="text-xs font-semibold text-slate-300">
            Post an update for your team
          </span>
        </div>

        {/* Tag selector + text area */}
        <div className="flex gap-2">
          {/* Tag dropdown */}
          <div className="relative shrink-0" ref={tagRef}>
            <button
              onClick={() => setTagOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all ${tag.bg} ${tag.border} ${tag.color}`}
            >
              <span>{tag.emoji}</span>
              <span className="hidden sm:inline">{tag.label}</span>
              <ChevronDown size={12} />
            </button>
            {tagOpen && (
              <div className="absolute left-0 top-full mt-1 z-50 w-48 rounded-xl bg-[#0f172a] border border-[#1e293b] shadow-xl overflow-hidden">
                {(Object.entries(TAG_META) as [UpdateTag, typeof TAG_META[UpdateTag]][]).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => { setSelectedTag(key); setTagOpen(false) }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-[#1e293b] transition-colors ${meta.color}`}
                  >
                    <span>{meta.emoji}</span> {meta.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message input */}
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handlePost() }}
            placeholder="What's your update? (Press Enter)"
            className="flex-1 px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />

          {/* Post button */}
          <button
            onClick={handlePost}
            disabled={posting || !message.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all flex items-center gap-2 text-xs font-bold shrink-0"
          >
            {posting
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} />}
            <span className="hidden sm:inline">Post</span>
          </button>
        </div>
      </div>

      {/* Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={22} className="animate-spin text-indigo-500" />
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-xs">
          No updates yet. Be the first to post one! 👆
        </div>
      ) : (
        <div className="space-y-3">
          {updates.map(u => {
            const meta = TAG_META[u.tag as UpdateTag] ?? TAG_META.in_progress
            return (
              <div key={u.id}
                className={`p-4 rounded-2xl border transition-all duration-200 hover:border-opacity-60 ${meta.bg} ${meta.border}`}>
                <div className="flex items-start gap-3">
                  <Avatar name={u.studentName} avatar={u.studentAvatar} size={9} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-white">{u.studentName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${meta.bg} ${meta.color} border ${meta.border}`}>
                        {meta.emoji} {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">{u.message}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
                      <Clock size={10} />
                      <span>{timeAgo(u.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'tasks' | 'team' | 'updates' | 'settings'

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProjectById, deleteProject } = useProjectStore()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isDeletingModalOpen, setIsDeletingModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Project Settings edit state
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStatus, setEditStatus] = useState<'Active' | 'Completed'>('Active')
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  useEffect(() => {
    let mounted = true
    if (!id) { setLoading(false); return }

    setLoading(true)
    getProjectById(id).then((found) => {
      if (mounted) {
        setProject(found)
        setLoading(false)
        if (found) {
          document.title = `${found.title} — Kollab`
          setEditTitle(found.title)
          setEditDescription(found.description || '')
          setEditStatus((found.status as 'Active' | 'Completed') || 'Active')
        }
      }
    })
    return () => { mounted = false }
  }, [id])

  const handleSaveSettings = async () => {
    if (!project || !editTitle.trim()) return
    setIsSavingSettings(true)
    try {
      useProjectStore.setState((state) => ({
        projects: state.projects.map((p) =>
          p.id === project.id
            ? { ...p, title: editTitle.trim(), description: editDescription.trim(), status: editStatus }
            : p
        ),
        activeProject:
          state.activeProject?.id === project.id
            ? { ...state.activeProject, title: editTitle.trim(), description: editDescription.trim(), status: editStatus }
            : state.activeProject
      }))
      setProject((prev) => prev ? { ...prev, title: editTitle.trim(), description: editDescription.trim(), status: editStatus } : null)
      toast.success('Project settings saved successfully!')
    } catch {
      toast.error('Failed to save project settings')
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    setIsDeleting(true)
    try {
      await deleteProject(project.id)
      toast.success(`Project "${project.title}" deleted successfully`)
      navigate('/student/projects')
    } catch {
      toast.error('Failed to delete project. Please try again.')
    } finally {
      setIsDeleting(false)
      setIsDeletingModalOpen(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
      <Loader2 size={32} className="animate-spin text-indigo-500" />
      <p className="text-xs text-slate-400 font-semibold">Loading project details...</p>
    </div>
  )

  if (!project) return (
    <div className="space-y-6">
      <button onClick={() => navigate('/student/projects')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview',   label: 'Overview'   },
    { key: 'tasks',      label: 'Tasks'      },
    { key: 'team',       label: '👥 Team'    },
    { key: 'updates',    label: '📢 Updates' },
    { key: 'settings',   label: '⚙️ Settings' },
  ]

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/student/projects')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white">
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
          <button onClick={() => navigate(`/student/kanban/${project.id}`)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2">
            <FolderKanban size={16} /> Open Kanban Workspace
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{project.description || 'No description provided.'}</p>

        {project.techStack?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1e293b]">
            {project.techStack.map((t, idx) => (
              <span key={idx} className="px-3 py-1 rounded-lg bg-[#080d18] border border-[#1e293b] text-xs font-semibold text-indigo-300">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#1e293b] gap-1 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 pb-3 text-xs font-bold whitespace-nowrap transition-colors relative ${
              activeTab === t.key
                ? 'text-indigo-400 border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
          <h3 className="text-base font-bold text-white">Project Overview</h3>
          <p className="text-xs text-slate-300">
            Current overall progress is standing at <span className="font-bold text-emerald-400">{project.progress}%</span>.
          </p>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${project.progress}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[
              { label: 'Team Size',  value: `${project.members?.length || 0} / ${project.teamSize}` },
              { label: 'Timeline',   value: project.timeline },
              { label: 'Total Tasks',value: project.tasks?.length || 0 },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] text-center">
                <div className="text-lg font-extrabold text-white">{stat.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3">
          <h3 className="text-base font-bold text-white mb-2">Project Tasks</h3>
          {project.tasks?.length > 0 ? (
            <div className="space-y-2">
              {project.tasks.map(task => (
                <div key={task.id} className="p-3 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">{task.title}</h4>
                    <p className="text-[10px] text-slate-400">{task.description}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold shrink-0 ml-2">{task.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-xs">No tasks have been added yet.</p>
          )}
        </div>
      )}

      {activeTab === 'team' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Team Members</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Contact details are only visible to project members.</p>
            </div>
            <button onClick={() => navigate('/student/teammates')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all">
              + Invite Teammates
            </button>
          </div>
          <TeamContacts projectId={project.id} />
        </div>
      )}

      {activeTab === 'updates' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Project Update Feed</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Share your progress, blockers, or ideas with the team.</p>
          </div>
          <UpdateFeed projectId={project.id} />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <SettingsIcon size={18} className="text-indigo-400" /> Project Settings
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Manage project title, status, preferences, and workspace operations.</p>
          </div>

          {/* Project Details Form */}
          <div className="space-y-4 p-5 rounded-xl bg-[#080d18] border border-[#1e293b]">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">General Information</h4>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Project Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs font-bold text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Description</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 block mb-1">Status</label>
              <div className="flex gap-3">
                {(['Active', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setEditStatus(st)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      editStatus === st
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                        : 'bg-[#0f172a] text-slate-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings || !editTitle.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {isSavingSettings ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Settings
              </button>
            </div>
          </div>

          {/* Danger Zone Section */}
          <div className="p-5 rounded-xl bg-rose-500/5 border border-rose-500/20 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider">Danger Zone</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Permanently delete this project workspace, Kanban cards, project updates, and team invitations.
                </p>
              </div>
              <button
                onClick={() => setIsDeletingModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Trash2 size={14} /> Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-rose-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Delete Project</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#080d18] p-3 rounded-xl border border-[#1e293b]">
              Are you sure you want to delete <span className="font-bold text-white">{project.title}</span>? All project details and member links will be permanently removed.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsDeletingModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-[#1e293b] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isDeleting}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
