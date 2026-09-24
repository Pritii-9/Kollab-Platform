import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTestStore } from '@/store/testStore'
import { testsApi } from '@/api/tests.api'
import ConfirmModal from '@/components/shared/ConfirmModal'
import { AlertTriangle, Clock, ShieldAlert, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'

export default function TakeTest() {
  const navigate = useNavigate()
  const { testId } = useParams()
  const { initTest, submitTest, tabSwitches, timeLeft, answers, setAnswer } = useTestStore()

  const [currentQ, setCurrentQ] = useState(0)
  const [warningBanner, setWarningBanner] = useState<string | null>(null)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startTime] = useState<number>(Date.now())

  useEffect(() => {
    document.title = 'Proctored Test — Kollab'
    
    if (testId) {
      testsApi.getTestById(testId)
        .then((test) => {
          initTest(test.id, test.title, test.questions, test.timeLimit)
          
          // Restore draft answers if page refreshed
          try {
            const savedDraft = localStorage.getItem(`kollab_draft_${testId}`)
            if (savedDraft) {
              const draftData = JSON.parse(savedDraft)
              if (draftData.answers) {
                Object.entries(draftData.answers).forEach(([qId, optId]) => {
                  setAnswer(qId, optId as string)
                })
              }
            }
          } catch (e) {
            console.warn('Draft restoration warning:', e)
          }

          setIsLoading(false)
          
          // Request fullscreen
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {})
          }
        })
        .catch((err) => {
          console.error('Failed to fetch test', err)
          setError('Failed to load test data. Please try again.')
          setIsLoading(false)
        })
    }

    // Visibility change handler for tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        useTestStore.getState().incrementTabSwitch()
        const currentCount = useTestStore.getState().tabSwitches
        if (currentCount === 1) {
          setWarningBanner('Warning (1/3): Tab switch detected! Remaining switches will cause automatic test submission.')
        } else if (currentCount === 2) {
          setWarningBanner('Final Warning (2/3): One more tab switch will automatically terminate and submit your test.')
        } else if (currentCount >= 3) {
          handleConfirmSubmit()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [testId])

  // Save draft answers to localStorage continuously
  useEffect(() => {
    if (testId && Object.keys(answers).length > 0) {
      try {
        localStorage.setItem(`kollab_draft_${testId}`, JSON.stringify({ answers }))
      } catch (e) {
        console.warn('LocalStorage draft save error:', e)
      }
    }
  }, [testId, answers])

  useEffect(() => {
    // Timer tick interval
    const interval = setInterval(() => {
      useTestStore.getState().tickTimer()
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleConfirmSubmit = async () => {
    submitTest()
    setIsSubmitModalOpen(false)
    
    // Clear auto-saved draft
    if (testId) {
      localStorage.removeItem(`kollab_draft_${testId}`)
    }

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    }
    
    try {
      const state = useTestStore.getState()
      const elapsedSeconds = Math.max(10, Math.floor((Date.now() - startTime) / 1000))
      
      const result = await testsApi.submitTest(testId as string, {
        answers: state.answers,
        timeTaken: elapsedSeconds,
        tabSwitches: state.tabSwitches
      })
      navigate(`/student/test/${testId}/result`, { state: { result } })
    } catch (err) {
      console.error('Submit failed', err)
      navigate(`/student/test/${testId}/result`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080d18] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading proctored test environment...</p>
        </div>
      </div>
    )
  }

  if (error || !useTestStore.getState().testId) {
    return (
      <div className="min-h-screen bg-[#080d18] flex items-center justify-center p-6">
        <div className="bg-[#0f172a] p-8 rounded-2xl border border-rose-500/30 text-center space-y-4 max-w-md w-full">
          <AlertTriangle size={48} className="mx-auto text-rose-500" />
          <h2 className="text-xl font-bold text-white">Error Loading Test</h2>
          <p className="text-slate-400 text-sm">{error || 'Test not found or unavailable.'}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-2 bg-[#1e293b] hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const questions = useTestStore.getState().questions
  const question = questions[currentQ]
  
  if (!question) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-100 flex flex-col justify-between select-none">
      {/* Top Fixed Bar */}
      <header className="h-[52px] bg-[#0a0f1e] border-b border-[#1e293b] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-bold text-sm text-white">{useTestStore.getState().testTitle}</h2>
        </div>

        {/* Center Timer */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[#0f172a] border border-[#1e293b]">
          <Clock size={16} className={timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-amber-400'} />
          <span className={`font-mono font-extrabold text-sm ${timeLeft < 300 ? 'text-rose-400' : 'text-white'}`}>
            {formatTimer(timeLeft)}
          </span>
        </div>

        {/* Anti-cheat tab switch badge */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              tabSwitches > 0
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-bounce'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}
          >
            <ShieldAlert size={14} /> {tabSwitches} / 3 Tab Switches
          </span>
        </div>
      </header>

      {/* Warning Banner */}
      {warningBanner && (
        <div className="bg-rose-600/90 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
          <AlertTriangle size={16} /> {warningBanner}
          <button onClick={() => setWarningBanner(null)} className="underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Question Body */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col justify-center space-y-6">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            Question {currentQ + 1} of {questions.length}
          </span>
          <span>{question.topic}</span>
        </div>

        <h3 className="text-xl font-bold text-white leading-relaxed">{question.text}</h3>

        {/* 4 Option Cards */}
        <div className="space-y-3 pt-2">
          {question.options.map((opt, idx) => {
            const isSelected = answers[question.id] === opt.id
            return (
              <div
                key={opt.id}
                onClick={() => setAnswer(question.id, opt.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-500'
                    : 'bg-[#0f172a] border-[#1e293b] text-slate-300 hover:border-slate-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl font-extrabold text-xs flex items-center justify-center border shrink-0 ${
                    isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-[#080d18] border-[#1e293b] text-slate-400'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm font-medium">{opt.text}</span>
              </div>
            )
          })}
        </div>
      </main>

      {/* Bottom Bar Navigation */}
      <footer className="h-[64px] bg-[#0a0f1e] border-t border-[#1e293b] px-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentQ((q) => Math.max(q - 1, 0))}
          disabled={currentQ === 0}
          className="px-4 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-slate-300 hover:text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1.5"
        >
          <ArrowLeft size={14} /> Previous
        </button>

        <div className="flex gap-1 overflow-x-auto max-w-xs px-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all ${
                i === currentQ
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                  : answers[q.id] !== undefined
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#0f172a] text-slate-500 border border-[#1e293b]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ((q) => Math.min(q + 1, questions.length - 1))}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
          >
            Next <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <CheckCircle size={14} /> Submit Test
          </button>
        )}
      </footer>

      <ConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Proctored Test?"
        description={`You have answered ${Object.keys(answers).length} of ${questions.length} questions. Are you ready to finalize your test submission?`}
        confirmLabel="Submit Test Now"
      />
    </div>
  )
}
