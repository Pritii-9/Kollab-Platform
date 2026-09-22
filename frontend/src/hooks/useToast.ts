import { useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

// Simple toast state (singleton pattern for now)
let toasts: Toast[] = []
let listeners: Array<(t: Toast[]) => void> = []

function notify() {
  listeners.forEach((l) => l([...toasts]))
}

export function useToast() {
  const [, setToasts] = useState<Toast[]>([])

  const subscribe = useCallback((fn: (t: Toast[]) => void) => {
    listeners.push(fn)
    return () => { listeners = listeners.filter((l) => l !== fn) }
  }, [])

  const toast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}`
    toasts = [...toasts, { id, message, type }]
    notify()
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id)
      notify()
    }, 3000)
  }, [])

  return { toast, subscribe, setToasts }
}
