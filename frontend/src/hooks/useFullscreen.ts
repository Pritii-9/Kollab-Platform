import { useEffect, useState } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasExited, setHasExited] = useState(false)

  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } catch {
      setIsFullscreen(false)
    }
  }

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleChange = () => {
      const full = !!document.fullscreenElement
      if (!full && isFullscreen) setHasExited(true)
      setIsFullscreen(full)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [isFullscreen])

  return { isFullscreen, hasExited, setHasExited, requestFullscreen, exitFullscreen }
}
