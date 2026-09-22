import { useEffect, useState } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import EmptyState from '@/components/shared/EmptyState'
import { Bell, CheckCircle2, ClipboardList, FolderKanban, Users, Settings, Trash2, ArrowRight } from 'lucide-react'
import { formatRelative } from '@/utils/formatDate'

type FilterType = 'all' | 'unread' | 'test' | 'project' | 'team' | 'system'

export default function Notifications() {
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore()
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    document.title = 'Notifications — Kollab'
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'test':
        return <ClipboardList size={18} className="text-indigo-400" />
      case 'project':
        return <FolderKanban size={18} className="text-emerald-400" />
      case 'team':
        return <Users size={18} className="text-amber-400" />
      case 'system':
        return <Settings size={18} className="text-slate-400" />
      default:
        return <Bell size={18} className="text-violet-400" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case 'test':
        return 'bg-indigo-500/10 border-indigo-500/20'
      case 'project':
        return 'bg-emerald-500/10 border-emerald-500/20'
      case 'team':
        return 'bg-amber-500/10 border-amber-500/20'
      case 'system':
        return 'bg-slate-500/10 border-slate-500/20'
      default:
        return 'bg-violet-500/10 border-violet-500/20'
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'all') return true
    return n.type === filter
  })

  const filterTabs: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'test', label: 'Tests' },
    { key: 'project', label: 'Projects' },
    { key: 'team', label: 'Team' },
    { key: 'system', label: 'System' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white">Notifications & Alerts</h2>
            <p className="text-xs text-slate-400 mt-0.5">Proctored test updates, team invites, and department alerts</p>
          </div>
          {unreadCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-600 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <CheckCircle2 size={16} /> Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filter === tab.key
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-600'
            }`}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-block w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold leading-4 text-center">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                !notif.read
                  ? 'bg-[#0f172a] border-indigo-500/30 border-l-4 border-l-indigo-500 shadow-lg shadow-indigo-900/20'
                  : 'bg-[#080d18] border-[#1e293b]/60 hover:bg-[#0f172a] hover:border-[#1e293b]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2.5 rounded-xl border shrink-0 ${getIconBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm truncate">{notif.title}</h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-medium">
                      {formatRelative(notif.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{notif.description}</p>

                  {'action' in notif && notif.action && (
                    <button className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {String(notif.action)} <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-6">
            <EmptyState
              icon={<Bell size={24} />}
              title={filter === 'unread' ? 'All Caught Up!' : 'No Notifications'}
              description={
                filter === 'unread'
                  ? 'You have no unread notifications.'
                  : `No ${filter === 'all' ? '' : filter} notifications found.`
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
