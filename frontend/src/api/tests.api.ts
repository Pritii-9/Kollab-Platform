import apiClient from './client'
import type { Test, TestResult, TestAttemptRecord } from '../types/test.types'

export const testsApi = {
  listTests: async (): Promise<Test[]> => {
    const res = await apiClient.get<Test[]>('/tests')
    return res.data
  },

  getTestById: async (id: string): Promise<Test> => {
    const res = await apiClient.get<Test>(`/tests/${id}`)
    return res.data
  },

  createTest: async (testData: Partial<Test>): Promise<Test> => {
    const res = await apiClient.post<Test>('/tests', {
      title: testData.title,
      skill_name: testData.skillName,
      difficulty: testData.difficulty,
      time_limit: testData.timeLimit,
      attempts: testData.attempts,
      randomize_questions: testData.antiCheat?.randomizeQuestions,
      randomize_options: testData.antiCheat?.randomizeOptions,
      tab_detection: testData.antiCheat?.tabDetection,
      fullscreen_lock: testData.antiCheat?.fullscreenLock,
      assigned_to: testData.assignedTo,
      target_batch: testData.targetBatch,
      target_year: testData.targetYear,
      due_date: testData.dueDate,
    })
    return res.data
  },

  submitTest: async (
    testId: string,
    payload: {
      answers: Record<string, string>
      timeTaken: number
      tabSwitches: number
    }
  ): Promise<TestResult> => {
    const res = await apiClient.post<TestResult>(`/tests/${testId}/submit`, payload)
    return res.data
  },

  getTestAttempts: async (testId?: string): Promise<TestAttemptRecord[]> => {
    const url = testId ? `/tests/attempts?test_id=${testId}` : '/tests/attempts'
    const res = await apiClient.get<TestAttemptRecord[]>(url)
    return res.data
  },

  getMyTestHistory: async (): Promise<TestResult[]> => {
    const res = await apiClient.get<TestResult[]>('/tests/my-attempts')
    return res.data
  },
}

