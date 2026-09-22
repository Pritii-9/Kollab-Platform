import { useState, useEffect } from 'react'
import { SKILLS } from '@/utils/constants'
import { ClipboardList, Clock, AlertTriangle, ShieldCheck, Check, Sparkles, Send } from 'lucide-react'

export default function AssignTest() {
  const [selectedSkill, setSelectedSkill] = useState(SKILLS[0])
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Medium')
  const [questionCount, setQuestionCount] = useState(20)
  const [timeLimit, setTimeLimit] = useState(30)
  const [attempts, setAttempts] = useState(2)

  // Anti-cheat toggles
  const [randomizeQs, setRandomizeQs] = useState(true)
  const [randomizeOptions, setRandomizeOptions] = useState(true)
  const [tabDetection, setTabDetection] = useState(true)
  const [fullscreenLock, setFullscreenLock] = useState(true)

  // Target radio
  const [targetType, setTargetType] = useState<'batch' | 'year' | 'individual'>('batch')
  const [targetVal, setTargetVal] = useState('Batch A')
  const [dueDate, setDueDate] = useState('2026-09-30')

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    document.title = 'Assign Test — Kollab'
  }, [])

  const handleAssign = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white">Assign Proctored Skill MCQ Test</h2>
        <p className="text-xs text-slate-400">Configure anti-cheat proctoring rules, questions, and assign to cohorts</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 60% Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Skill Selector */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList size={18} className="text-indigo-400" /> 1. Select Target Skill
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SKILLS.slice(0, 12).map((sk) => (
                <button
                  key={sk}
                  type="button"
                  onClick={() => setSelectedSkill(sk)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center truncate ${
                    selectedSkill === sk
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-600/10'
                      : 'bg-[#080d18] border-[#1e293b] text-slate-400 hover:text-white'
                  }`}
                >
                  {sk}
                </button>
              ))}
            </div>
          </div>

          {/* Configuration */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-5">
            <h3 className="text-sm font-bold text-white">2. Test Structure Parameters</h3>

            {/* Difficulty Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Difficulty Level</label>
              <div className="flex gap-2">
                {(['Easy', 'Medium', 'Hard', 'Mixed'] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      difficulty === d
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-[#080d18] border border-[#1e293b] text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider Question Count */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                <span>Number of Questions</span>
                <span className="text-indigo-400 font-bold">{questionCount} Questions</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Time Limit Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Time Limit</label>
              <div className="flex gap-2">
                {[15, 30, 45, 60].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeLimit(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      timeLimit === t
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-[#080d18] border border-[#1e293b] text-slate-400 hover:text-white'
                    }`}
                  >
                    {t} Mins
                  </button>
                ))}
              </div>
            </div>

            {/* Allowed Attempts */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Allowed Retries</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAttempts((a) => Math.max(a - 1, 1))}
                  className="w-8 h-8 rounded-lg bg-[#080d18] border border-[#1e293b] text-white font-bold"
                >
                  -
                </button>
                <span className="font-bold text-white text-sm">{attempts}</span>
                <button
                  type="button"
                  onClick={() => setAttempts((a) => Math.min(a + 1, 5))}
                  className="w-8 h-8 rounded-lg bg-[#080d18] border border-[#1e293b] text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Anti-Cheat Toggles */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" /> 3. Anti-Cheat Security Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {[
                { label: 'Randomize Questions', state: randomizeQs, setter: setRandomizeQs },
                { label: 'Randomize Options', state: randomizeOptions, setter: setRandomizeOptions },
                { label: 'Tab Detection (3 Warning Auto-Submit)', state: tabDetection, setter: setTabDetection },
                { label: 'Fullscreen Screen Lock', state: fullscreenLock, setter: setFullscreenLock }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#080d18] border border-[#1e293b]">
                  <span className="text-slate-300 font-medium">{item.label}</span>
                  <button
                    type="button"
                    onClick={() => item.setter(!item.state)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      item.state ? 'bg-indigo-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                        item.state ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment & Due Date */}
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] space-y-4">
            <h3 className="text-sm font-bold text-white">4. Target Cohort & Deadline</h3>
            <div className="flex gap-4 text-xs font-semibold">
              {(['batch', 'year', 'individual'] as const).map((tgt) => (
                <label key={tgt} className="flex items-center gap-2 cursor-pointer capitalize text-slate-300">
                  <input
                    type="radio"
                    name="targetType"
                    checked={targetType === tgt}
                    onChange={() => setTargetType(tgt)}
                    className="accent-indigo-500"
                  />
                  {tgt}
                </label>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Target Selection</label>
                <input
                  type="text"
                  value={targetVal}
                  onChange={(e) => setTargetVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-xs text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 40% Live Preview & Summary Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-xl space-y-6 sticky top-20">
            <h3 className="text-base font-bold text-white pb-3 border-b border-[#1e293b]">Test Config Summary</h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-[#1e293b]/50">
                <span className="text-slate-400">Target Skill</span>
                <span className="font-bold text-indigo-400">{selectedSkill}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1e293b]/50">
                <span className="text-slate-400">Difficulty</span>
                <span className="font-bold text-white">{difficulty}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1e293b]/50">
                <span className="text-slate-400">Questions / Duration</span>
                <span className="font-bold text-white">
                  {questionCount} Qs · {timeLimit} Mins
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1e293b]/50">
                <span className="text-slate-400">Anti-Cheat Mode</span>
                <span className="font-bold text-emerald-400">
                  {tabDetection && fullscreenLock ? 'Full Proctoring Active' : 'Basic Guard'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Assigned To</span>
                <span className="font-bold text-white">
                  {targetType.toUpperCase()}: {targetVal}
                </span>
              </div>
            </div>

            {/* Sample Question Box */}
            <div className="p-4 rounded-xl bg-[#080d18] border border-[#1e293b] space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sample AI Generated Question</span>
              <p className="text-xs font-semibold text-slate-200">
                What is the primary benefit of React Virtual DOM reconciliation algorithm?
              </p>
              <div className="space-y-1 pt-1">
                <div className="p-2 rounded bg-[#0f172a] text-[11px] text-slate-400">A. Directly mutates real DOM tree</div>
                <div className="p-2 rounded bg-indigo-600/10 border border-indigo-500/30 text-[11px] font-semibold text-indigo-300">
                  B. Minimizes costly DOM manipulations by computing diffs
                </div>
              </div>
            </div>

            {isSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold flex items-center justify-center gap-2">
                <Check size={16} /> Test Assigned Successfully!
              </div>
            )}

            <button
              onClick={handleAssign}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-extrabold text-white text-xs shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={16} /> Assign Test Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
