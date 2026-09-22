import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

export function LoadingSpinner({ size = 'md', color = '#6366f1', className = '' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3'
  }

  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-t-transparent ${sizeMap[size]} ${className}`}
      style={{ borderColor: `${color} transparent transparent transparent` }}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
export default LoadingSpinner
