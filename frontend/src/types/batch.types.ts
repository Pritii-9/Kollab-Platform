export interface Batch {
  id: string
  name: string
  department: string
  year: number
  section: string
  coordinator: string
  academicYear: string
  totalStudents: number
  skillVerified: number
  activeProjects: number
  placementReady: number
  readinessPercent: number
  status: 'Active' | 'Completed' | 'Upcoming'
}

export interface CreateBatchData {
  department: string
  year: string
  section: string
  coordinator: string
  academicYear: string
}
