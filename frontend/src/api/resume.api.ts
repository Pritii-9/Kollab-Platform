import apiClient from './client'

export interface ResumeItem {
  id: string
  version?: string
  title: string
  name: string
  url: string
  stored_path?: string
  size: string
  date: string
  is_primary: boolean
  highlights?: string[]
}

export const resumeApi = {
  uploadResume: async (file: File, title?: string, isPrimary = true): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    formData.append('is_primary', isPrimary ? 'true' : 'false')

    const res = await apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  getMyResumes: async (): Promise<{ url: string | null; name: string | null; primary: ResumeItem | null; resumes: ResumeItem[] }> => {
    const res = await apiClient.get('/resume/me')
    return res.data
  },

  setPrimary: async (resumeId: string): Promise<any> => {
    const res = await apiClient.put(`/resume/set-primary/${resumeId}`)
    return res.data
  },

  deleteResume: async (resumeId: string): Promise<any> => {
    const res = await apiClient.delete(`/resume/${resumeId}`)
    return res.data
  },

  getVersions: async (): Promise<ResumeItem[]> => {
    const res = await apiClient.get<ResumeItem[]>('/resume/versions')
    return res.data
  },
}
