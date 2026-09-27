import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { testsApi } from '@/api/tests.api'
import { ClipboardList, Clock, ArrowRight, ShieldCheck, Award, CheckCircle2, RefreshCw, AlertCircle, FileCheck } from 'lucide-react'
import StatCard from '@/components/dashboard/StatCard'

export default function StudentAssessments() {
  const navigate = useNavigate()
  const [assignedTests, setAssignedTests] = useState<any[]>([])
  const [testHistory, setTestHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')

  useEffect(() => {
    document.title = 'Assessments — Kollab'
    loadAssessmentData()
  }, [])

  const loadAssessmentData = async () => {
    setLoading(true)
    try {
      const [available, history] = await Promise.all([
        testsApi.listTests().catch(() => []),
        testsApi.getMyTestHistory().catch(() => [])
      ])
      
      // Filter out invalid or duplicate test entries
      const validAvailable = available.filter((t: any) => t && t.id && (t.skillName || t.title))
      
      setAssignedTests(validAvailable)
      setTestHistory(history)
    } finally {
      setLoading(false)
    }
  }

  // Count attempt history per test
  const getAttemptCount = (testId: string, skillName: string) => {
    return testHistory.filter(
      (h) => h.testId === testId || (h.skillName && skillName && h.skillName.toLowerCase() === skillName.toLowerCase())
    ).length
  }

  // Pending tests: available tests where attempt limit has NOT been reached
  const pendingTests = assignedTests.filter((t) => {
    const attemptsTaken = getAttemptCount(t.id, t.skillName)
    const maxAllowed = t.attempts || 1
    return attemptsTaken < maxAllowed
  })

  const passedCount = testHistory.filter((t) => t.passed).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Proctored Assessments</h2>
          <p className="text-xs text-slate-400">Take assigned skill assessments, view proctored results & earn verified badges</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAssessmentData}
            className="p-2.5 rounded-xl bg-[#0e1526] border border-[#1a2438] hover:border-[#2a3854] text-slate-300 transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-400' : ''} /> Refresh List
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Available Tests"
          value={pendingTests.length}
          subtitle="Ready to take"
          icon={<ClipboardList size={20} />}
        />
        <StatCard
          title="Verified Badges"
          value={passedCount}
          subtitle="Passed assessments"
          icon={<Award size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <StatCard
          title="Completed Assessments"
          value={testHistory.length}
          subtitle="Total submitted attempts"
          icon={<CheckCircle2 size={20} />}
          iconBg="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1e293b] pb-2 text-xs">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 bg-[#0f172a] border border-[#1e293b]'
          }`}
        >
          <Clock size={14} /> Available Assessments ({pendingTests.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-400 hover:text-slate-200 bg-[#0f172a] border border-[#1e293b]'
          }`}
        >
          <FileCheck size={14} /> Completed History ({testHistory.length})
        </button>
      </div>

      {/* Tab 1: Pending Assessments */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
              Loading available assessments...
            </div>
          ) : pendingTests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingTests.map((t) => {
                const attemptsTaken = getAttemptCount(t.id, t.skillName)
                const maxAllowed = t.attempts || 1
                return (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-indigo-500/40 transition-all shadow-xl space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {t.skillName || 'Skill Test'}
                        </span>
                        <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                          <Clock size={12} /> {t.timeLimit || 45} Mins
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white">{t.title || `${t.skillName} Assessment`}</h4>
                      <p className="text-xs text-slate-400">
                        Difficulty: <strong className="text-slate-200">{t.difficulty || 'Medium'}</strong> · Questions: <strong className="text-slate-200">{t.questions?.length || 20} Qs</strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-400" />
                        <span className="text-[11px] text-slate-400">
                          Attempt {attemptsTaken + 1} of {maxAllowed}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/student/test/${t.id}`)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        Start Test <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-center space-y-2">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400" />
              <p className="text-sm font-bold text-white">All Assigned Assessments Completed!</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You have completed all assigned assessments. You can view your detailed attempt history in the Completed History tab.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Completed Assessments History */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {testHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0f172a]">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1e293b] text-slate-400 font-semibold bg-[#080d18]/50">
                    <th className="py-3.5 px-4">Test Title & Skill</th>
                    <th className="py-3.5 px-4">Score</th>
                    <th className="py-3.5 px-4">Percentage</th>
                    <th className="py-3.5 px-4">Proctoring Status</th>
                    <th className="py-3.5 px-4 text-right">Date Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e293b]">
                  {testHistory.map((h, idx) => (
                    <tr key={idx} className="hover:bg-[#152035] transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {h.testTitle || h.skillName}
                        <span className="block text-[10px] text-slate-400 font-normal">{h.skillName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-200 font-semibold">{h.score} / {h.total}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-400">{h.percentage}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${h.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                          {h.passed ? 'VERIFIED BADGE EARNED' : 'COMPLETED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">{h.completedAt || 'Recent'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-center space-y-2">
              <AlertCircle size={32} className="mx-auto text-slate-600" />
              <p className="text-sm font-bold text-white">No Completed Assessments</p>
              <p className="text-xs text-slate-400">Complete an assigned test to view your scores and verified skill badges here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

