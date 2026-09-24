// Navigation items per role
export const COORDINATOR_NAV = [
  { label: 'Dashboard',     path: '/coordinator/dashboard',    icon: 'LayoutDashboard' },
  { label: 'Batches',       path: '/coordinator/batches',      icon: 'Users' },
  { label: 'Students',      path: '/coordinator/students',     icon: 'GraduationCap' },
  { label: 'Assign Test',   path: '/coordinator/assign-test',  icon: 'ClipboardList' },
  { label: 'Test Results',  path: '/coordinator/test-results', icon: 'FileSpreadsheet' },
  { label: 'Reports',       path: '/coordinator/reports',      icon: 'BarChart2' },
  { label: 'Announcements', path: '/coordinator/announcements',icon: 'Megaphone' },
] as const

export const STUDENT_NAV = [
  { label: 'Dashboard',      path: '/student/dashboard',     icon: 'LayoutDashboard' },
  { label: 'Projects',       path: '/student/projects',      icon: 'FolderKanban' },
  { label: 'Find Teammates', path: '/student/teammates',     icon: 'UserPlus' },
  { label: 'AI Tools',       path: '/student/ai-tools',      icon: 'Sparkles' },
  { label: 'Analytics',      path: '/student/analytics',     icon: 'TrendingUp' },
  { label: 'Resume',         path: '/student/resume',        icon: 'FileText' },
  { label: 'Team Chat',      path: '/student/chat',          icon: 'MessageSquare' },
  { label: 'Settings',       path: '/student/settings',      icon: 'Settings' },
] as const

export const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Chemical Engineering',
  'Biotechnology',
]

export const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'] as const
export const BATCHES = ['A', 'B', 'C'] as const

export const SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'TypeScript',
  'MongoDB', 'PostgreSQL', 'Docker', 'AWS', 'Machine Learning',
  'Data Structures', 'System Design', 'Figma', 'Flutter', 'Go',
  'REST APIs', 'GraphQL', 'Kubernetes', 'Redis', 'Git',
]

export const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express',
  'Python', 'Django', 'FastAPI', 'Java', 'Spring Boot',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase', 'Supabase',
  'Docker', 'AWS', 'GCP', 'TypeScript', 'GraphQL', 'Redis',
]

export const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Developer',
  'Data Scientist',
  'ML Engineer',
  'DevOps Engineer',
  'Mobile Developer',
  'UI/UX Designer',
  'Product Manager',
  'Cloud Engineer',
]

export const PLACEMENT_STATUS = {
  PLACED:     'Placed',
  ELIGIBLE:   'Eligible',
  INELIGIBLE: 'Ineligible',
  PROCESS:    'In Process',
} as const

export const SKILL_STATUS = {
  VERIFIED: 'verified',
  PENDING:  'pending',
  FAILED:   'failed',
} as const

export const TASK_PRIORITIES = ['High', 'Medium', 'Low'] as const
export const TASK_STATUSES   = ['Backlog', 'In Progress', 'In Review', 'Done'] as const

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard', 'Mixed'] as const
export const TIME_LIMITS       = [30, 45, 60] as const
