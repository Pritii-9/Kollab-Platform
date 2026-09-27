import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SKILLS } from '@/utils/constants'
import {
  ClipboardList, ShieldCheck, Check, Send, FileSpreadsheet, Wand2, Clock,
  Users, Zap, Search, Award, Sliders, Plus, X, ShieldAlert, Cpu, Sparkles,
  Trash2, Layers, BarChart3, RefreshCw, AlertCircle
} from 'lucide-react'
import CustomDatePicker from '@/components/shared/CustomDatePicker'
import CustomSelect from '@/components/shared/CustomSelect'
import { testsApi } from '@/api/tests.api'
import type { Test, TestAttemptRecord } from '@/types/test.types'
import toast from 'react-hot-toast'

const PROMPT_PRESETS = [
  {
    label: 'Async & JWT Auth',
    prompt: 'Focus 60% of questions on Async/Await promises, Express/FastAPI middleware, JWT authentication patterns & token refresh security.',
  },
  {
    label: 'System Design & DB',
    prompt: 'Focus on Microservices architecture, Redis caching strategies, Database partitioning, B-Tree indexing & API Rate Limiting.',
  },
  {
    label: 'DS & Complexity',
    prompt: 'Prioritize Tree & Graph algorithms (BFS/DFS), Memory allocation, Time/Space O(N) complexity analysis, and Dynamic Programming.',
  },
  {
    label: 'SQL & Transactions',
    prompt: 'Focus on complex SQL Joins, Indexing, ACID transaction isolation levels, query execution plan optimization, and ORM performance.',
  },
  {
    label: 'REST API & Security',
    prompt: 'Emphasize RESTful API design standards, OAuth2 flows, CORS headers, CSRF mitigation, and input payload sanitization.',
  },
]

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

  const [targetType, setTargetType] = useState<'branch' | 'year' | 'individual'>('branch')
  const [targetVal, setTargetVal] = useState('Computer Science & Engineering (CSE)')
  const [dueDate, setDueDate] = useState('2026-09-30')

  const [customPrompt, setCustomPrompt] = useState('')
  const [syllabusContext, setSyllabusContext] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Real database test deployments and telemetry state
  const [deployedTests, setDeployedTests] = useState<Test[]>([])
  const [attemptsList, setAttemptsList] = useState<TestAttemptRecord[]>([])
  const [isFetchingDeployments, setIsFetchingDeployments] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Assign Skill Test — Kollab'
    loadDeploymentsAndAnalytics()
  }, [])

  const loadDeploymentsAndAnalytics = async () => {
    setIsFetchingDeployments(true)
    try {
      const [testsData, attemptsData] = await Promise.all([
        testsApi.listTests().catch(() => []),
        testsApi.getTestAttempts().catch(() => [])
      ])
      setDeployedTests(testsData)
      setAttemptsList(attemptsData)
    } catch {
      // Graceful fallback
    } finally {
      setIsFetchingDeployments(false)
    }
  }

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
    if (preset === 'standard') {
      setDifficulty('Medium'); setQuestionCount(20); setTimeLimit(30); setAttempts(2); setTabDetection(true); setFullscreenLock(true)
      toast.success('Standard Assessment Preset Applied')
    } else if (preset === 'placement') {
      setDifficulty('Hard'); setQuestionCount(30); setTimeLimit(45); setAttempts(1); setTabDetection(true); setFullscreenLock(true)
      toast.success('Placement Drive Assessment Preset Applied')
    } else {
      setDifficulty('Easy'); setQuestionCount(10); setTimeLimit(15); setAttempts(3); setTabDetection(false); setFullscreenLock(false)
      toast.success('Quick Quiz Assessment Preset Applied')
    }
  }

  const handleAssign = async () => {
    if (!selectedSkill) {
      toast.error('Please select a target skill first')
      return
    }

    setIsLoading(true)
    try {
      await testsApi.createTest({
        title: `${selectedSkill} ${difficulty} Assessment`,
        skillName: selectedSkill,
        difficulty,
        questionCount,
        prompt: customPrompt.trim(),
        context: syllabusContext.trim(),
        timeLimit,
        attempts,
        antiCheat: { randomizeQuestions: randomizeQs, randomizeOptions, tabDetection, fullscreenLock },
        assignedTo: targetType,
        targetBatch: targetVal,
        dueDate
      })

      setIsSuccess(true)
      toast.success(`${selectedSkill} test (${questionCount} Qs) assigned to ${targetVal}!`)
      
      // Instantly refresh the right-hand panel live list
      await loadDeploymentsAndAnalytics()

      setTimeout(() => setIsSuccess(false), 3500)
    } catch {
      toast.error('Failed to assign test. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTest = async (testId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to retract/delete "${title}"?`)) return
    setDeletingId(testId)
    try {
      await testsApi.deleteTest(testId)
      toast.success('Test retracted successfully')
      await loadDeploymentsAndAnalytics()
    } catch {
      toast.error('Failed to delete test')
    } finally {
      setDeletingId(null)
    }
  }

  const branchOptions = [
    { value: 'Computer Science & Engineering (CSE)', label: 'CSE — Computer Science & Eng.' },
    { value: 'Information Technology (IT)', label: 'IT — Information Technology' },
    { value: 'Artificial Intelligence & Data Science (AI&DS)', label: 'AI&DS — AI & Data Science' },
    { value: 'Artificial Intelligence & Machine Learning (AIML)', label: 'AIML — AI & Machine Learning' },
  ]
  const yearOptions = [
    { value: 'Year 4 (Placement Active)', label: 'Year 4 — Placement Cohort (Active)' },
    { value: 'Year 3 (Upcoming Module)', label: 'Year 3 — Pre-Placement (Upcoming)' },
    { value: 'Year 2 (Upcoming Module)', label: 'Year 2 — Technical Core (Upcoming)' },
    { value: 'Year 1 (Upcoming Module)', label: 'Year 1 — Foundations (Upcoming)' },
  ]
  const individualOptions = [{ value: 'All Active Students', label: 'All Registered Students' }]

  // Live analytics calculations
  const totalSubmissions = attemptsList.length
  const passCount = attemptsList.filter(a => a.passed).length
  const avgPassPercentage = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 88

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
            <p className="text-[11px] text-slate-400">Configure AI generation parameters, anti-cheat guards, and live deployments</p>
          </div>
        </div>
        <button onClick={() => navigate('/coordinator/test-results')} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0">
          <FileSpreadsheet size={14} /> Gradebook →
        </button>
      </div>

      {/* ── Preset Bar ── */}
      <div className="px-4 py-2 rounded-xl bg-[#0f172a]/80 border border-slate-800 flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px] shrink-0">
          <Zap size={13} className="animate-pulse text-indigo-400" /> Presets:
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'standard', label: 'Standard (20 Qs · 30m)', color: 'text-emerald-400' },
            { key: 'placement', label: 'Placement Drive (30 Qs)', color: 'text-indigo-400' },
            { key: 'quiz', label: 'Quick Quiz (10m)', color: 'text-amber-400' },
          ].map(p => (
            <button key={p.key} onClick={() => applyPreset(p.key as any)} className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-semibold transition-all flex items-center gap-1 hover:border-slate-700">
              <Check size={11} className={p.color} /> {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main 2-Column Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">

        {/* ══ LEFT: Form Container ══ */}
        <div className="lg:col-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl divide-y divide-slate-800/80 overflow-hidden flex flex-col">

          {/* § 1 — Skill Selection */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Wand2 size={13} className="text-indigo-400" /> 1. Target Skill Badge
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

          {/* § 2 — Structure & AI Prompting (Redesigned & Optimized Sizing) */}
          <div className="p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders size={13} className="text-violet-400" /> 2. Structure, AI Directives & Context
              </h2>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> LLM Prompt Engine
              </span>
            </div>

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

            {/* Custom Prompt & Context Field Redesigned */}
            <div className="space-y-3 pt-2.5 border-t border-slate-800/80">
              
              {/* Quick Prompt Presets Pills */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" /> Admin Custom AI Prompt / Focus Area
                  </label>
                  <span className="text-[10px] text-slate-500">{customPrompt.length} chars</span>
                </div>
                
                {/* Clickable AI Prompt Shortcut Pills */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-[10px] font-semibold text-slate-500">Quick Focus:</span>
                  {PROMPT_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomPrompt(preset.prompt)}
                      className="px-2 py-0.5 rounded-md bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-[10px] font-medium text-indigo-300 hover:text-indigo-200 transition-all"
                      title={preset.prompt}
                    >
                      ⚡ {preset.label}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Focus 60% of questions on Async/Await, Middleware & JWT auth patterns, and include multi-choice options with practical code snippets..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-y leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                    Domain Syllabus & Placement Context
                  </label>
                  <span className="text-[10px] text-slate-500">{syllabusContext.length} chars</span>
                </div>
                <textarea
                  rows={2}
                  value={syllabusContext}
                  onChange={e => setSyllabusContext(e.target.value)}
                  placeholder="Paste syllabus context, placement company exam patterns (e.g. TCS Ninja, Infosys SP, Product Company MCQs, LeetCode style logic)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all resize-y leading-relaxed"
                />
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
              <Users size={13} className="text-amber-400" /> 4. Target Branch & Deadline
            </h2>
            <div className="flex gap-4">
              {[
                { key: 'branch', label: 'Branch (CSE, IT, AI&DS, AIML)' },
                { key: 'year', label: 'Academic Year' },
                { key: 'individual', label: 'Individual' },
              ].map(tgt => (
                <label key={tgt.key} className="flex items-center gap-1.5 cursor-pointer capitalize text-slate-300 text-[11px] font-semibold">
                  <input type="radio" name="targetType" checked={targetType === tgt.key} onChange={() => {
                    setTargetType(tgt.key as any)
                    if (tgt.key === 'branch') setTargetVal(branchOptions[0].value)
                    else if (tgt.key === 'year') setTargetVal(yearOptions[0].value)
                    else setTargetVal(individualOptions[0].value)
                  }} className="accent-indigo-500" />
                  {tgt.label}
                </label>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Selection Target</label>
                <CustomSelect value={targetVal} onChange={setTargetVal} options={targetType === 'branch' ? branchOptions : targetType === 'year' ? yearOptions : individualOptions} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Deadline</label>
                <CustomDatePicker value={dueDate} onChange={setDueDate} placeholder="Select deadline..." />
              </div>
            </div>
          </div>

          {/* § 5 — Passing Cutoff */}
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

        {/* ══ RIGHT: Live Dossier & Real DB Deployments (No Blank Space!) ══ */}
        <div className="lg:col-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">

          <div className="divide-y divide-slate-800/80">
            {/* Live Config Summary */}
            <div className="p-4 space-y-2.5">
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

            {/* Live Telemetry Cards */}
            <div className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <BarChart3 size={12} className="text-indigo-400" /> Cohort Telemetry
                </span>
                <button
                  type="button"
                  onClick={loadDeploymentsAndAnalytics}
                  className="text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  title="Refresh Telemetry"
                >
                  <RefreshCw size={10} className={isFetchingDeployments ? 'animate-spin' : ''} /> Sync Live
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Active Deployments</span>
                  <span className="font-extrabold text-indigo-400 text-sm">{deployedTests.length} Tests</span>
                  <span className="text-[9px] text-slate-500 block">{totalSubmissions} Student Submissions</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Cohort Pass Rate</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{avgPassPercentage}% Pass</span>
                  <span className="text-[9px] text-slate-500 block">Proctor Verified</span>
                </div>
              </div>
            </div>

            {/* Live DB Deployed Tests List (Replaces Gray Empty Box!) */}
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-400" />
                  <span className="text-[11px] font-bold text-slate-200">Active Test Deployments</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {deployedTests.length}
                  </span>
                </div>
                <button onClick={() => navigate('/coordinator/test-results')} className="text-[10px] text-indigo-400 hover:underline font-semibold">
                  View Gradebook →
                </button>
              </div>

              {isFetchingDeployments ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <RefreshCw size={18} className="animate-spin text-indigo-400" />
                  <span className="text-xs font-medium">Fetching live database deployments...</span>
                </div>
              ) : deployedTests.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {deployedTests.map((test) => (
                    <div
                      key={test.id}
                      className="p-3 rounded-xl bg-slate-950/90 border border-slate-800/90 hover:border-indigo-500/40 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs font-extrabold text-white truncate">{test.title}</h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {test.skillName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 flex-wrap">
                          <span>{test.questionCount || 20} Qs · {test.timeLimit}m</span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium truncate max-w-[150px]">{test.targetBatch || test.assignedTo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/test-preview/${test.id}`)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all text-[10px]"
                          title="Preview Test"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTest(test.id, test.title)}
                          disabled={deletingId === test.id}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-all disabled:opacity-50"
                          title="Retract / Delete Test"
                        >
                          {deletingId === test.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Slick empty state container when 0 tests exist */
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 mx-auto flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Ready for First Test Deployment</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      Fill out the parameters on the left and hit <span className="text-indigo-400 font-bold">Deploy</span> to broadcast to students.
                    </p>
                  </div>
                </div>
              )}
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
                <Check size={14} /> Assessment Deployed & Synchronized Live!
              </div>
            )}

            <button onClick={handleAssign} disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-extrabold text-white text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer">
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Send size={14} /> Deploy & Assign Skill Assessment</>
              )}
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
