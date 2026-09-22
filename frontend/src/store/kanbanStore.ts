import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskStatus } from '../types/project.types'
import { MOCK_TASKS } from '../utils/mockData'

interface KanbanStore {
  tasks: Record<string, Task>
  columns: { id: TaskStatus; taskIds: string[] }[]
  activeTaskId: string | null

  setActiveTask: (id: string | null) => void
  moveTask: (taskId: string, newStatus: TaskStatus) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
}

const initialTasks: Record<string, Task> = {}
MOCK_TASKS.forEach((t) => { initialTasks[t.id] = t })

const buildColumns = (tasks: Record<string, Task>) => {
  const cols: KanbanStore['columns'] = [
    { id: 'Backlog',     taskIds: [] },
    { id: 'In Progress', taskIds: [] },
    { id: 'In Review',   taskIds: [] },
    { id: 'Done',        taskIds: [] },
  ]
  Object.values(tasks).forEach((t) => {
    const col = cols.find((c) => c.id === t.status)
    if (col) col.taskIds.push(t.id)
  })
  return cols
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      tasks: {},
      columns: buildColumns({}),
      activeTaskId: null,

      setActiveTask: (id) => set({ activeTaskId: id }),

      moveTask: (taskId, newStatus) => {
        set((state) => {
          const tasks = { ...state.tasks }
          if (!tasks[taskId]) return state
          tasks[taskId] = { ...tasks[taskId], status: newStatus }
          return { tasks, columns: buildColumns(tasks) }
        })
      },

      addTask: (taskData) => {
        const id = `t${Date.now()}`
        const task: Task = {
          ...taskData,
          id,
          createdAt: new Date().toISOString(),
        }
        set((state) => {
          const tasks = { ...state.tasks, [id]: task }
          return { tasks, columns: buildColumns(tasks) }
        })
      },

      updateTask: (taskId, updates) => {
        set((state) => {
          const tasks = { ...state.tasks }
          if (!tasks[taskId]) return state
          tasks[taskId] = { ...tasks[taskId], ...updates }
          return { tasks, columns: buildColumns(tasks) }
        })
      },

      deleteTask: (taskId) => {
        set((state) => {
          const tasks = { ...state.tasks }
          delete tasks[taskId]
          return { tasks, columns: buildColumns(tasks) }
        })
      },
    }),
    {
      name: 'kollab-kanban-tasks',
      partialize: (state) => ({ tasks: state.tasks })
    }
  )
)
