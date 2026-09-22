import type { Student, TimelineEvent } from '../types/student.types'
import type { Batch } from '../types/batch.types'
import type { Project, Task, Milestone } from '../types/project.types'
import type { Test, TestResult } from '../types/test.types'
import type { BatchReport } from '../types/report.types'

// ── Students ──────────────────────────────────────────────────────
export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1', name: 'Aanya Sharma', email: 'aanya@college.edu',
    rollNumber: 'CSE21001', department: 'Computer Science & Engineering',
    year: 3, batch: 'A', cgpa: 8.9, avatar: undefined,
    trustScore: 92, placementStatus: 'Eligible',
    skills: [
      { id: 'sk1', name: 'React',    status: 'verified', score: 88 },
      { id: 'sk2', name: 'Node.js',  status: 'verified', score: 82 },
      { id: 'sk3', name: 'Python',   status: 'pending',  score: 65 },
      { id: 'sk4', name: 'MongoDB',  status: 'verified', score: 79 },
    ],
    github: 'github.com/aanya', linkedin: 'linkedin.com/in/aanya',
    bio: 'Full stack developer passionate about scalable web applications.',
    reviews: [
      { id: 'r1', reviewerId: 's2', reviewerName: 'Rohan Mehta', projectName: 'EduPortal', rating: 5, comment: 'Excellent collaborator, always on time!', date: '2025-03-15' },
    ],
    availability: { openToProjects: true, preferredRoles: ['Frontend', 'Fullstack'] },
    testsCompleted: 7, projectsJoined: 3, joinedAt: '2021-08-01',
  },
  {
    id: 's2', name: 'Rohan Mehta', email: 'rohan@college.edu',
    rollNumber: 'CSE21002', department: 'Computer Science & Engineering',
    year: 3, batch: 'A', cgpa: 8.2, avatar: undefined,
    trustScore: 78, placementStatus: 'Eligible',
    skills: [
      { id: 'sk5', name: 'Python',   status: 'verified', score: 91 },
      { id: 'sk6', name: 'ML',       status: 'verified', score: 85 },
      { id: 'sk7', name: 'React',    status: 'pending',  score: 60 },
    ],
    github: 'github.com/rohan', linkedin: undefined, bio: 'Data science enthusiast.',
    reviews: [], availability: { openToProjects: true, preferredRoles: ['Backend', 'ML'] },
    testsCompleted: 5, projectsJoined: 2, joinedAt: '2021-08-01',
  },
  {
    id: 's3', name: 'Priya Nair', email: 'priya@college.edu',
    rollNumber: 'CSE22001', department: 'Computer Science & Engineering',
    year: 2, batch: 'B', cgpa: 9.1, avatar: undefined,
    trustScore: 95, placementStatus: 'Eligible',
    skills: [
      { id: 'sk8',  name: 'TypeScript', status: 'verified', score: 94 },
      { id: 'sk9',  name: 'React',      status: 'verified', score: 90 },
      { id: 'sk10', name: 'AWS',        status: 'verified', score: 72 },
    ],
    github: 'github.com/priya', linkedin: 'linkedin.com/in/priya',
    bio: 'TypeScript enthusiast and open source contributor.',
    reviews: [
      { id: 'r2', reviewerId: 's4', reviewerName: 'Arjun Singh', projectName: 'HealthTrack', rating: 5, comment: 'Amazing problem-solver!', date: '2025-04-01' },
    ],
    availability: { openToProjects: true, preferredRoles: ['Frontend'] },
    testsCompleted: 9, projectsJoined: 4, joinedAt: '2022-08-01',
  },
  {
    id: 's4', name: 'Arjun Singh', email: 'arjun@college.edu',
    rollNumber: 'CSE20001', department: 'Computer Science & Engineering',
    year: 4, batch: 'C', cgpa: 7.8, avatar: undefined,
    trustScore: 68, placementStatus: 'In Process',
    skills: [
      { id: 'sk11', name: 'Java',       status: 'verified', score: 80 },
      { id: 'sk12', name: 'Spring Boot', status: 'pending', score: 55 },
      { id: 'sk13', name: 'Docker',     status: 'failed',   score: 40 },
    ],
    github: 'github.com/arjun', linkedin: undefined, bio: 'Backend Java developer.',
    reviews: [], availability: { openToProjects: false, preferredRoles: ['Backend'] },
    testsCompleted: 4, projectsJoined: 2, joinedAt: '2020-08-01',
  },
  {
    id: 's5', name: 'Sneha Patel', email: 'sneha@college.edu',
    rollNumber: 'IT21003', department: 'Information Technology',
    year: 3, batch: 'A', cgpa: 8.5, avatar: undefined,
    trustScore: 84, placementStatus: 'Eligible',
    skills: [
      { id: 'sk14', name: 'Flutter',    status: 'verified', score: 88 },
      { id: 'sk15', name: 'Firebase',   status: 'verified', score: 82 },
      { id: 'sk16', name: 'Dart',       status: 'pending',  score: 70 },
    ],
    github: 'github.com/sneha', linkedin: 'linkedin.com/in/sneha',
    bio: 'Mobile dev, flutter lover.',
    reviews: [], availability: { openToProjects: true, preferredRoles: ['Mobile', 'Frontend'] },
    testsCompleted: 6, projectsJoined: 3, joinedAt: '2021-08-01',
  },
  {
    id: 's6', name: 'Karan Verma', email: 'karan@college.edu',
    rollNumber: 'CSE23001', department: 'Computer Science & Engineering',
    year: 1, batch: 'B', cgpa: 7.5, avatar: undefined,
    trustScore: 52, placementStatus: 'Ineligible',
    skills: [
      { id: 'sk17', name: 'Python', status: 'pending', score: 45 },
      { id: 'sk18', name: 'Git',    status: 'verified', score: 70 },
    ],
    github: undefined, linkedin: undefined, bio: 'First year CSE student learning the ropes.',
    reviews: [], availability: { openToProjects: true, preferredRoles: ['Backend'] },
    testsCompleted: 2, projectsJoined: 1, joinedAt: '2023-08-01',
  },
  {
    id: 's7', name: 'Divya Reddy', email: 'divya@college.edu',
    rollNumber: 'EC21002', department: 'Electronics & Communication',
    year: 3, batch: 'A', cgpa: 8.0, avatar: undefined,
    trustScore: 73, placementStatus: 'Eligible',
    skills: [
      { id: 'sk19', name: 'Python',      status: 'verified', score: 76 },
      { id: 'sk20', name: 'ML',          status: 'pending',  score: 61 },
      { id: 'sk21', name: 'Data Structures', status: 'verified', score: 83 },
    ],
    github: 'github.com/divya', linkedin: undefined, bio: 'IoT + ML enthusiast.',
    reviews: [], availability: { openToProjects: true, preferredRoles: ['Backend', 'ML'] },
    testsCompleted: 5, projectsJoined: 2, joinedAt: '2021-08-01',
  },
  {
    id: 's8', name: 'Vikram Joshi', email: 'vikram@college.edu',
    rollNumber: 'CSE20002', department: 'Computer Science & Engineering',
    year: 4, batch: 'A', cgpa: 9.3, avatar: undefined,
    trustScore: 97, placementStatus: 'Placed',
    skills: [
      { id: 'sk22', name: 'System Design', status: 'verified', score: 96 },
      { id: 'sk23', name: 'Go',            status: 'verified', score: 90 },
      { id: 'sk24', name: 'Kubernetes',    status: 'verified', score: 85 },
      { id: 'sk25', name: 'PostgreSQL',    status: 'verified', score: 88 },
    ],
    github: 'github.com/vikram', linkedin: 'linkedin.com/in/vikram',
    bio: 'SWE @ Google. Loves distributed systems.',
    reviews: [
      { id: 'r3', reviewerId: 's3', reviewerName: 'Priya Nair', projectName: 'CloudDeploy', rating: 5, comment: 'World-class engineer!', date: '2025-05-01' },
    ],
    availability: { openToProjects: false, preferredRoles: [] },
    testsCompleted: 12, projectsJoined: 6, joinedAt: '2020-08-01',
  },
  {
    id: 's9', name: 'Neha Gupta', email: 'neha@college.edu',
    rollNumber: 'IT22002', department: 'Information Technology',
    year: 2, batch: 'C', cgpa: 7.9, avatar: undefined,
    trustScore: 61, placementStatus: 'Eligible',
    skills: [
      { id: 'sk26', name: 'React',       status: 'pending',  score: 58 },
      { id: 'sk27', name: 'JavaScript',  status: 'verified', score: 74 },
    ],
    github: undefined, linkedin: undefined, bio: 'Learning React and web development.',
    reviews: [], availability: { openToProjects: true, preferredRoles: ['Frontend'] },
    testsCompleted: 3, projectsJoined: 1, joinedAt: '2022-08-01',
  },
  {
    id: 's10', name: 'Rahul Das', email: 'rahul@college.edu',
    rollNumber: 'CSE22003', department: 'Computer Science & Engineering',
    year: 2, batch: 'A', cgpa: 8.4, avatar: undefined,
    trustScore: 80, placementStatus: 'Eligible',
    skills: [
      { id: 'sk28', name: 'Node.js',   status: 'verified', score: 81 },
      { id: 'sk29', name: 'MongoDB',   status: 'verified', score: 77 },
      { id: 'sk30', name: 'Express',   status: 'verified', score: 79 },
    ],
    github: 'github.com/rahul', linkedin: 'linkedin.com/in/rahul',
    bio: 'MERN stack developer.',
    reviews: [], availability: { openToProjects: true, preferredRoles: ['Backend', 'Fullstack'] },
    testsCompleted: 6, projectsJoined: 2, joinedAt: '2022-08-01',
  },
  {
    id: 's11', name: 'Ananya Krishnan', email: 'ananya@college.edu',
    rollNumber: 'CSE21004', department: 'Computer Science & Engineering',
    year: 3, batch: 'B', cgpa: 8.7, avatar: undefined,
    trustScore: 88, placementStatus: 'Eligible',
    skills: [
      { id: 'sk31', name: 'Figma',    status: 'verified', score: 90 },
      { id: 'sk32', name: 'React',    status: 'verified', score: 86 },
      { id: 'sk33', name: 'CSS',      status: 'verified', score: 92 },
    ],
    github: 'github.com/ananya', linkedin: 'linkedin.com/in/ananya',
    bio: 'UI/UX Designer + Frontend dev.',
    reviews: [], availability: { openToProjects: true, preferredRoles: ['UI/UX', 'Frontend'] },
    testsCompleted: 8, projectsJoined: 4, joinedAt: '2021-08-01',
  },
  {
    id: 's12', name: 'Dev Malhotra', email: 'dev@college.edu',
    rollNumber: 'CSE20003', department: 'Computer Science & Engineering',
    year: 4, batch: 'B', cgpa: 8.1, avatar: undefined,
    trustScore: 75, placementStatus: 'In Process',
    skills: [
      { id: 'sk34', name: 'AWS',    status: 'verified', score: 83 },
      { id: 'sk35', name: 'Docker', status: 'verified', score: 79 },
      { id: 'sk36', name: 'Python', status: 'verified', score: 75 },
    ],
    github: 'github.com/dev', linkedin: 'linkedin.com/in/dev',
    bio: 'Cloud + DevOps engineer.',
    reviews: [], availability: { openToProjects: false, preferredRoles: ['DevOps', 'Backend'] },
    testsCompleted: 7, projectsJoined: 3, joinedAt: '2020-08-01',
  },
]

// ── Batches ───────────────────────────────────────────────────────
export const MOCK_BATCHES: Batch[] = [
  { id: 'b1', name: 'CSE Y1 A', department: 'CSE', year: 1, section: 'A', coordinator: 'Dr. Ravi Shankar', academicYear: '2025-26', totalStudents: 40, skillVerified: 12, activeProjects: 4, placementReady: 0, readinessPercent: 15, status: 'Active' },
  { id: 'b2', name: 'CSE Y1 B', department: 'CSE', year: 1, section: 'B', coordinator: 'Dr. Meena Iyer', academicYear: '2025-26', totalStudents: 38, skillVerified: 9,  activeProjects: 3, placementReady: 0, readinessPercent: 12, status: 'Active' },
  { id: 'b3', name: 'CSE Y1 C', department: 'CSE', year: 1, section: 'C', coordinator: 'Prof. Suresh K', academicYear: '2025-26', totalStudents: 42, skillVerified: 14, activeProjects: 5, placementReady: 0, readinessPercent: 18, status: 'Active' },
  { id: 'b4', name: 'CSE Y2 A', department: 'CSE', year: 2, section: 'A', coordinator: 'Dr. Ravi Shankar', academicYear: '2024-25', totalStudents: 39, skillVerified: 22, activeProjects: 8, placementReady: 0, readinessPercent: 42, status: 'Active' },
  { id: 'b5', name: 'CSE Y2 B', department: 'CSE', year: 2, section: 'B', coordinator: 'Dr. Meena Iyer', academicYear: '2024-25', totalStudents: 40, skillVerified: 18, activeProjects: 6, placementReady: 0, readinessPercent: 35, status: 'Active' },
  { id: 'b6', name: 'CSE Y2 C', department: 'CSE', year: 2, section: 'C', coordinator: 'Prof. Anita V', academicYear: '2024-25', totalStudents: 41, skillVerified: 25, activeProjects: 9, placementReady: 0, readinessPercent: 48, status: 'Active' },
]

// ── Activity chart data ────────────────────────────────────────────
export const MOCK_ACTIVITY_DATA = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  tests:    Math.floor(Math.random() * 20 + 5),
  projects: Math.floor(Math.random() * 15 + 2),
  profiles: Math.floor(Math.random() * 10 + 1),
}))

// ── Projects ──────────────────────────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1', title: 'EduPortal', description: 'A learning management system for students.',
    techStack: ['React', 'Node.js', 'MongoDB'], teamSize: 4, timeline: '3 months',
    status: 'Active', progress: 65,
    members: [
      { id: 's1', name: 'Aanya Sharma', role: 'Frontend Lead' },
      { id: 's2', name: 'Rohan Mehta',  role: 'Backend Dev' },
      { id: 's3', name: 'Priya Nair',   role: 'UI/UX' },
      { id: 's10', name: 'Rahul Das',   role: 'Backend Dev' },
    ],
    startDate: '2025-01-15', endDate: '2025-04-15',
    tasks: [], createdBy: 's1',
  },
  {
    id: 'p2', title: 'HealthTrack', description: 'Mobile health monitoring with ML predictions.',
    techStack: ['Flutter', 'Python', 'FastAPI', 'Firebase'], teamSize: 3, timeline: '2 months',
    status: 'Active', progress: 45,
    members: [
      { id: 's5', name: 'Sneha Patel',  role: 'Mobile Dev' },
      { id: 's7', name: 'Divya Reddy',  role: 'ML Engineer' },
      { id: 's3', name: 'Priya Nair',   role: 'Backend' },
    ],
    startDate: '2025-02-01', endDate: '2025-04-01',
    tasks: [], createdBy: 's5',
  },
  {
    id: 'p3', title: 'CloudDeploy', description: 'Auto CI/CD platform with container orchestration.',
    techStack: ['Go', 'Kubernetes', 'Docker', 'AWS'], teamSize: 3, timeline: '4 months',
    status: 'Completed', progress: 100,
    members: [
      { id: 's8', name: 'Vikram Joshi', role: 'Architect' },
      { id: 's4', name: 'Arjun Singh',  role: 'DevOps' },
      { id: 's12', name: 'Dev Malhotra', role: 'Backend' },
    ],
    startDate: '2024-09-01', endDate: '2025-01-01',
    tasks: [], createdBy: 's8',
  },
]

// ── Kanban tasks ──────────────────────────────────────────────────
export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Design login page', status: 'Done',        priority: 'High',   assigneeName: 'Aanya',  dueDate: '2025-02-01', labels: ['UI', 'Design'],  projectId: 'p1', createdAt: '2025-01-20' },
  { id: 't2', title: 'Set up auth middleware', status: 'Done',   priority: 'High',   assigneeName: 'Rohan',  dueDate: '2025-02-05', labels: ['Backend'],       projectId: 'p1', createdAt: '2025-01-21' },
  { id: 't3', title: 'Build course list API', status: 'In Progress', priority: 'High', assigneeName: 'Rahul', dueDate: '2025-02-20', labels: ['API', 'Backend'], projectId: 'p1', createdAt: '2025-01-25' },
  { id: 't4', title: 'Student dashboard UI', status: 'In Progress', priority: 'Medium', assigneeName: 'Aanya', dueDate: '2025-02-25', labels: ['UI'],           projectId: 'p1', createdAt: '2025-01-26' },
  { id: 't5', title: 'Unit tests for auth',  status: 'In Review', priority: 'Medium', assigneeName: 'Rohan', dueDate: '2025-02-15', labels: ['Testing'],       projectId: 'p1', createdAt: '2025-01-28' },
  { id: 't6', title: 'Integrate Stripe payments', status: 'Backlog', priority: 'Low', assigneeName: 'Rahul', dueDate: '2025-03-10', labels: ['Payments'],      projectId: 'p1', createdAt: '2025-02-01' },
  { id: 't7', title: 'Push notifications',   status: 'Backlog',   priority: 'Low',   assigneeName: 'Priya',  dueDate: '2025-03-15', labels: ['Mobile'],        projectId: 'p1', createdAt: '2025-02-02' },
  { id: 't8', title: 'Dark mode toggle',     status: 'Backlog',   priority: 'Low',   assigneeName: 'Aanya',  dueDate: '2025-03-20', labels: ['UI'],            projectId: 'p1', createdAt: '2025-02-03' },
]

// ── Milestones ────────────────────────────────────────────────────
export const MOCK_MILESTONES: Milestone[] = [
  { id: 'm1', projectId: 'p1', title: 'Project Kickoff',        description: 'Team onboarding, repo setup, initial planning.',        dueDate: '2025-01-20', status: 'completed' },
  { id: 'm2', projectId: 'p1', title: 'Auth & User Module',     description: 'Login, register, JWT, role-based access.',               dueDate: '2025-02-10', status: 'completed' },
  { id: 'm3', projectId: 'p1', title: 'Core Features MVP',      description: 'Course listing, enrollment, student dashboard.',         dueDate: '2025-03-01', status: 'active', progress: 60 },
  { id: 'm4', projectId: 'p1', title: 'Beta Testing',           description: 'Internal QA, bug fixes, performance optimisation.',      dueDate: '2025-03-25', status: 'upcoming' },
  { id: 'm5', projectId: 'p1', title: 'Production Launch',      description: 'Deploy to AWS, configure CDN, monitor metrics.',         dueDate: '2025-04-15', status: 'upcoming' },
]

// ── Test (sample) ─────────────────────────────────────────────────
export const MOCK_TEST: Test = {
  id: 'test1',
  title: 'React Fundamentals Assessment',
  skillName: 'React',
  difficulty: 'Medium',
  timeLimit: 45,
  attempts: 2,
  antiCheat: { randomizeQuestions: true, randomizeOptions: true, tabDetection: true, fullscreenLock: true },
  assignedTo: 'batch',
  targetBatch: 'CSE Y3 A',
  dueDate: '2025-03-30',
  createdBy: 'coord1',
  createdAt: '2025-03-01',
  questions: [
    {
      id: 'q1', topic: 'Hooks', difficulty: 'Medium',
      text: 'Which hook is used to perform side effects in a React component?',
      options: [
        { id: 'q1a', text: 'useState',    isCorrect: false },
        { id: 'q1b', text: 'useEffect',   isCorrect: true  },
        { id: 'q1c', text: 'useCallback', isCorrect: false },
        { id: 'q1d', text: 'useRef',      isCorrect: false },
      ],
      explanation: 'useEffect runs after render and is used for side effects like data fetching.',
    },
    {
      id: 'q2', topic: 'State', difficulty: 'Easy',
      text: 'What does useState return?',
      options: [
        { id: 'q2a', text: 'Only the state variable', isCorrect: false },
        { id: 'q2b', text: 'An array with state and a setter function', isCorrect: true },
        { id: 'q2c', text: 'A promise', isCorrect: false },
        { id: 'q2d', text: 'An object with state properties', isCorrect: false },
      ],
    },
    {
      id: 'q3', topic: 'Performance', difficulty: 'Hard',
      text: 'Which hook should you use to memoize a function reference?',
      options: [
        { id: 'q3a', text: 'useMemo',     isCorrect: false },
        { id: 'q3b', text: 'useRef',      isCorrect: false },
        { id: 'q3c', text: 'useCallback', isCorrect: true  },
        { id: 'q3d', text: 'useState',    isCorrect: false },
      ],
    },
    {
      id: 'q4', topic: 'JSX', difficulty: 'Easy',
      text: 'What is the correct way to render a list in React?',
      options: [
        { id: 'q4a', text: 'Using a for loop directly in JSX', isCorrect: false },
        { id: 'q4b', text: 'Array.map() with unique key prop', isCorrect: true },
        { id: 'q4c', text: 'forEach with JSX return', isCorrect: false },
        { id: 'q4d', text: 'Array.forEach() with key prop', isCorrect: false },
      ],
    },
    {
      id: 'q5', topic: 'Context', difficulty: 'Medium',
      text: 'What problem does React Context primarily solve?',
      options: [
        { id: 'q5a', text: 'Component styling', isCorrect: false },
        { id: 'q5b', text: 'Prop drilling across multiple levels', isCorrect: true },
        { id: 'q5c', text: 'API data fetching', isCorrect: false },
        { id: 'q5d', text: 'Code splitting', isCorrect: false },
      ],
    },
  ],
}

// ── Test result ───────────────────────────────────────────────────
export const MOCK_TEST_RESULT: TestResult = {
  testId: 'test1',
  testTitle: 'React Fundamentals Assessment',
  skillName: 'React',
  score: 17, total: 20, percentage: 85,
  correct: 17, wrong: 2, skipped: 1,
  timeTaken: 1820, tabSwitches: 0, passed: true,
  badgeEarned: 'React Certified',
  topicBreakdown: [
    { topic: 'Hooks',       correct: 4, total: 5, percentage: 80 },
    { topic: 'State',       correct: 5, total: 5, percentage: 100 },
    { topic: 'Performance', correct: 3, total: 4, percentage: 75 },
    { topic: 'JSX',         correct: 3, total: 3, percentage: 100 },
    { topic: 'Context',     correct: 2, total: 3, percentage: 67 },
  ],
  questionResults: [
    { questionId: 'q1', questionText: 'Which hook is used for side effects?', selectedOptionId: 'q1b', correctOptionId: 'q1b', isCorrect: true, skipped: false },
    { questionId: 'q2', questionText: 'What does useState return?', selectedOptionId: 'q2b', correctOptionId: 'q2b', isCorrect: true, skipped: false },
    { questionId: 'q3', questionText: 'Which hook memoizes a function reference?', selectedOptionId: 'q3a', correctOptionId: 'q3c', isCorrect: false, skipped: false },
    { questionId: 'q4', questionText: 'Correct way to render a list?', selectedOptionId: 'q4b', correctOptionId: 'q4b', isCorrect: true, skipped: false },
    { questionId: 'q5', questionText: 'What does React Context solve?', selectedOptionId: undefined, correctOptionId: 'q5b', isCorrect: false, skipped: true },
  ],
  completedAt: new Date().toISOString(),
}

// ── Batch reports ─────────────────────────────────────────────────
export const MOCK_BATCH_REPORTS: BatchReport[] = [
  { id: 'br1', batchName: 'CSE Y4 A', department: 'CSE', year: 4, totalStudents: 40, skillVerified: 36, avgCGPA: 8.2, readinessPercent: 87, placedCount: 28, topSkills: ['React', 'Node.js', 'System Design'], status: 'On Track' },
  { id: 'br2', batchName: 'CSE Y4 B', department: 'CSE', year: 4, totalStudents: 38, skillVerified: 30, avgCGPA: 7.9, readinessPercent: 72, placedCount: 20, topSkills: ['Python', 'ML', 'Django'], status: 'On Track' },
  { id: 'br3', batchName: 'IT Y4 A',  department: 'IT',  year: 4, totalStudents: 35, skillVerified: 22, avgCGPA: 7.5, readinessPercent: 55, placedCount: 14, topSkills: ['Java', 'Spring Boot'], status: 'Needs Attention' },
  { id: 'br4', batchName: 'EC Y4 A',  department: 'EC',  year: 4, totalStudents: 30, skillVerified: 12, avgCGPA: 7.2, readinessPercent: 32, placedCount: 6,  topSkills: ['Python', 'Embedded C'], status: 'Critical' },
]

// ── Live activity events mock ──────────────────────────────────────
export const MOCK_EVENTS = [
  { id: 'e1', type: 'test', text: 'Prof. Sarah assigned React Proctored Test to Batch A', timestamp: new Date(Date.now() - 1800000).toISOString() },
  { id: 'e2', type: 'project', text: 'EduPortal Kanban milestone updated to 65%', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'e3', type: 'profile', text: 'Aanya Sharma verified Node.js skill badge', timestamp: new Date(Date.now() - 7200000).toISOString() }
]

// ── Notifications mock ────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  { id: 'n1', type: 'test' as const,    title: 'New Test Assigned',       description: 'React Fundamentals test is due on Mar 30', timestamp: new Date(Date.now() - 1800000).toISOString(), read: false, action: 'Take Test' },
  { id: 'n2', type: 'project' as const, title: 'Project Invitation',      description: 'Aanya invited you to join EduPortal',       timestamp: new Date(Date.now() - 3600000).toISOString(), read: false, action: 'View Invite' },
  { id: 'n3', type: 'team' as const,    title: 'New Team Message',         description: 'Rohan sent a message in #general',          timestamp: new Date(Date.now() - 7200000).toISOString(), read: false },
  { id: 'n4', type: 'system' as const,  title: 'Profile Reminder',         description: 'Complete your GitHub profile section',      timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: 'n5', type: 'test' as const,    title: 'Test Result Available',    description: 'You scored 85% in Python Basics',           timestamp: new Date(Date.now() - 172800000).toISOString(), read: true },
  { id: 'n6', type: 'project' as const, title: 'Task Assigned',            description: 'You were assigned "Build course list API"',  timestamp: new Date(Date.now() - 259200000).toISOString(), read: true },
]

// ── Chat mock ─────────────────────────────────────────────────────
export const MOCK_CHANNELS = [
  { id: 'ch1', name: 'general',   projectId: 'p1', unread: 3 },
  { id: 'ch2', name: 'frontend',  projectId: 'p1', unread: 0 },
  { id: 'ch3', name: 'backend',   projectId: 'p1', unread: 1 },
  { id: 'ch4', name: 'random',    projectId: 'p1', unread: 0 },
]

export const MOCK_MESSAGES = [
  { id: 'msg1', channelId: 'ch1', senderId: 's2', senderName: 'Rohan Mehta', content: 'Hey team, I pushed the auth middleware. Can someone review?', timestamp: new Date(Date.now() - 3600000 * 3).toISOString(), own: false },
  { id: 'msg2', channelId: 'ch1', senderId: 's1', senderName: 'Aanya Sharma', content: 'Sure, looking at it now! 👀', timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString(), own: true },
  { id: 'msg3', channelId: 'ch1', senderId: 's3', senderName: 'Priya Nair', content: 'Also, I finished the course list API. Should we integrate it today?', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), own: false },
  { id: 'msg4', channelId: 'ch1', senderId: 's1', senderName: 'Aanya Sharma', content: 'Yes let\'s do it! I\'ll start on the UI component.', timestamp: new Date(Date.now() - 3600000).toISOString(), own: true },
  { id: 'msg5', channelId: 'ch1', senderId: 's10', senderName: 'Rahul Das', content: 'I can help with the integration tests once the UI is ready.', timestamp: new Date(Date.now() - 1800000).toISOString(), own: false },
]

// ── Skill radar data ──────────────────────────────────────────────
export const MOCK_RADAR_DATA = [
  { subject: 'React',   current: 88, target: 90 },
  { subject: 'Node.js', current: 82, target: 85 },
  { subject: 'Python',  current: 65, target: 80 },
  { subject: 'MongoDB', current: 79, target: 75 },
  { subject: 'AWS',     current: 55, target: 70 },
  { subject: 'Docker',  current: 45, target: 65 },
]

// ── Analytics data ────────────────────────────────────────────────
export const MOCK_WEEKLY_ACTIVITY = [
  { day: 'Mon', tests: 4 }, { day: 'Tue', tests: 7 }, { day: 'Wed', tests: 3 },
  { day: 'Thu', tests: 9 }, { day: 'Fri', tests: 6 }, { day: 'Sat', tests: 2 },
  { day: 'Sun', tests: 1 },
]

export const MOCK_SKILL_PROGRESS = [
  { month: 'Oct', React: 55, Node: 48, Python: 40 },
  { month: 'Nov', React: 62, Node: 54, Python: 45 },
  { month: 'Dec', React: 70, Node: 61, Python: 50 },
  { month: 'Jan', React: 76, Node: 68, Python: 55 },
  { month: 'Feb', React: 82, Node: 74, Python: 60 },
  { month: 'Mar', React: 88, Node: 82, Python: 65 },
]

// ── Timeline events ───────────────────────────────────────────────
export const MOCK_TIMELINE_EVENTS: TimelineEvent[] = [
  { id: 'te1', year: 1, title: 'Profile Created',    description: 'Joined Kollab, completed basic profile setup.',  date: '2021-08-15', status: 'completed', type: 'profile' },
  { id: 'te2', year: 1, title: 'Git Connected',      description: 'Linked GitHub account, first 3 repos synced.',   date: '2021-09-10', status: 'completed', type: 'github' },
  { id: 'te3', year: 1, title: 'Python Basics Test', description: 'Scored 78% — Verified beginner Python skill.',   date: '2021-11-20', status: 'completed', type: 'test' },
  { id: 'te4', year: 2, title: 'First Project',      description: 'Joined the LibraryApp project team.',            date: '2022-02-10', status: 'completed', type: 'project' },
  { id: 'te5', year: 2, title: 'React Test',         description: 'Scored 88% — Verified React skill.',             date: '2022-05-18', status: 'completed', type: 'test' },
  { id: 'te6', year: 3, title: 'Node.js Test',       description: 'Scored 82% — Verified Node.js skill.',           date: '2023-03-12', status: 'completed', type: 'test' },
  { id: 'te7', year: 3, title: 'Peer Review',        description: 'Received 5-star review on EduPortal project.',   date: '2023-07-01', status: 'active',    type: 'review' },
  { id: 'te8', year: 4, title: 'Placement Test',     description: 'Comprehensive placement readiness assessment.',  date: '2024-02-01', status: 'upcoming',  type: 'test' },
  { id: 'te9', year: 4, title: 'Placement',          description: 'Final placement drive and company interviews.',  date: '2024-05-01', status: 'upcoming',  type: 'placement' },
]
