import apiClient from './client'
import type { Project, CreateProjectData, Milestone } from '../types/project.types'

export const projectsApi = {
  listProjects: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects')
    return res.data
  },

  createProject: async (data: CreateProjectData): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects', {
      title: data.title,
      description: data.description,
      tech_stack: data.techStack,
      team_size: data.teamSize,
      timeline: data.timeline,
    })
    return res.data
  },

  getProjectById: async (id: string): Promise<Project> => {
    const res = await apiClient.get<Project>(`/projects/${id}`)
    return res.data
  },

  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    const res = await apiClient.get<Milestone[]>(`/projects/${projectId}/milestones`)
    return res.data
  },
}
