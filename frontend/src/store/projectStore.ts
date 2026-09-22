import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, CreateProjectData, Task, Milestone } from '../types/project.types'
import { projectsApi } from '../api/projects.api'
import { MOCK_PROJECTS } from '../utils/mockData'

interface ProjectStore {
  projects: Project[]
  activeProject: Project | null
  loading: boolean
  error: string | null

  fetchProjects: () => Promise<void>
  getProjectById: (id: string) => Promise<Project | null>
  createProject: (data: CreateProjectData, currentUserId?: string, currentUserName?: string) => Promise<Project>
  updateProjectProgress: (projectId: string, progress: number) => void
  addMemberToProject: (projectId: string, member: { id: string; name: string; role: string }) => void
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProject: null,
      loading: false,
      error: null,

      fetchProjects: async () => {
        set({ loading: true, error: null })
        try {
          const apiProjects = await projectsApi.listProjects()
          if (apiProjects && apiProjects.length > 0) {
            // Merge API projects with locally saved user created projects that may not be in DB yet
            const existingProjects = get().projects
            const localOnly = existingProjects.filter(
              (p) => p.id.startsWith('p-') && !apiProjects.some((ap) => ap.id === p.id)
            )
            set({ projects: [...apiProjects, ...localOnly], loading: false })
          } else {
            set({ loading: false })
          }
        } catch (err: any) {
          console.warn('API fetch failed, utilizing persistent local projects:', err?.message)
          set({ loading: false })
        }
      },

      getProjectById: async (id: string) => {
        // First check in-memory store
        const existing = get().projects.find((p) => p.id === id)
        if (existing) {
          set({ activeProject: existing })
          return existing
        }

        // Try fetching from API
        try {
          const fetched = await projectsApi.getProjectById(id)
          if (fetched) {
            set((state) => ({
              projects: state.projects.some((p) => p.id === fetched.id)
                ? state.projects.map((p) => (p.id === fetched.id ? fetched : p))
                : [fetched, ...state.projects],
              activeProject: fetched
            }))
            return fetched
          }
        } catch (err) {
          console.warn(`Project with id ${id} not found in backend API:`, err)
        }

        set({ activeProject: null })
        return null
      },

      createProject: async (data: CreateProjectData, currentUserId = 'u1', currentUserName = 'Student') => {
        set({ loading: true, error: null })
        
        const localNewProject: Project = {
          id: `p-${Date.now()}`,
          title: data.title,
          description: data.description,
          techStack: data.techStack,
          teamSize: data.teamSize || 4,
          timeline: data.timeline || '3 months',
          status: 'Active',
          progress: 0,
          members: [
            { id: currentUserId, name: currentUserName, role: 'Leader' }
          ],
          startDate: new Date().toISOString().split('T')[0],
          tasks: [],
          createdBy: currentUserId
        }

        try {
          const createdFromApi = await projectsApi.createProject(data)
          const finalProj = createdFromApi || localNewProject
          set((state) => ({
            projects: [finalProj, ...state.projects],
            activeProject: finalProj,
            loading: false
          }))
          return finalProj
        } catch (err: any) {
          console.warn('API create call failed, saving project locally to state & storage:', err?.message)
          set((state) => ({
            projects: [localNewProject, ...state.projects],
            activeProject: localNewProject,
            loading: false
          }))
          return localNewProject
        }
      },

      updateProjectProgress: (projectId: string, progress: number) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, progress } : p
          ),
          activeProject: state.activeProject?.id === projectId
            ? { ...state.activeProject, progress }
            : state.activeProject
        }))
      },

      addMemberToProject: (projectId, member) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            if (p.members.some((m) => m.id === member.id)) return p
            return { ...p, members: [...p.members, member] }
          }),
          activeProject: state.activeProject?.id === projectId
            ? {
                ...state.activeProject,
                members: state.activeProject.members.some((m) => m.id === member.id)
                  ? state.activeProject.members
                  : [...state.activeProject.members, member]
              }
            : state.activeProject
        }))
      }
    }),
    {
      name: 'kollab-projects',
      partialize: (state) => ({ projects: state.projects })
    }
  )
)
