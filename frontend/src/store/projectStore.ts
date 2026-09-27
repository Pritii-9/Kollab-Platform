import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, CreateProjectData, Task } from '../types/project.types'
import { projectsApi } from '../api/projects.api'

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
  deleteProject: (id: string) => Promise<void>
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
        const existing = get().projects.find((p) => p.id === id)
        if (existing) {
          set({ activeProject: existing })
          return existing
        }

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
        
        const nowStr = new Date().toISOString().split('T')[0]
        const projId = `p-${Date.now()}`

        const defaultTasks: Task[] = [
          {
            id: `t-${Date.now()}-1`,
            title: 'Design Architecture & Database Schema',
            description: `Model data structures and relational schemas for ${data.title}.`,
            status: 'In Progress' as const,
            priority: 'High' as const,
            assigneeName: currentUserName,
            assigneeId: currentUserId,
            dueDate: nowStr,
            labels: ['Backend', 'Database'],
            projectId: projId,
            createdAt: nowStr
          },
          {
            id: `t-${Date.now()}-2`,
            title: 'Implement JWT Auth & Core API Endpoints',
            description: `Construct secure backend route handlers and middleware for ${data.title}.`,
            status: 'Backlog' as const,
            priority: 'High' as const,
            assigneeName: currentUserName,
            assigneeId: currentUserId,
            dueDate: nowStr,
            labels: ['Security', 'API'],
            projectId: projId,
            createdAt: nowStr
          },
          {
            id: `t-${Date.now()}-3`,
            title: 'Build Responsive Frontend UI & Client Store',
            description: `Integrate Tailwind/React components and state management for ${data.title}.`,
            status: 'Backlog' as const,
            priority: 'Medium' as const,
            assigneeName: currentUserName,
            assigneeId: currentUserId,
            dueDate: nowStr,
            labels: ['Frontend', 'UI'],
            projectId: projId,
            createdAt: nowStr
          },
          {
            id: `t-${Date.now()}-4`,
            title: 'Write Tests, Audit Verification & Deploy Build',
            description: `Run test suite, verify contribution metrics, and deploy ${data.title} container.`,
            status: 'Backlog' as const,
            priority: 'Medium' as const,
            assigneeName: currentUserName,
            assigneeId: currentUserId,
            dueDate: nowStr,
            labels: ['DevOps', 'Testing'],
            projectId: projId,
            createdAt: nowStr
          }
        ]

        const localNewProject: Project = {
          id: projId,
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
          startDate: nowStr,
          tasks: defaultTasks,
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

      deleteProject: async (id: string) => {
        try {
          await projectsApi.deleteProject(id)
        } catch (err: any) {
          console.warn(`Failed to delete project ${id} on backend:`, err?.message)
        }
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          activeProject: state.activeProject?.id === id ? null : state.activeProject
        }))
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

