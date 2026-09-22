export interface BatchReport {
  id: string
  batchName: string
  department: string
  year: number
  totalStudents: number
  skillVerified: number
  avgCGPA: number
  readinessPercent: number
  placedCount: number
  topSkills: string[]
  status: 'On Track' | 'Needs Attention' | 'Critical'
}

export interface StudentReport {
  id: string
  studentName: string
  rollNumber: string
  batch: string
  cgpa: number
  trustScore: number
  skillsVerified: number
  projectsCompleted: number
  placementStatus: string
}

export interface PlacementReport {
  totalEligible: number
  totalPlaced: number
  avgPackage: number
  topRecruiters: string[]
  monthlyData: { month: string; placed: number }[]
}
