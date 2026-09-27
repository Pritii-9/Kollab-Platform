import apiClient from './client'

export interface ChatProject {
  id: string
  title: string
  description: string
  techStack: string[]
  memberCount: number
  members: {
    id: string
    userId: string
    name: string
    role: string
    avatar: string
    status: string
  }[]
}

export interface ChatMember {
  id: string
  userId: string
  name: string
  role: string
  status: string
  avatar: string
  email: string
  trustScore: number
  isOnline: boolean
}

export interface ChatMessage {
  id: string
  projectId: string
  channel: string
  senderId: string
  sender: string
  avatar: string
  text: string
  time: string
  createdAt: string
  isSelf: boolean
}

export const chatApi = {
  getMyProjects: async (): Promise<ChatProject[]> => {
    const res = await apiClient.get('/chat/my-projects')
    return res.data
  },

  getProjectMembers: async (projectId: string): Promise<ChatMember[]> => {
    const res = await apiClient.get(`/chat/projects/${projectId}/members`)
    return res.data
  },

  getMessages: async (projectId: string, channel: string = 'general'): Promise<ChatMessage[]> => {
    const res = await apiClient.get(`/chat/projects/${projectId}/messages`, {
      params: { channel }
    })
    return res.data
  },

  sendMessage: async (projectId: string, channel: string, text: string): Promise<ChatMessage> => {
    const res = await apiClient.post(`/chat/projects/${projectId}/messages`, {
      channel,
      text
    })
    return res.data
  }
}
