import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ProtectedRouteProps {
  role: 'coordinator' | 'student'
  children: React.ReactNode
}

export default function ProtectedRoute({ role, children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== role) {
    const redirectPath = user?.role === 'coordinator' ? '/coordinator/dashboard' : '/student/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return <>{children}</>
}
