export type TaskStatus = 'Backlog' | 'In Progress' | 'In Review' | 'Done'
export type TaskPriority = 'High' | 'Medium' | 'Low'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId?: string
  assigneeName?: string
  assigneeAvatar?: string
  dueDate?: string
  labels: string[]
  projectId: string
  createdAt: string
}

export interface KanbanColumn {
  id: TaskStatus
  title: TaskStatus
  taskIds: string[]
  color: string
}

export interface Project {
  id: string
  title: string
  description: string
  techStack: string[]
  teamSize: number
  timeline: string
  status: 'Active' | 'Completed' | 'Archived'
  progress: number
  members: ProjectMember[]
  startDate: string
  endDate?: string
  tasks: Task[]
  createdBy: string
}

export interface ProjectMember {
  id: string
  name: string
  role: string
  avatar?: string
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  description: string
  dueDate: string
  status: 'completed' | 'active' | 'upcoming'
  progress?: number
}

export interface CreateProjectData {
  title: string
  description: string
  techStack: string[]
  teamSize?: number
  timeline?: string
}

export interface MemberContact {
  memberId: string
  userId: string
  name: string
  role: string
  avatar: string
  email: string
  rollNumber: string
  batch: string
  department: string
  github: string
  linkedin: string
  trustScore: number
}

export type UpdateTag = 'done' | 'in_progress' | 'blocked' | 'review' | 'idea'

export interface ProjectUpdate {
  id: string
  projectId: string
  studentId: string
  studentName: string
  studentAvatar: string
  tag: UpdateTag
  message: string
  createdAt: string
}
