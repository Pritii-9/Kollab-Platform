import apiClient from './client'
import type { Student, StudentCardData, TimelineEvent } from '../types/student.types'

export const studentsApi = {
  getRoster: async (params?: {
    search?: string
    year?: number | string
    batch?: string
    placement_status?: string
  }): Promise<Student[]> => {
    const res = await apiClient.get<Student[]>('/students', { params })
    return res.data
  },

  getTeammates: async (params?: {
    search?: string
    skill?: string
    year?: number | string
  }): Promise<StudentCardData[]> => {
    const res = await apiClient.get<StudentCardData[]>('/students/teammates', { params })
    return res.data
  },

  getStudentById: async (id: string): Promise<Student> => {
    const res = await apiClient.get<Student>(`/students/${id}`)
    return res.data
  },

  getMyProfile: async (): Promise<Student> => {
    const res = await apiClient.get<Student>('/students/me/profile')
    return res.data
  },

  updateProfile: async (updates: Partial<Student>): Promise<Student> => {
    const res = await apiClient.put<Student>('/students/me/profile', updates)
    return res.data
  },

  getTimeline: async (studentId: string): Promise<TimelineEvent[]> => {
    const res = await apiClient.get<TimelineEvent[]>(`/students/${studentId}/timeline`)
    return res.data
  },
}
