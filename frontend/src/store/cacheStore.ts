import { create } from 'zustand'
import type { Batch } from '@/types/batch.types'
import type { Student } from '@/types/student.types'
import type { TestAttemptRecord, TestResult } from '@/types/test.types'

interface CacheState {
  batches: Batch[]
  students: Student[]
  testAttempts: TestAttemptRecord[]
  myTestHistory: TestResult[]
  lastFetched: Record<string, number>

  setBatches: (batches: Batch[]) => void
  setStudents: (students: Student[]) => void
  setTestAttempts: (attempts: TestAttemptRecord[]) => void
  setMyTestHistory: (history: TestResult[]) => void
}

export const useCacheStore = create<CacheState>((set) => ({
  batches: [],
  students: [],
  testAttempts: [],
  myTestHistory: [],
  lastFetched: {},

  setBatches: (batches) =>
    set((state) => ({
      batches,
      lastFetched: { ...state.lastFetched, batches: Date.now() },
    })),

  setStudents: (students) =>
    set((state) => ({
      students,
      lastFetched: { ...state.lastFetched, students: Date.now() },
    })),

  setTestAttempts: (testAttempts) =>
    set((state) => ({
      testAttempts,
      lastFetched: { ...state.lastFetched, testAttempts: Date.now() },
    })),

  setMyTestHistory: (myTestHistory) =>
    set((state) => ({
      myTestHistory,
      lastFetched: { ...state.lastFetched, myTestHistory: Date.now() },
    })),
}))
