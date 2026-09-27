import apiClient from './client'
import type { Project, CreateProjectData, Milestone, MemberContact, ProjectUpdate } from '../types/project.types'

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
      team_size: data.teamSize || 4,
      timeline: data.timeline || '3 months',
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

  inviteMember: async (projectId: string, studentId: string): Promise<{ status: string; message: string }> => {
    const res = await apiClient.post<{ status: string; message: string }>(`/projects/${projectId}/invite`, {
      student_id: studentId,
    })
    return res.data
  },

  getMemberContacts: async (projectId: string): Promise<MemberContact[]> => {
    try {
      const res = await apiClient.get<MemberContact[]>(`/projects/${projectId}/members/contacts`)
      return res.data || []
    } catch {
      return []
    }
  },

  getProjectUpdates: async (projectId: string): Promise<ProjectUpdate[]> => {
    const res = await apiClient.get<ProjectUpdate[]>(`/projects/${projectId}/updates`)
    return res.data
  },

  postProjectUpdate: async (projectId: string, tag: string, message: string): Promise<ProjectUpdate> => {
    const res = await apiClient.post<ProjectUpdate>(`/projects/${projectId}/updates`, { tag, message })
    return res.data
  },

  deleteProject: async (id: string): Promise<{ status: string; message: string }> => {
    const res = await apiClient.delete<{ status: string; message: string }>(`/projects/${id}`)
    return res.data
  },
}

