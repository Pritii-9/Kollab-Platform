import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle2, XCircle, Award, ArrowRight, ShieldCheck, AlertCircle, BookOpen, Target } from 'lucide-react'
import type { TestResult } from '@/types/test.types'

const TOPIC_STUDY_LINKS: Record<string, string> = {
  'async': 'MDN Async/Await Guide',
  'jwt': 'JWT.io Introduction',
  'sql': 'SQLZoo Interactive SQL',
  'system': 'Grokking System Design',
  'data': 'LeetCode DSA Patterns',
  'react': 'React Official Docs',
  'api': 'REST API Design Guide',
  'docker': 'Docker Getting Started',
}

function getStudyRecommendations(topicBreakdown: TestResult['topicBreakdown']): string[] {
  if (!topicBreakdown) return []
  return topicBreakdown
    .filter(t => t.percentage < 60)
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 3)
    .map(t => t.topic)
}

export default function TestResult() {
  const navigate = useNavigate()
  const location = useLocation()

  const result = location.state?.result as TestResult | undefined

  useEffect(() => {
    document.title = 'Test Results — Kollab'
  }, [])

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] text-slate-100 p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-[#0f172a] border border-[#1e293b] rounded-3xl p-8 shadow-2xl space-y-4 text-center">
          <AlertCircle size={40} className="mx-auto text-amber-400" />
          <h2 className="text-xl font-bold text-white">No Recent Test Result Found</h2>
          <p className="text-xs text-slate-400">
            Please complete a proctored assessment to view your score and verified skill badge.
          </p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
          >
            Back to Student Dashboard
          </button>
        </div>
      </div>
    )
  }

  const passed = result.percentage >= 70
  const weakTopics = getStudyRecommendations(result.topicBreakdown)

  const formatMinutes = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
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
          <span className={`block text-xs font-bold mt-1 ${passed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {result.percentage}% Final Score — {passed ? '✓ PASSED' : '✗ BELOW CUTOFF (70%)'}
          </span>
        </div>

        {/* Badge Earned Alert */}
        {passed && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/40 to-emerald-900/40 border border-emerald-500/30 flex items-center justify-center gap-3 text-emerald-300 text-xs font-bold">
            <Award size={20} /> Verified Badge Earned: {result.badgeEarned}
          </div>
        )}

        {/* P1: Recommended Study Topics (shown only on FAIL) */}
        {!passed && weakTopics.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-left space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={13} /> Recommended Topics to Study Before Retake
            </h4>
            <div className="space-y-1.5">
              {weakTopics.map((topic, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <Target size={11} className="text-amber-400 shrink-0" />
                  <span className="font-semibold">{topic}</span>
                  <span className="text-slate-500">— Focus on practical examples and edge cases</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              Study these topics then retake for a higher score and verified badge.
            </p>
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
            <span className={`font-bold ${result.tabSwitches > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {result.tabSwitches} Detected
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">Proctoring Status</span>
            <span className="font-bold text-indigo-400 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> Verified
            </span>
          </div>
        </div>

        {/* Topic Breakdown */}
        {result.topicBreakdown && result.topicBreakdown.length > 0 && (
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Topic Performance Breakdown</h4>
            {result.topicBreakdown.map((tb, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className={`font-medium ${tb.percentage < 60 ? 'text-rose-300' : 'text-slate-300'}`}>{tb.topic}</span>
                  <span className={`font-bold ${tb.percentage >= 70 ? 'text-emerald-400' : tb.percentage >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {tb.percentage}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tb.percentage >= 70 ? 'bg-emerald-500' : tb.percentage >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${tb.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-[#1e293b]">
          <button
            onClick={() => navigate('/student/assessments')}
            className="flex-1 py-3 rounded-xl bg-[#080d18] border border-[#1e293b] text-slate-300 hover:text-white font-bold text-xs"
          >
            Back to Assessments
          </button>
          {passed ? (
            <button
              onClick={() => navigate('/student/profile')}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
            >
              View Skill Badge Profile <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => navigate('/student/dashboard')}
              className="flex-1 py-3 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
            >
              <BookOpen size={14} /> Study & Retake
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
