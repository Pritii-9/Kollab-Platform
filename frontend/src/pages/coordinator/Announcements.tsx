import { useState, useEffect } from 'react'
import { Megaphone, Send, Trash2, Calendar, Users, Eye, CheckCircle2 } from 'lucide-react'
import CustomSelect from '@/components/shared/CustomSelect'

interface AnnouncementItem {
  id: string
  title: string
  targetBadge: string
  message: string
  seenCount: number
  readCount: number
  timestamp: string
}

const MOCK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'a1',
    title: 'Upcoming Amazon Proctored Coding Test',
    targetBadge: 'Batch 2026 (Year 3)',
    message: 'All students are required to attempt the mandatory Amazon assessment skill test on Kollab before Friday 5 PM.',
    seenCount: 184,
    readCount: 162,
    timestamp: '2 hours ago'
  },
  {
    id: 'a2',
    title: 'Kanban Peer Project Submissions Open',
    targetBadge: 'All Students',
    message: 'Final year and third year project milestones have been updated on your dashboard. Please sync your Kanban tasks.',
    seenCount: 220,
    readCount: 198,
    timestamp: '1 day ago'
  }
]

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(MOCK_ANNOUNCEMENTS)
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('All Students')
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')

  useEffect(() => {
    document.title = 'Announcements — Kollab'
  }, [])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !message) return
    const newAnn: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title,
      targetBadge: target,
      message,
      seenCount: 0,
      readCount: 0,
      timestamp: isScheduled && scheduleDate ? `Scheduled for ${scheduleDate}` : 'Just now'
    }
    setAnnouncements([newAnn, ...announcements])
    setTitle('')
    setMessage('')
    setIsFormOpen(false)
  }

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Department Broadcast Announcements</h2>
          <p className="text-xs text-slate-400">Send push alerts, test schedules, and placement updates to cohorts</p>
        </div>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Megaphone size={16} /> {isFormOpen ? 'Close Compose' : '+ Compose Announcement'}
        </button>
      </div>

      {/* Compose Form */}
      {isFormOpen && (
        <form onSubmit={handleSend} className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4 animate-fade-in">
          <h3 className="text-base font-bold text-white mb-2">Create New Broadcast Alert</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mandatory Resume Workshop & Placement Portal Deadline"
              className="w-full px-4 py-2.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-sm text-white focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Message Content</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your broadcast message here..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-sm text-white focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Send To Target</label>
              <CustomSelect
                value={target}
                onChange={setTarget}
                options={[
                  { value: 'All Students', label: 'All Students (Entire Dept)' },
                  { value: 'Batch 2026 (Year 3)', label: 'Batch 2026 (Year 3)' },
                  { value: 'Batch 2025 (Year 4)', label: 'Batch 2025 (Year 4)' },
                  { value: 'Batch A', label: 'Batch A Only' }
                ]}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="accent-indigo-500"
                />
                Schedule Broadcast
              </label>
              {isScheduled && (
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Send size={14} /> Send Announcement
            </button>
          </div>
        </form>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-700 transition-all duration-300 shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {item.targetBadge}
                </span>
                <span className="text-xs text-slate-500">{item.timestamp}</span>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <h3 className="text-base font-bold text-white">{item.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>

            <div className="flex items-center gap-6 pt-3 border-t border-[#1e293b] text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-indigo-400" /> {item.seenCount} Seen
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" /> {item.readCount} Confirmed Read
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
