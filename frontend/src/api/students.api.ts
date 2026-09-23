import apiClient from './client'
import type { Student, StudentCardData, TimelineEvent } from '../types/student.types'

export interface TeammateMatchResult {
  id: string
  name: string
  email: string
  rollNumber: string
  department: string
  year: number
  cgpa: number
  trustScore: number
  placementStatus: string
  avatar?: string
  matchPercentage: number
  matchedSkills: string[]
  otherSkills: string[]
  bio: string
  github?: string
  linkedin?: string
  reason: string
}

export interface PlacementReadinessResult {
  studentId: string
  studentName: string
  readinessScore: number
  status: string
  riskLevel: string
  verifiedSkillsCount: number
  testsCompletedCount: number
  tasksCompletedCount: number
  radarData: { subject: string; current: number; target: number }[]
  recommendations: string[]
}

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

  recommendTeammates: async (skills?: string[], role?: string): Promise<TeammateMatchResult[]> => {
    const res = await apiClient.get<TeammateMatchResult[]>('/students/recommend-teammates', {
      params: { skills: skills?.join(','), role }
    })
    return res.data
  },

  getPlacementReadiness: async (): Promise<PlacementReadinessResult> => {
    const res = await apiClient.get<PlacementReadinessResult>('/students/me/readiness')
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
