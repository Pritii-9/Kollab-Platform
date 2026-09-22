import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface LayoutProps {
  role: 'coordinator' | 'student'
}

export default function Layout({ role }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        role={role}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-[64px]' : 'md:ml-[240px]'
        }`}
      >
        <Header onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
