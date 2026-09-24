import { useState, useEffect } from 'react'
import { testsApi } from '@/api/tests.api'
import type { TestAttemptRecord } from '@/types/test.types'
import SearchInput from '@/components/shared/SearchInput'
import CustomSelect from '@/components/shared/CustomSelect'
import StatCard from '@/components/dashboard/StatCard'
import { Download, AlertTriangle, CheckCircle, XCircle, Award, Users, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

import { useCacheStore } from '@/store/cacheStore'

export default function TestResultsMatrix() {
  const { testAttempts: attempts, setTestAttempts: setAttempts } = useCacheStore()
  const [loading, setLoading] = useState(attempts.length === 0)
  const [search, setSearch] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    document.title = 'Test Results Gradebook — Kollab'
    loadAttempts()
  }, [])

  const loadAttempts = async () => {
    try {
      const data = await testsApi.getTestAttempts()
      if (data && data.length > 0) setAttempts(data)
    } catch (err) {
      console.error('Failed to fetch test attempts gradebook:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredAttempts = attempts.filter((att) => {
    const matchesSearch =
      !search ||
      att.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (att.rollNumber && att.rollNumber.toLowerCase().includes(search.toLowerCase())) ||
      att.testTitle.toLowerCase().includes(search.toLowerCase()) ||
      att.skillName.toLowerCase().includes(search.toLowerCase())
    
    const matchesBatch =
      selectedBatch === 'all' ||
      !selectedBatch ||
      (att.batch && att.batch.toLowerCase().includes(selectedBatch.toLowerCase()))

    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'passed' && att.passed) ||
      (selectedStatus === 'failed' && !att.passed) ||
      (selectedStatus === 'flagged' && att.tabSwitches > 0)

    return matchesSearch && matchesBatch && matchesStatus
  })

  const totalAttemptsCount = attempts.length
  const passedCount = attempts.filter((a) => a.passed).length
  const passRate = totalAttemptsCount > 0 ? Math.round((passedCount / totalAttemptsCount) * 100) : 0
  const avgScore = totalAttemptsCount > 0 ? Math.round(attempts.reduce((acc, a) => acc + a.percentage, 0) / totalAttemptsCount) : 0
  const flaggedCount = attempts.filter((a) => a.tabSwitches > 0).length

  const handleExportCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Batch', 'Test Title', 'Skill', 'Score', 'Percentage', 'Status', 'Tab Switches', 'Date']
    const rows = filteredAttempts.map((a) => [
      a.studentName,
      a.rollNumber || 'N/A',
      a.batch || 'N/A',
      `"${a.testTitle}"`,
      a.skillName,
      `${a.score}/${a.total}`,
      `${a.percentage}%`,
      a.passed ? 'PASSED' : 'FAILED',
      a.tabSwitches,
      a.completedAt
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `kollab_test_results_export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Exported test results CSV!')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Proctored Test Results Gradebook</h2>
          <p className="text-xs text-slate-400">View real-time assessment scores, pass rates, and proctoring telemetry across students</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAttempts}
            className="p-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-600 text-slate-300 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-400' : ''} />
          </button>
          <button
            onClick={handleExportCSV}
            disabled={filteredAttempts.length === 0}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
          >
            <Download size={16} /> Export Gradebook CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Submissions" value={totalAttemptsCount} subtitle="Completed student tests" icon={<Users size={20} />} />
        <StatCard
          title="Class Average Score"
          value={`${avgScore}%`}
          subtitle="Overall test accuracy"
          icon={<Award size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate}%`}
          subtitle={`${passedCount} of ${totalAttemptsCount} passed`}
          icon={<CheckCircle size={20} />}
          iconBg="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        />
        <StatCard
          title="Proctoring Violations"
          value={flaggedCount}
          subtitle="Attempts with tab switch alerts"
          icon={<AlertTriangle size={20} />}
          iconBg="bg-rose-500/10 text-rose-400 border border-rose-500/20"
        />
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b]">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by student, roll no, or test title..." />
        <CustomSelect
          value={selectedBatch}
          onChange={setSelectedBatch}
          options={[
            { value: 'all', label: 'All Batches' },
            { value: 'Batch A', label: 'Batch A' },
            { value: 'Batch B', label: 'Batch B' },
            { value: 'Batch C', label: 'Batch C' }
          ]}
        />
        <CustomSelect
          value={selectedStatus}
          onChange={setSelectedStatus}
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'passed', label: 'Passed Only' },
            { value: 'failed', label: 'Failed / Retake Required' },
            { value: 'flagged', label: 'Proctor Flagged (Tab Switches)' }
          ]}
        />
      </div>

      {/* Gradebook Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0f172a]">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-indigo-500" />
            Loading test attempts gradebook...
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Users size={32} className="mx-auto text-slate-600" />
            <p className="font-semibold text-white text-sm">No Assessment Submissions Found</p>
            <p className="text-slate-400 max-w-sm mx-auto">
              As students complete assigned proctored MCQ tests, their scores and cheating telemetry will appear here automatically.
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 font-semibold bg-[#080d18]/50">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll / Cohort</th>
                <th className="py-3.5 px-4">Test Title & Skill</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Accuracy %</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Proctoring Telemetry</th>
                <th className="py-3.5 px-4 text-right">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredAttempts.map((att) => (
                <tr key={att.id} className="hover:bg-[#152035] transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center border border-indigo-400/30">
                        {att.studentName ? att.studentName[0].toUpperCase() : 'S'}
                      </div>
                      <div>
                        <p className="font-bold text-white">{att.studentName}</p>
                        <span className="text-[10px] text-slate-400">{att.department ?? '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-mono text-slate-300">{att.rollNumber || 'N/A'}</p>
                    <span className="text-[10px] text-slate-500">{att.batch ?? '—'}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-200">{att.testTitle}</p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {att.skillName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">
                    {att.score} / {att.total}
                  </td>
                  <td className="py-3.5 px-4 w-36">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            att.percentage >= 70 ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${att.percentage}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-white">{att.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {att.passed ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                        <CheckCircle size={12} /> PASSED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                        <XCircle size={12} /> RETAKE REQ
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {att.tabSwitches > 0 ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
                        <AlertTriangle size={12} /> {att.tabSwitches} Tab Switch(es)
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-semibold">Clean Proctor Session</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 text-[11px] font-mono">
                    {att.completedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
