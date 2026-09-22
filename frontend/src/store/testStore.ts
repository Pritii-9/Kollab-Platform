import { create } from 'zustand'
import type { Question } from '../types/test.types'

interface TestStore {
  testId: string | null
  testTitle: string
  questions: Question[]
  answers: Record<string, string>   // questionId → optionId
  currentIndex: number
  timeLeft: number                  // seconds
  tabSwitches: number
  isSubmitted: boolean
  isFullscreen: boolean

  initTest: (testId: string, title: string, questions: Question[], timeLimitMinutes: number) => void
  setAnswer: (questionId: string, optionId: string) => void
  setCurrentIndex: (index: number) => void
  tickTimer: () => void
  incrementTabSwitch: () => void
  submitTest: () => void
  reset: () => void
}

export const useTestStore = create<TestStore>((set) => ({
  testId: null,
  testTitle: '',
  questions: [],
  answers: {},
  currentIndex: 0,
  timeLeft: 0,
  tabSwitches: 0,
  isSubmitted: false,
  isFullscreen: false,

  initTest: (testId, title, questions, timeLimitMinutes) =>
    set({
      testId,
      testTitle: title,
      questions,
      answers: {},
      currentIndex: 0,
      timeLeft: timeLimitMinutes * 60,
      tabSwitches: 0,
      isSubmitted: false,
    }),

  setAnswer: (questionId, optionId) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: optionId },
    })),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  tickTimer: () =>
    set((state) => ({
      timeLeft: Math.max(0, state.timeLeft - 1),
    })),

  incrementTabSwitch: () =>
    set((state) => ({ tabSwitches: state.tabSwitches + 1 })),

  submitTest: () => set({ isSubmitted: true }),

  reset: () =>
    set({
      testId: null, testTitle: '', questions: [], answers: {},
      currentIndex: 0, timeLeft: 0, tabSwitches: 0, isSubmitted: false,
    }),
}))
