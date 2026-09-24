import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { DEPARTMENTS } from '@/utils/constants'
import { GraduationCap, CheckCircle2, Eye, EyeOff, ArrowRight, Code } from 'lucide-react'
import CustomSelect from '@/components/shared/CustomSelect'
import toast from 'react-hot-toast'

import { authApi } from '@/api/auth.api'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()

  useEffect(() => {
    document.title = 'Login — Kollab'
  }, [])

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Login Form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Password visibility states for registration
  const [showRegPassword, setShowRegPassword] = useState(false)
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false)

  // Register state
  const [regStep, setRegStep] = useState<1 | 2>(1)
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regDept, setRegDept] = useState(DEPARTMENTS[0])
  const [regYear, setRegYear] = useState('4')
  const [regBatch, setRegBatch] = useState('CSE Batch B')
  const [regRoll, setRegRoll] = useState('')

  // Step 2 OTP & Password
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [regPassword, setRegPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otpTimer, setOtpTimer] = useState(60)

  useEffect(() => {
    let timer: any
    if (regStep === 2 && otpTimer > 0) {
      timer = setInterval(() => setOtpTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [regStep, otpTimer])

  const [loginError, setLoginError] = useState<string | null>(null)
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)
    try {
      const response = await authApi.login({
        email: loginEmail,
        password: loginPassword,
      })
      login(response.user, response.access_token)
      navigate(response.user.role === 'coordinator' ? '/coordinator/dashboard' : '/student/dashboard')
    } catch (err: any) {
      setLoginError(err.response?.data?.detail || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (val: string, idx: number) => {
    if (val.length > 1) {
      const digits = val.slice(0, 6).split('')
      const newOtp = [...otp]
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d
      })
      setOtp(newOtp)
      return
    }
    const newOtp = [...otp]
    newOtp[idx] = val
    setOtp(newOtp)
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-${idx + 1}`)
      nextInput?.focus()
    }
  }

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 10) score += 1
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1
    return score
  }

  const strength = getPasswordStrength(regPassword)

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-100 flex flex-col md:flex-row">
      {/* Left 40% Panel */}
      <div className="md:w-5/12 bg-[#080d18] border-r border-[#1e293b] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-indigo-600/30">
              <GraduationCap size={24} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
              Kollab
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            From Year 1 to Placement — All in One Place
          </h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Empower your degree journey with skill verification, AI team matching, proctored tests, and placement tracking.
          </p>

          <div className="space-y-4">
            {[
              '4-Year Automated Student Progression & Badging',
              'Proctored Skill MCQ Tests with Tab-Switch Guard',
              'AI-Powered Teammate Matchmaking & Kanban Workspace'
            ].map((bullet, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <span className="text-xs font-medium text-slate-300">{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-[#1e293b] mt-10 grid grid-cols-3 gap-4 text-center">
          <div>
            <h4 className="text-xl font-extrabold text-white">CSE Dept</h4>
            <span className="text-[11px] text-slate-500">Batches A, B, C</span>
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-white">Year 4</h4>
            <span className="text-[11px] text-slate-500">Academic Cohort</span>
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-emerald-400">92%</h4>
            <span className="text-[11px] text-slate-500">Placement Readiness</span>
          </div>
        </div>
      </div>

      {/* Right 60% Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl bg-[#0f172a] border border-[#1e293b]">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>

          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="bg-rose-500/10 text-rose-400 p-3 rounded-xl border border-rose-500/20 text-xs font-semibold text-center">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="priti@college.edu or coordinator@college.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-slate-100 text-sm focus:outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Coordinator: coordinator@college.edu / password123</span>
                <a href="#" className="text-indigo-400 hover:underline">Forgot?</a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1e293b]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0a0f1e] px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLoginEmail('priti@college.edu')
                  setLoginPassword('password123')
                }}
                className="w-full py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-slate-600 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Code size={16} /> Quick Sign In as Priti Jadhav (CSE Batch B)
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {regStep === 1 ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Priti Jadhav"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-sm text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">College Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="priti@college.edu"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-sm text-slate-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                      <CustomSelect
                        value={regDept}
                        onChange={setRegDept}
                        options={DEPARTMENTS.map((d) => ({ value: d, label: d }))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Year</label>
                      <CustomSelect
                        value={regYear}
                        onChange={setRegYear}
                        options={[
                          { value: '1', label: 'Year 1' },
                          { value: '2', label: 'Year 2' },
                          { value: '3', label: 'Year 3' },
                          { value: '4', label: 'Year 4' }
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Batch Section</label>
                      <CustomSelect
                        value={regBatch}
                        onChange={setRegBatch}
                        options={[
                          { value: 'CSE Batch A', label: 'CSE Batch A' },
                          { value: 'CSE Batch B', label: 'CSE Batch B' },
                          { value: 'CSE Batch C', label: 'CSE Batch C' }
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={regRoll}
                        onChange={(e) => setRegRoll(e.target.value)}
                        placeholder="CSE21001"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-sm text-slate-100"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        setIsLoading(true)
                        await authApi.registerStep1({
                          name: regName,
                          email: regEmail,
                          department: regDept,
                          year: regYear,
                          batch: regBatch,
                          rollNumber: regRoll
                        })
                        setRegStep(2)
                      } catch (err: any) {
                        toast.error(err.response?.data?.detail || 'Failed to send OTP')
                      } finally {
                        setIsLoading(false)
                      }
                    }}
                    disabled={isLoading}
                    className="w-full py-2.5 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white text-xs shadow-lg shadow-indigo-600/20"
                  >
                    {isLoading ? 'Sending...' : 'Send Verification OTP →'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex gap-2 justify-between">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, idx)}
                          className="w-10 h-11 text-center font-bold text-lg rounded-xl bg-[#0f172a] border border-[#1e293b] text-white focus:border-indigo-500"
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Resend code in <span className="text-indigo-400 font-bold">{otpTimer}s</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Create Password</label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-sm text-slate-100 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      <div className={`h-1.5 rounded ${strength >= 1 ? 'bg-rose-500' : 'bg-slate-800'}`} />
                      <div className={`h-1.5 rounded ${strength >= 2 ? 'bg-amber-500' : 'bg-slate-800'}`} />
                      <div className={`h-1.5 rounded ${strength >= 3 ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                      <div className={`h-1.5 rounded ${strength >= 4 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showRegConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 rounded-xl bg-[#0f172a] border border-[#1e293b] text-sm text-slate-100 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="w-1/3 py-2.5 rounded-xl bg-[#0f172a] border border-[#1e293b] text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        if (regPassword !== confirmPassword) {
                          toast.error('Passwords do not match')
                          return
                        }
                        const otpStr = otp.join('')
                        if (otpStr.length < 6) {
                          toast.error('Please enter the 6-digit OTP')
                          return
                        }
                        
                        try {
                          setIsLoading(true)
                          const response = await authApi.verifyOtpAndRegister({
                            otp: otpStr,
                            password: regPassword,
                            confirmPassword: confirmPassword
                          }, {
                            name: regName,
                            email: regEmail,
                            department: regDept,
                            year: regYear,
                            batch: regBatch,
                            rollNumber: regRoll
                          })
                          login(response.user, response.access_token)
                          navigate('/student/dashboard')
                        } catch (err: any) {
                          toast.error(err.response?.data?.detail || 'Registration failed')
                        } finally {
                          setIsLoading(false)
                        }
                      }}
                      className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
                    >
                      {isLoading ? 'Registering...' : 'Complete Registration'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
