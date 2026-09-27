import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

function parseSafeDate(date: Date | string | number | null | undefined): Date | null {
  if (!date) return null
  if (typeof date === 'string' && (date.toLowerCase() === 'just now' || date.toLowerCase() === 'recent')) {
    return new Date()
  }
  const d = new Date(date)
  if (isNaN(d.getTime())) return null
  return d
}

export function formatDate(date: Date | string | number | null | undefined): string {
  const d = parseSafeDate(date)
  if (!d) return typeof date === 'string' ? date : 'N/A'
  return format(d, 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string | number | null | undefined): string {
  const d = parseSafeDate(date)
  if (!d) return typeof date === 'string' ? date : 'N/A'
  return format(d, 'MMM d, yyyy · h:mm a')
}

export function formatRelative(date: Date | string | number | null | undefined): string {
  if (typeof date === 'string' && (date.toLowerCase() === 'just now' || date.toLowerCase() === 'recent')) {
    return 'Just now'
  }
  const d = parseSafeDate(date)
  if (!d) return typeof date === 'string' && date ? date : 'Recently'
  try {
    if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true })
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'MMM d')
  } catch {
    return typeof date === 'string' ? date : 'Recently'
  }
}

export function formatTime(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatShortDate(date: Date | string | number | null | undefined): string {
  const d = parseSafeDate(date)
  if (!d) return typeof date === 'string' ? date : 'N/A'
  return format(d, 'dd MMM yy')
}
