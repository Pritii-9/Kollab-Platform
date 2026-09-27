import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { chatApi, type ChatProject, type ChatMember, type ChatMessage } from '@/api/chat.api'
import {
  Send, Hash, MessageSquare, FolderKanban, Shield, ChevronDown, Loader2, Check, User
} from 'lucide-react'
import toast from 'react-hot-toast'

type ChannelKey = 'general' | 'kanban-updates' | 'proctored-tests' | 'placement-discussion'

export default function TeamChat() {
  const { user } = useAuthStore()
  const userName = user?.name || 'Student'
  const userInitial = userName.charAt(0).toUpperCase()

  const [projects, setProjects] = useState<ChatProject[]>([])
  const [selectedProject, setSelectedProject] = useState<ChatProject | null>(null)
  const [projectMembers, setProjectMembers] = useState<ChatMember[]>([])
  
  const [activeChannel, setActiveChannel] = useState<ChannelKey>('general')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputVal, setInputVal] = useState('')
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)

  const chatContainerRef = useRef<HTMLDivElement>(null)
  const projectDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setProjectDropdownOpen(false)
      }
    }
    if (projectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [projectDropdownOpen])

  // 1. Fetch Projects on Mount
  useEffect(() => {
    document.title = 'Team Workspace Chat — Kollab'
    const loadProjects = async () => {
      try {
        setLoadingProjects(true)
        const projs = await chatApi.getMyProjects()
        setProjects(projs)
        if (projs.length > 0) {
          setSelectedProject(projs[0])
        }
      } catch (err) {
        console.error('Failed to load chat projects:', err)
      } finally {
        setLoadingProjects(false)
      }
    }
    loadProjects()
  }, [])

  // 2. Fetch Project Members & Messages when project or channel changes
  const fetchMessages = async (projId: string, channel: string, silent = false) => {
    try {
      if (!silent) setLoadingMessages(true)
      const msgs = await chatApi.getMessages(projId, channel)
      setMessages(msgs)
    } catch (err) {
      console.error('Failed to load messages:', err)
    } finally {
      if (!silent) setLoadingMessages(false)
    }
  }

  const fetchMembers = async (projId: string) => {
    try {
      const mems = await chatApi.getProjectMembers(projId)
      setProjectMembers(mems)
    } catch (err) {
      console.error('Failed to load project members:', err)
    }
  }

  useEffect(() => {
    if (selectedProject?.id) {
      fetchMembers(selectedProject.id)
      fetchMessages(selectedProject.id, activeChannel)
    }
  }, [selectedProject?.id, activeChannel])

  // 3. Real-Time Message Polling (Every 3 seconds)
  useEffect(() => {
    if (!selectedProject?.id) return
    const interval = setInterval(() => {
      fetchMessages(selectedProject.id, activeChannel, true)
    }, 3000)
    return () => clearInterval(interval)
  }, [selectedProject?.id, activeChannel])

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  // 4. Handle Send Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputVal.trim() || !selectedProject?.id || sending) return
    const textToSend = inputVal.trim()
    setInputVal('')

    const optimisticMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      projectId: selectedProject.id,
      channel: activeChannel,
      senderId: user?.id || 'self',
      sender: userName,
      avatar: userInitial,
      text: textToSend,
      time: 'Just now',
      createdAt: new Date().toISOString(),
      isSelf: true
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      setSending(true)
      await chatApi.sendMessage(selectedProject.id, activeChannel, textToSend)
      fetchMessages(selectedProject.id, activeChannel, true)
    } catch (err) {
      toast.error('Failed to send message')
      fetchMessages(selectedProject.id, activeChannel, true)
    } finally {
      setSending(false)
    }
  }

  const channels: { key: ChannelKey; label: string; desc: string }[] = [
    { key: 'general', label: 'general', desc: 'General team discussion' },
    { key: 'kanban-updates', label: 'kanban-updates', desc: 'Sprint board telemetry' },
    { key: 'proctored-tests', label: 'proctored-tests', desc: 'Assessment alerts & study' },
    { key: 'placement-discussion', label: 'placement-discussion', desc: 'Recruiter & dossier prep' },
  ]

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-2xl border border-[#1e293b] bg-[#0f172a] overflow-hidden shadow-2xl">
      {/* ── Left Sidebar: Project Selector & Channels ── */}
      <div className="w-80 bg-[#080d18] border-r border-[#1e293b] p-4 flex flex-col justify-between hidden md:flex">
        <div className="space-y-5">
          {/* ── Rich Custom Project Selector Dropdown ── */}
          <div className="space-y-2 relative" ref={projectDropdownRef}>
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <FolderKanban size={13} /> Select Project Workspace
              </label>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-extrabold">
                {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
              </span>
            </div>

            {loadingProjects ? (
              <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-xs text-slate-400 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-500" /> Loading workspaces...
              </div>
            ) : projects.length === 0 ? (
              <div className="p-3.5 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-xs text-slate-400">
                No active projects found
              </div>
            ) : (
              <div>
                {/* Trigger Card */}
                <button
                  onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-indigo-900/30 via-[#0f172a] to-[#080d18] border border-indigo-500/30 hover:border-indigo-500/60 shadow-lg text-left transition-all flex items-center justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0">
                      <FolderKanban size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-white truncate group-hover:text-indigo-300 transition-colors">
                        {selectedProject?.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {selectedProject?.description || 'Active Team Workspace'}
                      </p>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${projectDropdownOpen ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {projectDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0f172a] border border-[#1e293b] rounded-2xl shadow-2xl p-2 space-y-1 animate-fade-in max-h-64 overflow-y-auto">
                    {projects.map((p) => {
                      const isSelected = p.id === selectedProject?.id
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProject(p)
                            setProjectDropdownOpen(false)
                          }}
                          className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                              : 'bg-[#080d18]/60 hover:bg-[#1e293b]/60 border border-[#1e293b] text-slate-300'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs truncate text-white">{p.title}</span>
                              {isSelected && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-extrabold border border-emerald-500/20">Active</span>}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">{p.description}</p>
                          </div>
                          {isSelected && <Check size={16} className="text-emerald-400 shrink-0" />}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Project Channels List ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={13} className="text-indigo-400" /> Project Channels
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-extrabold">
                {channels.length}
              </span>
            </div>

            <nav className="space-y-1">
              {channels.map((ch) => {
                const isActive = activeChannel === ch.key
                return (
                  <button
                    key={ch.key}
                    onClick={() => setActiveChannel(ch.key)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-[#0f172a]'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Hash size={14} className={isActive ? 'text-white' : 'text-slate-500'} />
                      {ch.label}
                    </span>
                    {isActive && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* ── Rich Associated Project Members Roster ── */}
          <div className="space-y-2 pt-3 border-t border-[#1e293b]">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-emerald-400" /> Associated Teammates ({projectMembers.length})
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {projectMembers.map((m) => {
                const isLead = m.role?.toLowerCase().includes('lead')
                const isPending = m.status === 'Pending'
                return (
                  <div
                    key={m.id}
                    className="p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-indigo-500/40 transition-all space-y-2 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-extrabold text-xs flex items-center justify-center border border-indigo-400/30 shadow-md">
                          {m.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0f172a]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-extrabold text-white truncate">{m.name}</h5>
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border shrink-0 ${
                            isLead
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : isPending
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {isLead ? '👑 Lead' : isPending ? '⏳ Invited' : '✅ Member'}
                          </span>
                        </div>
                        <p className="text-[10px] text-indigo-300 font-medium truncate mt-0.5">{m.role}</p>
                      </div>
                    </div>

                    {/* Trust Score & Contact Footer */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#1e293b]/60 text-[10px]">
                      <div className="flex items-center gap-1 text-slate-400">
                        <User size={10} className="text-slate-500" />
                        <span className="truncate">{m.email || 'Verified Teammate'}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold shrink-0">
                        <Shield size={9} /> {m.trustScore || 90}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Chat Thread ── */}
      <div className="flex-1 flex flex-col justify-between bg-[#050811]">
        {/* Top Channel Header */}
        <div className="h-14 border-b border-[#1e293b] px-5 flex items-center justify-between bg-[#080d18] shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Hash size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">#{activeChannel}</span>
                <span className="text-xs text-indigo-400 font-semibold">({selectedProject?.title || 'Project'})</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {channels.find(c => c.key === activeChannel)?.desc}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {projectMembers.length} Teammates Active
            </span>
          </div>
        </div>

        {/* Message Container */}
        <div ref={chatContainerRef} className="flex-1 p-5 overflow-y-auto space-y-4">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs gap-2">
              <Loader2 size={18} className="animate-spin text-indigo-500" /> Loading real team messages...
            </div>
          ) : messages.length > 0 ? (
            messages.map((m) => (
              <div key={m.id} className={`flex items-start gap-3 ${m.isSelf ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full font-extrabold text-xs flex items-center justify-center shrink-0 border ${
                  m.isSelf ? 'bg-indigo-600 text-white border-indigo-400/30' : 'bg-slate-800 text-indigo-300 border-[#1e293b]'
                }`}>
                  {m.avatar}
                </div>
                <div className={`max-w-md space-y-1 ${m.isSelf ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="font-extrabold text-white">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-md ${
                      m.isSelf
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-[#0f172a] border border-[#1e293b] text-slate-200 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs space-y-2">
              <MessageSquare size={24} className="text-slate-600" />
              <p className="font-semibold text-slate-400">No messages yet in #{activeChannel} for {selectedProject?.title}.</p>
              <p className="text-[11px] text-slate-600">Send a real message below to start chatting with associated project members!</p>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-[#1e293b] bg-[#080d18] flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={!selectedProject?.id}
            placeholder={`Type a real message to #${activeChannel} in ${selectedProject?.title || 'project'}...`}
            className="flex-1 px-4 py-2.5 bg-[#0f172a] border border-[#1e293b] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || sending || !selectedProject?.id}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 font-bold text-xs transition-all cursor-pointer"
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
