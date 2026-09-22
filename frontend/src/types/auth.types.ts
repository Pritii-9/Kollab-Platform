export type UserRole = 'coordinator' | 'student'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  department?: string
  year?: number
  batch?: string
  rollNumber?: string
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterStep1Data {
  name: string
  email: string
  department: string
  year: string
  batch: string
  rollNumber: string
}

export interface RegisterStep2Data {
  otp: string
  password: string
  confirmPassword: string
}

export interface OTPVerifyData {
  email: string
  otp: string
  password: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
