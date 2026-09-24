import { useState, useEffect } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import { Download, Users, Award, GraduationCap, CheckCircle, FileText } from 'lucide-react'
import ReadinessBarChart from '@/components/charts/ReadinessBarChart'
import CustomSelect from '@/components/shared/CustomSelect'
import { batchesApi } from '@/api/batches.api'
import type { Batch } from '@/types/batch.types'
import toast from 'react-hot-toast'

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'batch' | 'student' | 'placement'>('batch')
  const [selectedYear, setSelectedYear] = useState('all')
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Reports — Kollab'
    loadReportData()
  }, [])

  const loadReportData = async () => {
    setLoading(true)
    try {
      const data = await batchesApi.listBatches()
      setBatches(data || [])
    } catch (err) {
      console.error('Failed to load batch reports:', err)
      setBatches([])
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = (batchName: string) => {
    toast.success(`Exporting PDF placement report for ${batchName}...`)
  }

  const filteredBatches = batches.filter((b) => {
    const matchYear = selectedYear === 'all' || String(b.year) === selectedYear
    return matchYear
  })

  const chartData = filteredBatches.map((b) => ({
    name: b.name,
    value: b.readinessPercent || 0
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white">Placement Readiness Reports</h2>
          <p className="text-xs text-slate-400">Generate department analytics and student export dossiers</p>
        </div>
        <button
          onClick={() => toast.success('Downloading full department placement report...')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 flex items-center gap-2"
        >
          <Download size={16} /> Export All Reports (PDF/CSV)
        </button>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Batches" value={batches.length} subtitle="Active academic cohorts" icon={<Users size={20} />} />
        <StatCard
          title="Avg Readiness"
          value={
            batches.filter((b) => b.totalStudents > 0).length > 0
              ? `${Math.round(
                  batches.filter((b) => b.totalStudents > 0).reduce((a, b) => a + (b.readinessPercent || 0), 0) /
                    batches.filter((b) => b.totalStudents > 0).length
                )}%`
              : '0%'
          }
          subtitle="Cohort benchmark score"
          icon={<CheckCircle size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <StatCard
          title="Placement Eligible"
          value={batches.reduce((a, b) => a + (b.placementReady || 0), 0)}
          subtitle="Students meeting criteria"
          icon={<GraduationCap size={20} />}
          iconBg="bg-violet-500/10 text-violet-400 border border-violet-500/20"
        />
        <StatCard
          title="Verified Skills"
          value={batches.reduce((a, b) => a + (b.skillVerified || 0), 0)}
          subtitle="Total verified skill badges"
          icon={<Award size={20} />}
          iconBg="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />
      </div>

      {/* Readiness Bar Chart */}
      {chartData.length > 0 && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Batch-wise Cohort Readiness (%)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Visual breakdown by batch across all years</p>
          </div>
          <ReadinessBarChart data={chartData} height={220} />
        </div>
      )}

      {/* Tab Switcher & Filter Row */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-[#1e293b] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex p-1 rounded-xl bg-[#080d18] border border-[#1e293b] w-full md:w-auto">
          {(['batch', 'student', 'placement'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab} Reports
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <CustomSelect
            value={selectedYear}
            onChange={setSelectedYear}
            options={[
              { value: 'all', label: 'All Years' },
              { value: '1', label: 'Year 1' },
              { value: '2', label: 'Year 2' },
              { value: '3', label: 'Year 3' },
              { value: '4', label: 'Year 4' }
            ]}
          />
        </div>
      </div>

      {/* Batch Reports Table */}
      {activeTab === 'batch' && (
        <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0f172a]">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Loading batch reports...</div>
          ) : filteredBatches.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">No active batches available for reporting.</div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e293b] text-slate-400 font-semibold bg-[#080d18]/50">
                  <th className="py-3.5 px-4">Batch Name</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Students</th>
                  <th className="py-3.5 px-4">Verified Skills</th>
                  <th className="py-3.5 px-4">Readiness</th>
                  <th className="py-3.5 px-4">Placement Ready</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {filteredBatches.map((b) => (
                  <tr key={b.id} className="hover:bg-[#152035] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{b.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{b.department}</td>
                    <td className="py-3.5 px-4 text-slate-300">{b.totalStudents}</td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-400">{b.skillVerified} verified</td>
                    <td className="py-3.5 px-4 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${b.readinessPercent}%` }} />
                        </div>
                        <span className="font-semibold text-slate-200">{b.readinessPercent}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">{b.placementReady}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleExportPDF(b.name)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => toast.success(`Exporting CSV for ${b.name}...`)}
                          className="px-2.5 py-1 rounded-lg bg-[#080d18] border border-[#1e293b] text-slate-300 hover:text-white"
                        >
                          CSV
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Placement Tab */}
      {activeTab === 'placement' && (
        <div className="p-12 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-center space-y-3">
          <GraduationCap size={36} className="mx-auto text-slate-600" />
          <h3 className="font-bold text-white text-sm">Placement Analytics</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Live placement statistics will populate automatically as campus placement drives complete and status updates occur.
          </p>
        </div>
      )}

      {/* Student Reports Tab */}
      {activeTab === 'student' && (
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <FileText size={28} />
          </div>
          <h3 className="font-bold text-white">Individual Student Reports</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Click "View Timeline →" on the Students Roster page to access individual dossiers with full skill, project, and test breakdown.</p>
          <a href="/coordinator/students" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300">
            Go to Students Roster →
          </a>
        </div>
      )}
    </div>
  )
}
