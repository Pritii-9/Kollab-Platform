import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, Search, User, LogOut, Settings, AlertTriangle } from 'lucide-react'
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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Compute title from route
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/coordinator/dashboard')) return 'Coordinator Dashboard'
    if (path.includes('/coordinator/batches')) return 'Batch Management'
    if (path.includes('/coordinator/students')) return 'Students List'
    if (path.includes('/coordinator/assign-test')) return 'Assign Proctored Test'
    if (path.includes('/coordinator/test-results')) return 'Test Results Matrix'
    if (path.includes('/coordinator/reports')) return 'Placement Reports'
    if (path.includes('/coordinator/announcements')) return 'Announcements'
    if (path.includes('/coordinator/profile')) return 'Coordinator Profile'
    if (path.includes('/coordinator/settings')) return 'Account Settings'
    if (path.includes('/coordinator/notifications')) return 'Notifications & Alerts'
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

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    logout()
    navigate('/login')
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
          onClick={() => navigate(user?.role === 'coordinator' ? '/coordinator/notifications' : '/student/notifications')}
          className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-indigo-500 text-white text-[9px] font-extrabold flex items-center justify-center px-1 ring-2 ring-[#080d18] shadow-lg shadow-indigo-500/40">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div ref={dropdownRef} className="relative">
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
                  navigate(user?.role === 'coordinator' ? '/coordinator/profile' : '/student/profile')
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-[#1e293b] hover:text-white"
              >
                <User size={16} /> My Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  navigate(user?.role === 'coordinator' ? '/coordinator/settings' : '/student/settings')
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-[#1e293b] hover:text-white"
              >
                <Settings size={16} /> Settings
              </button>
              <div className="border-t border-[#1e293b] my-1" />
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  setShowLogoutModal(true)
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-400 hover:bg-rose-500/10 font-semibold transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20 shadow-lg shadow-rose-500/10">
                <LogOut size={20} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Sign Out Confirmation</h3>
                <p className="text-xs text-slate-400">Are you sure you want to sign out?</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#080d18] p-3 rounded-xl border border-[#1e293b]">
              You will be signed out of your Kollab session. Any active tasks or test sessions in progress may need to be saved.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-[#1e293b] rounded-xl hover:border-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut size={14} /> Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
export default Header
