import React, { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface CustomDatePickerProps {
  value: string // 'YYYY-MM-DD'
  onChange: (date: string) => void
  placeholder?: string
  className?: string
  minDate?: string
  maxDate?: string
}

export default function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  className = '',
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Parse initial selected date or default to current date
  const parsedDate = value ? new Date(value) : null
  const isValidDate = parsedDate && !isNaN(parsedDate.getTime())

  const [viewYear, setViewYear] = useState<number>(isValidDate ? parsedDate.getFullYear() : new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState<number>(isValidDate ? parsedDate.getMonth() : new Date().getMonth())

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  // Days calculation for current viewMonth and viewYear
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(viewYear - 1)
    } else {
      setViewMonth(viewMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(viewYear + 1)
    } else {
      setViewMonth(viewMonth + 1)
    }
  }

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0')
    const formattedDay = String(day).padStart(2, '0')
    const selectedIsoDate = `${viewYear}-${formattedMonth}-${formattedDay}`
    onChange(selectedIsoDate)
    setIsOpen(false)
  }

  const formatDisplayDate = (isoStr: string) => {
    if (!isoStr) return ''
    const d = new Date(isoStr)
    if (isNaN(d.getTime())) return isoStr
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white hover:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon size={14} className="text-indigo-400 shrink-0" />
          <span className={`truncate ${isValidDate ? 'text-white font-medium' : 'text-slate-400'}`}>
            {isValidDate ? formatDisplayDate(value) : placeholder}
          </span>
        </div>
        {isValidDate && (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onChange('')
            }}
            className="p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-1"
          >
            <X size={12} />
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 mt-1 p-3 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-2xl backdrop-blur-xl">
          {/* Header Month / Year controls */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-[#1e293b] text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-white">
              {monthNames[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-[#1e293b] text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {daysOfWeek.map((day) => (
              <span key={day} className="text-[10px] font-semibold text-slate-400">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Blank cells for offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-7" />
            ))}

            {/* Day buttons */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1
              const currentIsoDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
              const isSelected = value === currentIsoDate
              const isToday =
                new Date().getFullYear() === viewYear &&
                new Date().getMonth() === viewMonth &&
                new Date().getDate() === dayNum

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30'
                      : isToday
                      ? 'border border-indigo-500/50 text-indigo-400 font-semibold'
                      : 'text-slate-300 hover:bg-[#1e293b] hover:text-white'
                  }`}
                >
                  {dayNum}
                </button>
              )
            })}
          </div>

          {/* Today Button Shortcut */}
          <div className="mt-3 pt-2 border-t border-[#1e293b] flex justify-between items-center text-[11px]">
            <button
              type="button"
              onClick={() => {
                const today = new Date()
                const todayStr = today.toISOString().split('T')[0]
                onChange(todayStr)
                setViewYear(today.getFullYear())
                setViewMonth(today.getMonth())
                setIsOpen(false)
              }}
              className="text-indigo-400 font-semibold hover:text-indigo-300"
            >
              Select Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
