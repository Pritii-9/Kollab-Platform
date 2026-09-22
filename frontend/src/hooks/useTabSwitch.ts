import { useEffect, useCallback } from 'react'
import { useTestStore } from '@/store/testStore'

export function useTabSwitch(enabled: boolean) {
  const { incrementTabSwitch, submitTest, tabSwitches } = useTestStore()

  const handleVisibilityChange = useCallback(() => {
    if (document.hidden && enabled) {
      incrementTabSwitch()
      const current = useTestStore.getState().tabSwitches
      if (current >= 3) {
        submitTest()
      }
    }
  }, [enabled, incrementTabSwitch, submitTest])

  useEffect(() => {
    if (!enabled) return
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [enabled, handleVisibilityChange])

  return { tabSwitches }
}
