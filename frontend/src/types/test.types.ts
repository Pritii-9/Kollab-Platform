export interface QuestionOption {
  id: string
  text: string
  isCorrect: boolean
}

export interface Question {
  id: string
  text: string
  options: QuestionOption[]
  topic: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  explanation?: string
}

export interface Test {
  id: string
  title: string
  skillName: string
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed'
  questions: Question[]
  timeLimit: number        // in minutes
  attempts: number
  antiCheat: {
    randomizeQuestions: boolean
    randomizeOptions: boolean
    tabDetection: boolean
    fullscreenLock: boolean
  }
  assignedTo: 'batch' | 'year' | 'individual'
  targetBatch?: string
  targetYear?: number
  targetStudents?: string[]
  dueDate: string
  createdBy: string
  createdAt: string
}

export interface TestAttempt {
  testId: string
  answers: Record<string, string>   // questionId → optionId
  startedAt: string
  tabSwitches: number
  timeTaken: number                 // seconds
}

export interface TestResult {
  testId: string
  testTitle: string
  skillName: string
  score: number
  total: number
  percentage: number
  correct: number
  wrong: number
  skipped: number
  timeTaken: number
  tabSwitches: number
  passed: boolean
  badgeEarned?: string
  topicBreakdown: TopicScore[]
  questionResults: QuestionResult[]
  completedAt: string
}

export interface TopicScore {
  topic: string
  correct: number
  total: number
  percentage: number
}

export interface QuestionResult {
  questionId: string
  questionText: string
  selectedOptionId?: string
  correctOptionId: string
  isCorrect: boolean
  skipped: boolean
}
