import apiClient from './client'
import type { LoginCredentials, RegisterStep1Data, RegisterStep2Data, User } from '../types/auth.types'

export interface AuthResponse {
  access_token: string
  token_type: string
  user: User
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return res.data
  },

  registerStep1: async (data: RegisterStep1Data): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/auth/register-step1', {
      name: data.name,
      email: data.email,
      department: data.department,
      year: data.year,
      batch: data.batch,
      roll_number: data.rollNumber,
    })
    return res.data
  },

  verifyOtpAndRegister: async (
    step2: RegisterStep2Data,
    step1: RegisterStep1Data
  ): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/verify-otp-register', {
      email: step1.email,
      otp: step2.otp,
      password: step2.password,
    }, {
      params: {
        name: step1.name,
        department: step1.department,
        year: step1.year,
        batch: step1.batch,
        roll_number: step1.rollNumber,
      }
    })
    return res.data
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me')
    return res.data
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const res = await apiClient.post<{ message: string }>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return res.data
  },
}
