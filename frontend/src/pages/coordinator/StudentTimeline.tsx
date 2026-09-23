import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studentsApi } from '@/api/students.api'
import type { Student, TimelineEvent } from '@/types/student.types'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import PlacementStatusBadge from '@/components/student/PlacementStatusBadge'
import SkillBadge from '@/components/student/SkillBadge'
import AIInsightCard from '@/components/dashboard/AIInsightCard'
import EmptyState from '@/components/shared/EmptyState'
import { Bell, Download, ArrowLeft, CheckCircle2, Clock, Award, FolderKanban, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function StudentTimeline() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [student, setStudent] = useState<Student | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'timeline' | 'skills' | 'projects' | 'tests'>('timeline')

  useEffect(() => {
    let isMounted = true
    if (!id) {
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      studentsApi.getStudentById(id).catch(() => null),
      studentsApi.getTimeline(id).catch(() => [])
    ]).then(([studentData, timelineData]) => {
      if (isMounted) {
        setStudent(studentData)
        setTimeline(timelineData || [])
        setLoading(false)
        if (studentData) {
          document.title = `${studentData.name} — Kollab`
        }
      }
    })

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] space-y-3">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
        <p className="text-xs text-slate-400 font-semibold">Loading student timeline...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/coordinator/students')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Students Roster
        </button>
        <EmptyState
          icon={<AlertCircle size={32} className="text-amber-400" />}
          title="Student Not Found"
          description="The requested student profile could not be found."
          action={{ label: 'Back to Students Roster', onClick: () => navigate('/coordinator/students') }}
        />
      </div>
    )
  }

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
            <button
              onClick={() => toast.success(`Placement alert sent to ${student.name}`)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Bell size={14} /> Send Alert
            </button>
            <button
              onClick={() => toast.success(`Exported timeline report for ${student.name}`)}
              className="px-3.5 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-2"
            >
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
              {timeline && timeline.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1e293b]">
                  {timeline.map((evt) => (
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
              ) : (
                <p className="text-slate-400 text-xs text-center py-6">No timeline events recorded for this student yet.</p>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Verified Technical Skills</h3>
              {student.skills && student.skills.length > 0 ? (
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
              ) : (
                <p className="text-slate-400 text-xs text-center py-6">No verified skill badges on profile.</p>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Collaborative Student Projects</h3>
              <p className="text-slate-400 text-xs text-center py-6">No projects recorded for this student.</p>
            </div>
          )}

          {activeTab === 'tests' && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Proctored Test Results</h3>
              <p className="text-slate-400 text-xs text-center py-6">No proctored test assessments completed yet.</p>
            </div>
          )}
        </div>

        {/* Right Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <AIInsightCard insight={`${student.name} is currently in Year ${student.year} (${student.batch}) with a Trust Score of ${student.trustScore}.`} />
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
