import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MOCK_STUDENTS, MOCK_TIMELINE_EVENTS, MOCK_PROJECTS, MOCK_TEST_RESULT } from '@/utils/mockData'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import PlacementStatusBadge from '@/components/student/PlacementStatusBadge'
import SkillBadge from '@/components/student/SkillBadge'
import AIInsightCard from '@/components/dashboard/AIInsightCard'
import { Bell, Download, ArrowLeft, CheckCircle2, Clock, Award, FolderKanban } from 'lucide-react'

export default function StudentTimeline() {
  const { id } = useParams()
  const navigate = useNavigate()
  const student = MOCK_STUDENTS.find((s) => s.id === id) || MOCK_STUDENTS[0]
  const [activeTab, setActiveTab] = useState<'timeline' | 'skills' | 'projects' | 'tests'>('timeline')

  useEffect(() => {
    if (student) {
      document.title = `${student.name} — Kollab`
    }
  }, [student])

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/coordinator/students')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to Students Roster
      </button>

      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-indigo-400/40 shadow-lg shadow-indigo-600/30">
            {student.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <h2 className="text-2xl font-extrabold text-white">{student.name}</h2>
              <PlacementStatusBadge status={student.placementStatus} />
            </div>
            <p className="text-xs font-mono text-indigo-400">{student.rollNumber}</p>
            <p className="text-xs text-slate-400">
              {student.department} · Year {student.year} ({student.batch}) · CGPA:{' '}
              <span className="font-bold text-white">{student.cgpa}</span>
            </p>
          </div>
        </div>

        {/* Gauge & Actions */}
        <div className="flex items-center gap-6">
          <TrustScoreGauge score={student.trustScore} size={100} />
          <div className="flex flex-col gap-2">
            <button className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2">
              <Bell size={14} /> Send Alert
            </button>
            <button className="px-3.5 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-2">
              <Download size={14} /> Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#1e293b] gap-6 text-sm font-semibold">
            {(['timeline', 'skills', 'projects', 'tests'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`pb-3 capitalize transition-colors relative ${
                  activeTab === t ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === 'timeline' && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-6">
              <h3 className="text-base font-bold text-white">4-Year Degree Progression Timeline</h3>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e293b]">
                {MOCK_TIMELINE_EVENTS.map((evt) => (
                  <div key={evt.id} className="relative group">
                    <div
                      className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-[#0f172a] ${
                        evt.status === 'completed'
                          ? 'bg-emerald-500 ring-4 ring-emerald-500/20'
                          : evt.status === 'active'
                          ? 'bg-indigo-500 ring-4 ring-indigo-500/20 animate-pulse'
                          : 'bg-slate-700'
                      }`}
                    />
                    <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-indigo-400 uppercase">Year {evt.year}</span>
                        <span className="text-slate-500">{evt.date}</span>
                      </div>
                      <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{evt.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Verified Technical Skills</h3>
              <div className="space-y-4">
                {student.skills.map((skill) => (
                  <div key={skill.id} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SkillBadge status={skill.status} />
                      <div>
                        <h4 className="font-bold text-white text-sm">{skill.name}</h4>
                        <span className="text-[10px] text-slate-400">Category: Technical Skill</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${skill.score}%` }} />
                      </div>
                      <span className="font-bold text-xs text-emerald-400">{skill.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Collaborative Student Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_PROJECTS.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400">
                      {proj.status}
                    </span>
                    <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Proctored Test Results</h3>
              <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">React.js Advanced Proctored Test</h4>
                  <p className="text-slate-400">Completed on 14 Sep 2026</p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-400 text-sm">85% PASSED</span>
                  <p className="text-[10px] text-slate-500">0 Tab Switches Detected</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <AIInsightCard insight={`${student.name} is performing in the top 10% of Batch A. Recommended for Senior Full Stack role evaluation.`} />
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-3">
            <h4 className="text-sm font-bold text-white">Quick Coordinator Actions</h4>
            <button
              onClick={() => navigate('/coordinator/assign-test')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
            >
              Assign Recommended Skill Test
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
