import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import TrustScoreGauge from '@/components/charts/TrustScoreGauge'
import PlacementStatusBadge from '@/components/student/PlacementStatusBadge'
import SkillBadge from '@/components/student/SkillBadge'
import { Code, Edit3 } from 'lucide-react'

export default function MyProfile() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const student = {
    name: user?.name || 'Student',
    rollNumber: user?.rollNumber || 'N/A',
    department: user?.department || 'Unknown',
    year: user?.year || 1,
    batch: user?.batch || 'Batch A',
    cgpa: user?.cgpa || 'N/A',
    placementStatus: (user?.placementStatus as 'Placed' | 'Eligible' | 'Ineligible' | 'In Process') || 'In Process',
    trustScore: user?.trustScore || 0,
    skills: user?.skills || [],
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'projects' | 'reviews'>('overview')

  useEffect(() => {
    document.title = 'My Profile — Kollab'
  }, [])

  return (
    <div className="space-y-6">
      {/* Cover Gradient Banner */}
      <div className="h-32 rounded-2xl bg-gradient-to-r from-indigo-900 via-violet-800 to-slate-900 border border-indigo-500/20 shadow-xl relative" />

      {/* Main Profile Info Card */}
      <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl relative -mt-16 mx-4 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-[#0f172a] shadow-xl">
              {student.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-3 justify-center sm:justify-start">
                <h2 className="text-2xl font-extrabold text-white">{student.name}</h2>
                <PlacementStatusBadge status={student.placementStatus} />
              </div>
              <p className="text-xs font-mono text-indigo-400 mt-1">{student.rollNumber}</p>
              <p className="text-xs text-slate-400">
                {student.department} · Year {student.year} ({student.batch}) · CGPA: <span className="font-bold text-white">{student.cgpa}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <TrustScoreGauge score={student.trustScore} size={90} />
            <div className="flex flex-col gap-2">
              <a
                href={user?.github ? `https://${user.github}` : "https://github.com"}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] hover:border-slate-600 text-slate-300 text-xs font-semibold flex items-center gap-2"
              >
                <Code size={14} /> GitHub Profile
              </a>
              <button
                onClick={() => navigate('/student/settings')}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Edit3 size={14} /> Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#1e293b] gap-6 text-sm font-semibold">
          {(['overview', 'skills', 'projects', 'reviews'] as const).map((t) => (
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

        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-2">
              <h4 className="font-bold text-white text-sm">Student Bio</h4>
              <p className="text-slate-300 leading-relaxed">
                {user?.bio || 'Add a bio to your profile in Settings to let recruiters know about your technical interests and career goals.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Verified Skill Badges</h3>
              <button
                onClick={() => navigate('/student/analytics')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                + Take New Skill Test
              </button>
            </div>

            <div className="space-y-3">
              {student.skills.length > 0 ? student.skills.map((s: any, idx: number) => (
                <div key={s.id || idx} className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <SkillBadge status={s.status} />
                    <span className="font-bold text-white">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${s.score}%` }} />
                    </div>
                    <span className="font-bold text-emerald-400">{s.score}%</span>
                  </div>
                </div>
              )) : (
                <p className="text-slate-400 text-xs">No verified skills yet. Take a skill test to earn badges.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <p className="text-slate-400 text-xs col-span-2">No projects joined yet. Create or join a project from My Projects.</p>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-3">
            <p className="text-slate-400 text-xs">No peer reviews recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
