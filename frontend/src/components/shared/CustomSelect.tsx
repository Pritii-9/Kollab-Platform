import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string | number
  label: string
}

interface CustomSelectProps {
  options: SelectOption[]
  value: string | number
  onChange: (val: any) => void
  placeholder?: string
  className?: string
}

export default function CustomSelect({ options, value, onChange, placeholder, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <span className={selectedOption ? 'text-white' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : (placeholder || 'Select...')}
        </span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 py-1 rounded-xl bg-[#0f172a] border border-[#1e293b] shadow-xl max-h-60 overflow-auto scrollbar-hide">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${
                value === opt.value
                  ? 'bg-indigo-600/10 text-indigo-400'
                  : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
