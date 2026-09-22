import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function formatDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a')
}

export function formatRelative(date: Date | string | number): string {
  const d = new Date(date)
  if (isToday(d)) return formatDistanceToNow(d, { addSuffix: true })
  if (isYesterday(d)) return 'Yesterday'
  return format(d, 'MMM d')
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatShortDate(date: Date | string | number): string {
  return format(new Date(date), 'dd MMM yy')
}
