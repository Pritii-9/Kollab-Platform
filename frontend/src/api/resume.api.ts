import apiClient from './client'

export const resumeApi = {
  uploadResume: async (file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  getVersions: async (): Promise<Array<{ version: string; name: string; date: string }>> => {
    const res = await apiClient.get<Array<{ version: string; name: string; date: string }>>('/resume/versions')
    return res.data
  },
}
