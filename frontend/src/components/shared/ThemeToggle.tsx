import { Moon } from 'lucide-react'

export default function ThemeToggle() {
  return (
    <button
      className="p-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
      title="Dark mode active"
      aria-label="Toggle theme (dark mode)"
    >
      <Moon size={18} />
    </button>
  )
}
