import apiClient from './client'
import type { Task } from '../types/project.types'

export const kanbanApi = {
  getTasks: async (projectId: string): Promise<Task[]> => {
    const res = await apiClient.get<Task[]>(`/projects/${projectId}/tasks`)
    return res.data
  },

  createTask: async (projectId: string, task: Partial<Task>): Promise<Task> => {
    const res = await apiClient.post<Task>(`/projects/${projectId}/tasks`, task)
    return res.data
  },

  updateTask: async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const res = await apiClient.put<Task>(`/projects/tasks/${taskId}`, updates)
    return res.data
  },

  deleteTask: async (taskId: string): Promise<{ status: string }> => {
    const res = await apiClient.delete<{ status: string }>(`/projects/tasks/${taskId}`)
    return res.data
  },
}
