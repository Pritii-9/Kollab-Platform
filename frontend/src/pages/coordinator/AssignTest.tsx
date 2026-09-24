import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SKILLS } from '@/utils/constants'
import {
  ClipboardList, ShieldCheck, Check, Send, FileSpreadsheet, Sparkles, Clock,
  Users, Zap, Search, Award, Sliders, Plus, X, ShieldAlert, Cpu
} from 'lucide-react'
import CustomDatePicker from '@/components/shared/CustomDatePicker'
import CustomSelect from '@/components/shared/CustomSelect'
import { testsApi } from '@/api/tests.api'
import toast from 'react-hot-toast'

export default function AssignTest() {
  const navigate = useNavigate()

  const [skillList, setSkillList] = useState<string[]>(SKILLS)
  const [selectedSkill, setSelectedSkill] = useState<string>(SKILLS[0])
  const [skillSearch, setSkillSearch] = useState('')

  const [isAddSkillModalOpen, setIsAddSkillModalOpen] = useState(false)
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillCategory, setNewSkillCategory] = useState('Frontend Development')

  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Medium')
  const [questionCount, setQuestionCount] = useState(20)
  const [timeLimit, setTimeLimit] = useState(30)
  const [attempts, setAttempts] = useState(2)
  const [passingScore, setPassingScore] = useState(70)

  const [randomizeQs, setRandomizeQs] = useState(true)
  const [randomizeOptions, setRandomizeOptions] = useState(true)
  const [tabDetection, setTabDetection] = useState(true)
  const [fullscreenLock, setFullscreenLock] = useState(true)

  const [targetType, setTargetType] = useState<'batch' | 'year' | 'individual'>('batch')
  const [targetVal, setTargetVal] = useState('CSE Batch A')
  const [dueDate, setDueDate] = useState('2026-09-30')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => { document.title = 'Assign Skill Test — Kollab' }, [])

  const filteredSkills = skillList.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newSkillName.trim()
    if (!trimmed) { toast.error('Please enter a valid skill name'); return }
    if (skillList.some(s => s.toLowerCase() === trimmed.toLowerCase())) { toast.error('Skill already exists'); return }
    setSkillList([trimmed, ...skillList])
    setSelectedSkill(trimmed)
    setNewSkillName('')
    setIsAddSkillModalOpen(false)
    toast.success(`Added "${trimmed}" to skill pool`)
  }

  const applyPreset = (preset: 'standard' | 'placement' | 'quiz') => {
    if (preset === 'standard') { setDifficulty('Medium'); setQuestionCount(20); setTimeLimit(30); setAttempts(2); setTabDetection(true); setFullscreenLock(true); toast.success('Standard Preset Applied') }
    else if (preset === 'placement') { setDifficulty('Hard'); setQuestionCount(30); setTimeLimit(45); setAttempts(1); setTabDetection(true); setFullscreenLock(true); toast.success('Placement Drive Preset Applied') }
    else { setDifficulty('Easy'); setQuestionCount(10); setTimeLimit(15); setAttempts(3); setTabDetection(false); setFullscreenLock(false); toast.success('Quick Quiz Preset Applied') }
  }

  const handleAssign = async () => {
    setIsLoading(true)
    try {
      await testsApi.createTest({ title: `${selectedSkill} ${difficulty} Assessment`, skillName: selectedSkill, difficulty, timeLimit, attempts, antiCheat: { randomizeQuestions: randomizeQs, randomizeOptions, tabDetection, fullscreenLock }, assignedTo: targetType, targetBatch: targetVal, dueDate }).catch(() => null)
      setIsSuccess(true)
      toast.success(`${selectedSkill} test assigned to ${targetVal}!`)
      setTimeout(() => setIsSuccess(false), 3500)
    } catch { toast.error('Failed to assign test.') }
    finally { setIsLoading(false) }
  }

  const batchOptions = [
    { value: 'CSE Batch A', label: 'CSE Batch A' },
    { value: 'CSE Batch B', label: 'CSE Batch B' },
    { value: 'CSE Batch C', label: 'CSE Batch C' },
  ]
  const yearOptions = [
    { value: 'Year 1', label: 'Year 1 Cohort' },
    { value: 'Year 2', label: 'Year 2 Cohort' },
    { value: 'Year 3', label: 'Year 3 Cohort' },
    { value: 'Year 4', label: 'Year 4 Cohort' },
  ]
  const individualOptions = [{ value: 'All Students', label: 'All Registered Students' }]

  return (
    <div className="animate-fade-in max-w-7xl mx-auto pb-6 space-y-3">

      {/* ── Header ── */}
      <div className="px-4 py-3 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-600/30 shrink-0">
            <ClipboardList size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold text-white">Assign Proctored Skill Assessment</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ADMIN CONTROL</span>
            </div>
            <p className="text-[11px] text-slate-400">Configure parameters, anti-cheat rules, and target deployment</p>
          </div>
        </div>
        <button onClick={() => navigate('/coordinator/test-results')} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0">
          <FileSpreadsheet size={14} /> Gradebook →
        </button>
      </div>

      {/* ── Preset Bar ── */}
      <div className="px-4 py-2 rounded-xl bg-[#0f172a]/80 border border-slate-800 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px] shrink-0">
          <Zap size={13} className="animate-pulse" /> Presets:
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'standard', label: 'Standard (20 Qs · 30m)', color: 'text-emerald-400' },
            { key: 'placement', label: 'Placement Drive (30 Qs)', color: 'text-indigo-400' },
            { key: 'quiz', label: 'Quick Quiz (10m)', color: 'text-amber-400' },
          ].map(p => (
            <button key={p.key} onClick={() => applyPreset(p.key as any)} className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-semibold transition-all flex items-center gap-1">
              <Check size={11} className={p.color} /> {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main 2-Column Grid — items-stretch keeps both columns equal height ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

        {/* ══ LEFT: Form Container ══ */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl divide-y divide-slate-800/80 overflow-hidden flex flex-col">

          {/* § 1 — Skill Badge */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-400" /> 1. Target Skill
              </h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1.5 text-slate-500" />
                  <input type="text" placeholder="Filter..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)}
                    className="w-28 pl-7 pr-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500" />
                </div>
                <button type="button" onClick={() => setIsAddSkillModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 transition-all shrink-0">
                  <Plus size={12} /> Add Skill
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {filteredSkills.slice(0, 18).map(sk => (
                <button key={sk} type="button" onClick={() => setSelectedSkill(sk)}
                  className={`py-1.5 px-1 rounded-lg text-[11px] font-bold border transition-all truncate text-center ${selectedSkill === sk ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500/50' : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white'}`}>
                  {sk}
                </button>
              ))}
            </div>
          </div>

          {/* § 2 — Structure & Parameters */}
          <div className="p-4 space-y-3">
            <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders size={13} className="text-violet-400" /> 2. Structure & Parameters
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Difficulty</label>
                <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                  {(['Easy', 'Medium', 'Hard', 'Mixed'] as const).map(d => (
                    <button key={d} type="button" onClick={() => setDifficulty(d)}
                      className={`py-1 rounded text-[10px] font-bold transition-all ${difficulty === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Duration</label>
                <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                  {[15, 30, 45, 60].map(t => (
                    <button key={t} type="button" onClick={() => setTimeLimit(t)}
                      className={`py-1 rounded text-[10px] font-bold transition-all ${timeLimit === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>{t}m</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                  <span>Questions</span><span className="text-indigo-400">{questionCount} Qs</span>
                </div>
                <div className="flex items-center gap-1">
                  {[5, 10, 20, 30].map(q => (
                    <button key={q} type="button" onClick={() => setQuestionCount(q)}
                      className={`flex-1 py-1 rounded-lg border text-[10px] font-bold transition-all ${questionCount === q ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}>{q}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Retries</label>
                <div className="flex items-center justify-between px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">
                  <button type="button" onClick={() => setAttempts(a => Math.max(a - 1, 1))} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-white font-bold text-[11px] flex items-center justify-center hover:bg-slate-700">−</button>
                  <span className="font-bold text-white text-[11px]">{attempts} Attempt{attempts > 1 ? 's' : ''}</span>
                  <button type="button" onClick={() => setAttempts(a => Math.min(a + 1, 5))} className="w-5 h-5 rounded bg-slate-800 border border-slate-700 text-white font-bold text-[11px] flex items-center justify-center hover:bg-slate-700">+</button>
                </div>
              </div>
            </div>
          </div>

          {/* § 3 — Anti-Cheat */}
          <div className="p-4 space-y-2.5">
            <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" /> 3. Anti-Cheat Controls
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Randomize Qs', desc: 'Shuffle order', state: randomizeQs, setter: setRandomizeQs },
                { label: 'Randomize Choices', desc: 'Shuffle options', state: randomizeOptions, setter: setRandomizeOptions },
                { label: 'Tab Switch Guard', desc: '3 warnings → submit', state: tabDetection, setter: setTabDetection },
                { label: 'Fullscreen Lock', desc: 'Enforce screen lock', state: fullscreenLock, setter: setFullscreenLock },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div>
                    <p className="text-slate-200 font-semibold text-[11px]">{item.label}</p>
                    <span className="text-[9px] text-slate-500">{item.desc}</span>
                  </div>
                  <button type="button" onClick={() => item.setter(!item.state)}
                    className={`w-8 h-4 rounded-full relative shrink-0 transition-colors ${item.state ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                    <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${item.state ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* § 4 — Target & Deadline */}
          <div className="p-4 space-y-2.5">
            <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={13} className="text-amber-400" /> 4. Target & Deadline
            </h2>
            <div className="flex gap-4">
              {(['batch', 'year', 'individual'] as const).map(tgt => (
                <label key={tgt} className="flex items-center gap-1.5 cursor-pointer capitalize text-slate-300 text-[11px] font-semibold">
                  <input type="radio" name="targetType" checked={targetType === tgt} onChange={() => setTargetType(tgt)} className="accent-indigo-500" />
                  {tgt}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Selection</label>
                <CustomSelect value={targetVal} onChange={setTargetVal} options={targetType === 'batch' ? batchOptions : targetType === 'year' ? yearOptions : individualOptions} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Deadline</label>
                <CustomDatePicker value={dueDate} onChange={setDueDate} placeholder="Select deadline..." />
              </div>
            </div>
          </div>

          {/* § 5 — Passing Cutoff (grows to fill remaining left-column height) */}
          <div className="p-4 space-y-2.5 flex-1">
            <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Award size={13} className="text-emerald-400" /> 5. Passing Cutoff
            </h2>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pass Threshold</label>
              <div className="grid grid-cols-4 gap-0.5 p-0.5 bg-slate-950 rounded-lg border border-slate-800">
                {[60, 70, 80, 90].map(score => (
                  <button key={score} type="button" onClick={() => setPassingScore(score)}
                    className={`py-1 rounded text-[10px] font-bold transition-all ${passingScore === score ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    {score}%
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-[10px] text-slate-400">
              Students scoring below <span className="text-indigo-400 font-bold">{passingScore}%</span> will be flagged for review. Anti-cheat log is archived per session.
            </div>
          </div>
        </div>

        {/* ══ RIGHT: Dossier — flex-col + justify-between to fill full height ══ */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl flex flex-col">

          {/* Live Config Summary */}
          <div className="p-4 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-[11px] font-bold text-white">Live Config Dossier</h2>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{selectedSkill}</span>
            </div>
            <div className="space-y-1 text-xs">
              {[
                { label: 'Skill Badge', value: selectedSkill, cls: 'text-indigo-400 font-bold' },
                { label: 'Difficulty', value: difficulty, cls: 'text-white font-bold' },
                { label: 'Structure', value: `${questionCount} Qs · ${timeLimit} Mins`, cls: 'text-white font-bold' },
                { label: 'Retries & Cutoff', value: `${attempts} Attempt(s) · ${passingScore}% Pass`, cls: 'text-white font-bold' },
                { label: 'Proctor Shield', value: tabDetection && fullscreenLock ? 'Full Anti-Cheat Active' : 'Basic Guard', cls: `font-bold ${tabDetection && fullscreenLock ? 'text-emerald-400' : 'text-amber-400'}` },
                { label: 'Assigned Cohort', value: targetVal, cls: 'text-white font-bold' },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between py-0.5 ${i < 5 ? 'border-b border-slate-800/60' : ''}`}>
                  <span className="text-slate-400">{row.label}</span>
                  <span className={row.cls}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cohort Telemetry */}
          <div className="p-4 border-b border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Users size={12} className="text-indigo-400" /> Target Cohort
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Synced on deploy</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">Cohort Avg Score</span>
                <span className="font-extrabold text-slate-400 text-sm">—</span>
                <span className="text-[9px] text-slate-600 block">No data yet</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">Last Deployment</span>
                <span className="font-extrabold text-slate-400 text-sm">—</span>
                <span className="text-[9px] text-slate-600 block">None yet</span>
              </div>
            </div>
          </div>

          {/* Recent Deployments — flex-1 fills remaining space */}
          <div className="p-4 border-b border-slate-800 space-y-2 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-slate-300">Recent Deployments</span>
              <button onClick={() => navigate('/coordinator/test-results')} className="text-[10px] text-indigo-400 hover:underline">View All</button>
            </div>
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <FileSpreadsheet size={24} className="text-slate-700" />
              <p className="text-[11px] text-slate-500 font-medium">No deployments yet</p>
              <p className="text-[10px] text-slate-600">Tests you deploy will appear here</p>
            </div>
          </div>

          {/* CTA Footer — always pinned to bottom of right card */}
          <div className="p-4 space-y-2.5">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2">
              <ShieldAlert size={15} className="text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-300 font-medium leading-snug">
                {tabDetection ? '3-warning tab switch enforcement' : 'Standard session monitoring'} active. Fullscreen {fullscreenLock ? 'required' : 'optional'}.
              </span>
            </div>

            {isSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-1.5 animate-fade-in">
                <Check size={14} /> Test Deployed Successfully!
              </div>
            )}

            <button onClick={handleAssign} disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-extrabold text-white text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60">
              {isLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={14} /> Deploy & Assign Skill Test</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Admin Modal: Add Skill ── */}
      {isAddSkillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative space-y-4">
            <button onClick={() => setIsAddSkillModalOpen(false)} className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white">
              <X size={16} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Cpu size={15} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white">Add Custom Skill</h3>
                <p className="text-[10px] text-slate-400">Admin: Register new technical skill badge</p>
              </div>
            </div>
            <form onSubmit={handleAddCustomSkill} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Skill Name</label>
                <input type="text" placeholder="e.g. Next.js, Rust, PyTorch..." value={newSkillName} onChange={e => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500" autoFocus />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Category</label>
                <CustomSelect value={newSkillCategory} onChange={setNewSkillCategory} options={[
                  { value: 'Frontend Development', label: 'Frontend Development' },
                  { value: 'Backend & Systems', label: 'Backend & Systems' },
                  { value: 'AI & Data Engineering', label: 'AI & Data Engineering' },
                  { value: 'DevOps & Cloud', label: 'DevOps & Cloud' },
                  { value: 'Mobile Development', label: 'Mobile Development' },
                ]} />
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button type="button" onClick={() => setIsAddSkillModalOpen(false)} className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/20">Add to Pool</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
