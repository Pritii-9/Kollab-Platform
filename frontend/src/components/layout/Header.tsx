import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')

  // Compute title from route
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/coordinator/dashboard')) return 'Coordinator Dashboard'
    if (path.includes('/coordinator/batches')) return 'Batch Management'
    if (path.includes('/coordinator/students')) return 'Students List'
    if (path.includes('/coordinator/assign-test')) return 'Assign Proctored Test'
    if (path.includes('/coordinator/reports')) return 'Placement Reports'
    if (path.includes('/coordinator/announcements')) return 'Announcements'
    if (path.includes('/student/dashboard')) return 'Student Dashboard'
    if (path.includes('/student/profile')) return 'My Profile'
    if (path.includes('/student/resume')) return 'My Resume'
    if (path.includes('/student/teammates')) return 'Find Teammates'
    if (path.includes('/student/projects')) return 'My Projects'
    if (path.includes('/student/kanban')) return 'Kanban Workspace'
    if (path.includes('/student/milestones')) return 'Milestones'
    if (path.includes('/student/analytics')) return 'Performance Analytics'
    if (path.includes('/student/chat')) return 'Team Workspace Chat'
    if (path.includes('/student/notifications')) return 'Notifications'
    if (path.includes('/student/ai-tools')) return 'AI Career Tools'
    if (path.includes('/student/settings')) return 'Account Settings'
    return 'Dashboard'
  }

  return (
    <header className="h-[60px] bg-[#080d18] border-b border-[#1e293b] px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b]"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-100 hidden sm:block">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search anything..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-[#0f172a] border border-[#1e293b] rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate(user?.role === 'coordinator' ? '#' : '/student/notifications')}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-[#080d18] animate-pulse" />
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#1e293b] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold flex items-center justify-center text-sm border border-indigo-400/30">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-xl py-1 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-[#1e293b]">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  navigate(user?.role === 'coordinator' ? '#' : '/student/profile')
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-[#1e293b] hover:text-white"
              >
                <User size={16} /> My Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  navigate(user?.role === 'coordinator' ? '#' : '/student/settings')
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-[#1e293b] hover:text-white"
              >
                <Settings size={16} /> Settings
              </button>
              <div className="border-t border-[#1e293b] my-1" />
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  logout()
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
export default Header
