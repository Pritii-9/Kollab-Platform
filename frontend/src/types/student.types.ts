export interface SkillItem {
  id: string
  name: string
  status: 'verified' | 'pending' | 'failed'
  score: number
  lastTested?: string
}

export interface PeerReview {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  projectName: string
  rating: number
  comment: string
  date: string
}

export interface Availability {
  openToProjects: boolean
  preferredRoles: string[]
}

export interface Student {
  id: string
  name: string
  email: string
  rollNumber: string
  department: string
  year: number
  batch: string
  cgpa: number
  avatar?: string
  trustScore: number
  placementStatus: 'Placed' | 'Eligible' | 'Ineligible' | 'In Process'
  skills: SkillItem[]
  github?: string
  linkedin?: string
  bio?: string
  reviews: PeerReview[]
  availability: Availability
  testsCompleted: number
  projectsJoined: number
  joinedAt: string
}

export interface StudentCardData {
  id: string
  name: string
  avatar?: string
  batch: string
  year: number
  department: string
  trustScore: number
  matchPercentage: number
  skills: string[]
  cgpa: number
  placementStatus: Student['placementStatus']
}

export interface TimelineEvent {
  id: string
  year: number
  title: string
  description: string
  date: string
  status: 'completed' | 'active' | 'upcoming'
  type: 'profile' | 'test' | 'project' | 'review' | 'github' | 'placement'
}
