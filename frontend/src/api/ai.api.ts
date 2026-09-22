import apiClient from './client'

export const aiApi = {
  enhanceBullet: async (rawBullet: string, targetRole: string = 'Full Stack Developer'): Promise<{ bullets: string[] }> => {
    const res = await apiClient.post<{ bullets: string[] }>('/ai/enhance-bullet', {
      rawBullet,
      targetRole,
    })
    return res.data
  },

  analyzeSkillGap: async (skills: string[], targetRole: string): Promise<any> => {
    const res = await apiClient.post<any>('/ai/skill-gap', {
      skills,
      targetRole,
    })
    return res.data
  },

  recommendRoles: async (skills: string[]): Promise<{ roles: any[] }> => {
    const res = await apiClient.post<{ roles: any[] }>('/ai/recommend-roles', {
      skills,
    })
    return res.data
  },

  generateQuestions: async (skill: string, difficulty: string = 'Medium', count: number = 5): Promise<{ questions: any[] }> => {
    const res = await apiClient.post<{ questions: any[] }>('/ai/generate-questions', {
      skill,
      difficulty,
      count,
    })
    return res.data
  },
}
