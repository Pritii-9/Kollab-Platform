import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MOCK_TEST_RESULT } from '@/utils/mockData'
import { CheckCircle2, XCircle, Award, ArrowRight, ShieldCheck } from 'lucide-react'
import type { TestResult } from '@/types/test.types'

export default function TestResult() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Use the result passed from TakeTest.tsx, fallback to mock only if accessed directly without taking test
  const result = (location.state?.result as TestResult) || MOCK_TEST_RESULT

  useEffect(() => {
    document.title = 'Test Results — Kollab'
  }, [])

  const passed = result.percentage >= 70

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    return `${mins} mins`
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-[#0f172a] border border-[#1e293b] rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-fade-in">
        {/* Pass/Fail Icon */}
        <div
          className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center border-4 shadow-xl ${
            passed
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
              : 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-rose-500/20'
          }`}
        >
          {passed ? <CheckCircle2 size={40} /> : <XCircle size={40} />}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white">{passed ? 'Proctored Assessment Passed!' : 'Assessment Retake Required'}</h2>
          <p className="text-xs text-slate-400 mt-1">{result.testTitle}</p>
        </div>

        {/* Score Ring */}
        <div className="p-6 rounded-2xl bg-[#080d18] border border-[#1e293b] inline-block mx-auto min-w-[200px]">
          <span className="text-4xl font-extrabold text-white">{result.score} / {result.total}</span>
          <span className="block text-xs font-bold text-emerald-400 mt-1">{result.percentage}% Final Score</span>
        </div>

        {/* Badge Earned Alert */}
        {passed && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/40 to-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-3 text-emerald-300 text-xs font-bold">
            <Award size={20} /> Verified Badge Earned: {result.badgeEarned}
          </div>
        )}

        {/* Proctored Telemetry */}
        <div className="grid grid-cols-3 gap-3 text-xs p-4 rounded-xl bg-[#080d18] border border-[#1e293b]">
          <div>
            <span className="text-slate-400 block text-[10px]">Time Spent</span>
            <span className="font-bold text-white">{formatMinutes(result.timeTaken)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Tab Switches</span>
            <span className="font-bold text-emerald-400">{result.tabSwitches} Detected</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Proctoring Status</span>
            <span className="font-bold text-indigo-400 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> Verified
            </span>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="space-y-3 text-left">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topic Performance Breakdown</h4>
          {result.topicBreakdown.map((tb, idx) => (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300 font-medium">{tb.topic}</span>
                <span className="font-bold text-white">{tb.percentage}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${tb.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#1e293b]">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="flex-1 py-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-300 hover:text-white font-bold text-xs"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/student/profile')}
            className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            View Skill Badge Profile <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
