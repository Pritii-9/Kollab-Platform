import { useState, useEffect } from 'react'
import StatCard from '@/components/dashboard/StatCard'
import { MOCK_BATCH_REPORTS } from '@/utils/mockData'
import { Download, Users, Award, GraduationCap, CheckCircle, TrendingUp, FileText, Building2 } from 'lucide-react'
import ReadinessBarChart from '@/components/charts/ReadinessBarChart'
import CustomSelect from '@/components/shared/CustomSelect'
import toast from 'react-hot-toast'

const batchChartData = [
  { name: 'CSE Y1 A', value: 15 },
  { name: 'CSE Y1 B', value: 12 },
  { name: 'CSE Y2 A', value: 42 },
  { name: 'CSE Y2 B', value: 35 },
  { name: 'CSE Y3 A', value: 68 },
  { name: 'CSE Y4 A', value: 89 },
]

export default function Reports() {
  const [activeTab, setActiveTab] = useState<'batch' | 'student' | 'placement'>('batch')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedBatch, setSelectedBatch] = useState('all')

  useEffect(() => {
    document.title = 'Reports — Kollab'
  }, [])

  const handleExportPDF = (batchName: string) => {
    toast.success(`Exporting PDF placement report for ${batchName}...`)
  }

  const filteredReports = MOCK_BATCH_REPORTS.filter((r) => {
    const matchYear = selectedYear === 'all' || String(r.year ?? '') === selectedYear
    const matchBatch = selectedBatch === 'all' || r.batchName.includes(selectedBatch)
    return matchYear && matchBatch
  })

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
        <StatCard title="Total Batches" value={6} subtitle="Academic year 2025-2026" icon={<Users size={20} />} trend={{ value: 1, isPositive: true }} />
        <StatCard
          title="Avg Readiness"
          value="72%"
          subtitle="Cohort benchmark score"
          icon={<CheckCircle size={20} />}
          iconBg="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          trend={{ value: 4, isPositive: true }}
        />
        <StatCard
          title="Placement Rate"
          value="37%"
          subtitle="89 out of 240 hired"
          icon={<GraduationCap size={20} />}
          iconBg="bg-violet-500/10 text-violet-400 border border-violet-500/20"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Verified Skills Avg"
          value="68%"
          subtitle="Students with ≥3 badges"
          icon={<Award size={20} />}
          iconBg="bg-amber-500/10 text-amber-400 border border-amber-500/20"
          trend={{ value: 3, isPositive: true }}
        />
      </div>

      {/* Readiness Bar Chart */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Batch-wise Cohort Readiness (%)</h3>
          <p className="text-xs text-slate-400 mt-0.5">Visual breakdown by batch across all years</p>
        </div>
        <ReadinessBarChart data={batchChartData} height={220} />
      </div>

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
              { value: '3', label: 'Year 3' },
              { value: '4', label: 'Year 4' }
            ]}
          />
          <CustomSelect
            value={selectedBatch}
            onChange={setSelectedBatch}
            options={[
              { value: 'all', label: 'All Batches' },
              { value: 'Batch A', label: 'Batch A' },
              { value: 'Batch B', label: 'Batch B' }
            ]}
          />
        </div>
      </div>

      {/* Batch Reports Table */}
      {activeTab === 'batch' && (
        <div className="overflow-x-auto rounded-2xl border border-[#1e293b] bg-[#0f172a]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e293b] text-slate-400 font-semibold bg-[#080d18]/50">
                <th className="py-3.5 px-4">Batch Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Students</th>
                <th className="py-3.5 px-4">Verified %</th>
                <th className="py-3.5 px-4">Avg CGPA</th>
                <th className="py-3.5 px-4">Readiness</th>
                <th className="py-3.5 px-4">Placed Count</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredReports.map((rpt) => (
                <tr key={rpt.id} className="hover:bg-[#152035] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white">{rpt.batchName}</td>
                  <td className="py-3.5 px-4 text-slate-400">{rpt.department}</td>
                  <td className="py-3.5 px-4 text-slate-300">{rpt.totalStudents}</td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-400">{rpt.skillVerified} verified</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{rpt.avgCGPA}</td>
                  <td className="py-3.5 px-4 w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rpt.readinessPercent}%` }} />
                      </div>
                      <span className="font-semibold text-slate-200">{rpt.readinessPercent}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white">
                      {rpt.placedCount} / {rpt.totalStudents}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleExportPDF(rpt.batchName)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold border border-indigo-500/20"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => toast.success(`Exporting CSV for ${rpt.batchName}...`)}
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
        </div>
      )}

      {/* Placement Tab */}
      {activeTab === 'placement' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { company: 'Google', hired: 3, role: 'SWE', batch: 'CSE Year 4' },
            { company: 'Amazon', hired: 7, role: 'SDE-1', batch: 'CSE Year 4' },
            { company: 'Microsoft', hired: 5, role: 'Software Engineer', batch: 'CSE Year 4' },
            { company: 'Infosys', hired: 22, role: 'Systems Engineer', batch: 'Multiple' },
            { company: 'Wipro', hired: 18, role: 'Project Engineer', batch: 'Multiple' },
            { company: 'TCS', hired: 34, role: 'Systems Engineer', batch: 'Multiple' },
          ].map((c, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-3 hover:border-slate-700 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-extrabold text-sm">
                  {c.company[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white">{c.company}</h4>
                  <span className="text-xs text-slate-400">{c.role}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]">
                <span className="text-xs text-slate-400">Hired</span>
                <span className="text-lg font-extrabold text-emerald-400">{c.hired}</span>
              </div>
              <span className="inline-block text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{c.batch}</span>
            </div>
          ))}
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
