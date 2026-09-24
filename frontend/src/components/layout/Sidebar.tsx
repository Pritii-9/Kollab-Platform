import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { COORDINATOR_NAV, STUDENT_NAV } from '@/utils/constants'
import { 
  ChevronLeft, 
  ChevronRight, 
  GraduationCap,
  LayoutDashboard,
  Users,
  UserCheck,
  UserPlus,
  ClipboardList,
  FileSpreadsheet,
  Megaphone,
  User,
  FileText,
  Search,
  FolderKanban,
  CheckSquare,
  BarChart2,
  BarChart3,
  MessageSquare,
  Sparkles,
  Settings,
  Bell,
  Flag,
  TrendingUp,
} from 'lucide-react'

// Icon map for navigation icons
const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Users: <Users size={20} />,
  UserCheck: <UserCheck size={20} />,
  UserPlus: <UserPlus size={20} />,
  ClipboardList: <ClipboardList size={20} />,
  FileSpreadsheet: <FileSpreadsheet size={20} />,
  Megaphone: <Megaphone size={20} />,
  GraduationCap: <GraduationCap size={20} />,
  User: <User size={20} />,
  FileText: <FileText size={20} />,
  Search: <Search size={20} />,
  FolderKanban: <FolderKanban size={20} />,
  CheckSquare: <CheckSquare size={20} />,
  BarChart2: <BarChart2 size={20} />,
  BarChart3: <BarChart3 size={20} />,
  MessageSquare: <MessageSquare size={20} />,
  Sparkles: <Sparkles size={20} />,
  Settings: <Settings size={20} />,
  Bell: <Bell size={20} />,
  Flag: <Flag size={20} />,
  TrendingUp: <TrendingUp size={20} />,
}

interface SidebarProps {
  role: 'coordinator' | 'student'
  isMobileOpen?: boolean
  onMobileClose?: () => void
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ role, isMobileOpen = false, onMobileClose, onCollapsedChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const navItems = role === 'coordinator' ? COORDINATOR_NAV : STUDENT_NAV

  const handleToggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    onCollapsedChange?.(next)
  }

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen bg-[#080d18] border-r border-[#1e293b] transition-all duration-300 flex flex-col justify-between ${
        collapsed ? 'w-[64px]' : 'w-[240px]'
      } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      {/* Top Header */}
      <div>
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-[#1e293b]">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
                <GraduationCap size={18} />
              </div>
              <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Kollab
              </span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-600/20">
              <GraduationCap size={18} />
            </div>
          )}
          
          <button
            onClick={handleToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-[#1e293b] text-slate-400 hover:text-white transition-colors shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Role Badge */}
        {!collapsed && (
          <div className="px-4 py-2 border-b border-[#1e293b]/60">
            <span className="inline-block text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {role === 'coordinator' ? '🎓 Coordinator Panel' : '📚 Student Portal'}
            </span>
          </div>
        )}

        {/* Nav Links */}
        <nav className="p-3 space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-[3px] border-indigo-500 rounded-l-none pl-[10px]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#0f172a]'
                }`
              }
            >
              <span className="shrink-0">{iconMap[item.icon] || <LayoutDashboard size={20} />}</span>
              {!collapsed && <span className="text-sm truncate">{item.label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 border border-slate-800">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
export default Sidebar
