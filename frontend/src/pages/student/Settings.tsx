import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import ConfirmModal from '@/components/shared/ConfirmModal'
import { User, Bell, Shield, Key, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuthStore()
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile')

  // Profile Form
  const [name, setName] = useState(user?.name || '')
  const [bio, setBio] = useState('Full-stack CS student')
  const [cgpa, setCgpa] = useState((user as any)?.cgpa || '')
  const [github, setGithub] = useState('')

  // Toggles
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [projectInvites, setProjectInvites] = useState(true)

  // Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    document.title = 'Settings — Kollab'
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-white">Account Settings</h2>
        <p className="text-xs text-slate-400">Manage profile details, notification preferences, and security</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Nav (3 cols) */}
        <div className="lg:col-span-3 space-y-1 p-2 rounded-2xl bg-[#0f172a] border border-[#1e293b] text-xs">
          {[
            { id: 'profile', label: 'Profile Information', icon: <User size={16} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
            { id: 'privacy', label: 'Privacy & Sharing', icon: <Shield size={16} /> },
            { id: 'account', label: 'Security & Account', icon: <Key size={16} /> }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold transition-colors ${
                activeSection === sec.id
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sec.icon} {sec.label}
            </button>
          ))}
        </div>

        {/* Right Content (9 cols) */}
        <div className="lg:col-span-9 p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-4">
          {activeSection === 'profile' && (
            <form onSubmit={(e) => { e.preventDefault(); updateUser({ name, cgpa } as any); toast.success('Profile saved successfully!') }} className="space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Edit Student Profile</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CGPA</label>
                  <input
                    type="text"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub Profile URL</label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio Summary</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white resize-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </form>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white mb-4">Notification Preferences</h3>
              <div className="space-y-3 text-xs">
                {[
                  { key: 'emailAlerts', state: emailAlerts, setter: setEmailAlerts, label: 'Email Test Alerts', desc: 'Receive email when a proctored test is assigned to your batch' },
                  { key: 'projectInvites', state: projectInvites, setter: setProjectInvites, label: 'Peer Team Invites', desc: 'Allow teammates to send AI matchmaking project invites' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-[#080d18] border border-[#1e293b] gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white block mb-0.5">{item.label}</span>
                      <span className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => item.setter(!item.state)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                        item.state ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                          item.state ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-base font-bold text-white mb-4">Privacy & Cohort Visibility</h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Control what's visible to placement coordinators and peer teammates.
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Show Profile to Coordinators', desc: 'Your test scores and verified badges are visible to department coordinators', defaultOn: true },
                  { label: 'Visible in Find Teammates', desc: 'Allow peers to discover and invite you to collaborative projects', defaultOn: true },
                  { label: 'Share Test Scores Publicly', desc: 'Display test score percentile on your public profile', defaultOn: false },
                  { label: 'LinkedIn Profile Sync', desc: 'Allow Kollab to suggest your profile to linked recruiters', defaultOn: false },
                ].map((item, idx) => {
                  const [on, setOn] = [idx === 0 || idx === 1, () => {}]
                  return (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-[#080d18] border border-[#1e293b] gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-white block mb-0.5">{item.label}</span>
                        <span className="text-slate-400 text-[11px] leading-relaxed">{item.desc}</span>
                      </div>
                      <button
                        type="button"
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                          item.defaultOn ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                            item.defaultOn ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeSection === 'account' && (
            <div className="space-y-6 text-xs">
              <h3 className="text-base font-bold text-white">Security & Password</h3>

              {/* Change Password */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-300">Change Password</h4>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Current Password</label>
                  <input type="password" placeholder="••••••••••" className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                    <input type="password" placeholder="••••••••••" className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm New Password</label>
                    <input type="password" placeholder="••••••••••" className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white" />
                  </div>
                </div>
                <button
                  onClick={() => toast.success('Password updated!')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20"
                >
                  Update Password
                </button>
              </div>

              {/* 2FA */}
              <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-white block mb-0.5">Two-Factor Authentication</span>
                  <span className="text-slate-400 text-[11px]">Add an extra layer of security via email OTP</span>
                </div>
                <button className="px-3 py-1.5 rounded-xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Enable 2FA
                </button>
              </div>

              {/* Danger Zone */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-3">
                <h4 className="font-bold text-rose-400 text-sm">⚠ Danger Zone</h4>
                <p className="text-slate-300">Permanently delete student profile data and test history. This cannot be undone.</p>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/20"
                >
                  Delete Account Permanently
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Account?"
        description="Are you absolutely sure you want to permanently delete your student account and wipe all verification records? This action is irreversible."
        confirmLabel="Yes, delete my account"
        onConfirm={() => {
          setIsDeleteModalOpen(false)
          toast.success('Account deletion requested. Support will contact you shortly.')
        }}
        onClose={() => setIsDeleteModalOpen(false)}
        isDanger
      />
    </div>
  )
}
