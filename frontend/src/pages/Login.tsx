import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { DEPARTMENTS } from '@/utils/constants'
import { GraduationCap, CheckCircle2, Eye, EyeOff, ArrowRight, Lock } from 'lucide-react'
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
  const [regBatch, setRegBatch] = useState('Batch A')
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

  // Login attempt counter — warns after 2 fails, locks for 30s at 5
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [lockCountdown, setLockCountdown] = useState(0)

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', ''])
  const [forgotStep, setForgotStep] = useState<'email' | 'otp' | 'newpass'>('email')
  const [forgotNewPass, setForgotNewPass] = useState('')
  const [forgotConfirmPass, setForgotConfirmPass] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [showForgotPwd, setShowForgotPwd] = useState(false)

  // Lockout countdown ticker
  useEffect(() => {
    if (!lockedUntil) return
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000))
      setLockCountdown(remaining)
      if (remaining === 0) { setLockedUntil(null); setLoginAttempts(0) }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Lockout guard
    if (lockedUntil && Date.now() < lockedUntil) {
      setLoginError(`Too many failed attempts. Please wait ${lockCountdown}s before trying again.`)
      return
    }
    setIsLoading(true)
    setLoginError(null)
    try {
      const response = await authApi.login({
        email: loginEmail,
        password: loginPassword,
      })
      setLoginAttempts(0)
      login(response.user, response.access_token)
      navigate(response.user.role === 'coordinator' ? '/coordinator/dashboard' : '/student/dashboard')
    } catch (err: any) {
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 30_000)
        setLoginError('Account locked for 30 seconds after 5 failed attempts.')
      } else {
        const left = 5 - newAttempts
        setLoginError(
          `${err.response?.data?.detail || 'Invalid email or password'}` +
          (newAttempts >= 2 ? ` — ${left} attempt${left !== 1 ? 's' : ''} remaining before lockout.` : '')
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotSendOtp = async () => {
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) { toast.error('Enter a valid email'); return }
    setForgotLoading(true)
    try {
      await authApi.registerStep1({ name: '', email: forgotEmail.trim().toLowerCase(), department: '', year: '', batch: '', rollNumber: '' })
    } catch { /* security: show same success message regardless */ }
    finally {
      setForgotLoading(false)
      setForgotStep('otp')
      toast.success('If this email is registered, a reset OTP has been sent.')
    }
  }

  const handleForgotOtpChange = (val: string, idx: number) => {
    const newOtp = [...forgotOtp]; newOtp[idx] = val.slice(-1); setForgotOtp(newOtp)
    if (val && idx < 5) document.getElementById(`fotp-${idx + 1}`)?.focus()
  }

  const handleForgotReset = async () => {
    if (forgotOtp.join('').length < 6) { toast.error('Enter the full 6-digit code'); return }
    if (forgotNewPass.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (forgotNewPass !== forgotConfirmPass) { toast.error('Passwords do not match'); return }
    setForgotLoading(true)
    try {
      await authApi.verifyOtpAndRegister(
        { otp: forgotOtp.join(''), password: forgotNewPass, confirmPassword: forgotConfirmPass },
        { name: '', email: forgotEmail, department: '', year: '', batch: '', rollNumber: '' }
      )
      toast.success('Password reset! Sign in with your new password.')
      setShowForgotModal(false)
      setForgotStep('email'); setForgotEmail(''); setForgotOtp(['', '', '', '', '', ''])
      setForgotNewPass(''); setForgotConfirmPass('')
    } catch { toast.error('OTP invalid or expired. Please try again.'); setForgotStep('email') }
    finally { setForgotLoading(false) }
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
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col md:flex-row">
      {/* Left 40% Panel */}
      <div className="md:w-5/12 bg-[#060911] border-r border-[#1a2438] p-8 md:p-12 flex flex-col justify-between relative">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-indigo-600/20">
              <GraduationCap size={22} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Kollab
            </span>
          </div>

          <h1 className="text-page-title text-2xl md:text-3xl leading-tight mb-4">
            From Year 1 to Placement — All in One Place
          </h1>
          <p className="text-body-main text-slate-400 mb-8 leading-relaxed">
            Empower your degree journey with skill verification, peer project collaboration, proctored assessments, and placement tracking.
          </p>

          <div className="space-y-4">
            {[
              '4-Year Automated Student Progression & Badging',
              'Proctored Skill Assessments with Integrity Checks',
              'Collaborative Student Teammate Matchmaking'
            ].map((bullet, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 mt-0.5 border border-emerald-500/20">
                  <CheckCircle2 size={15} />
                </div>
                <span className="text-xs font-medium text-slate-300">{bullet}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-[#1a2438] mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <h4 className="text-section-title">CSE Dept</h4>
            <span className="text-caption-muted">Batches A, B, C</span>
          </div>
          <div>
            <h4 className="text-section-title">Year 4</h4>
            <span className="text-caption-muted">Academic Cohort</span>
          </div>
          <div>
            <h4 className="text-section-title text-emerald-400">92%</h4>
            <span className="text-caption-muted">Placement Rate</span>
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
                <div className={`p-3 rounded-xl border text-xs font-semibold text-center ${
                  lockedUntil
                    ? 'bg-rose-900/30 text-rose-300 border-rose-500/40'
                    : loginAttempts >= 2
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}>
                  {lockedUntil
                    ? <><Lock size={12} className="inline mr-1" />Account locked — {lockCountdown}s remaining</>
                    : loginError
                  }
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
                <span className="text-slate-500">Coordinator: coordinator@college.edu</span>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(true); setForgotStep('email') }}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || (!!lockedUntil && Date.now() < lockedUntil)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold text-white text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : lockedUntil ? (
                  <><Lock size={15} /> Locked ({lockCountdown}s)</>
                ) : (
                  <>Sign In to Dashboard <ArrowRight size={16} /></>
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

              {/* Quick sign-in removed */}
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
                          { value: 'Batch A', label: 'Batch A' },
                          { value: 'Batch B', label: 'Batch B' },
                          { value: 'Batch C', label: 'Batch C' }
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
                      if (!regName.trim()) {
                        toast.error('Please enter your full name')
                        return
                      }
                      if (!regEmail.trim() || !regEmail.includes('@') || !regEmail.includes('.')) {
                        toast.error('Please enter a valid college email address')
                        return
                      }
                      if (!regRoll.trim()) {
                        toast.error('Please enter your Roll Number')
                        return
                      }
                      try {
                        setIsLoading(true)
                        await authApi.registerStep1({
                          name: regName.trim(),
                          email: regEmail.trim().toLowerCase(),
                          department: regDept,
                          year: regYear,
                          batch: `${regDept} ${regBatch}`,
                          rollNumber: regRoll.trim()
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
                        if (!regPassword || regPassword.length < 6) {
                          toast.error('Password must be at least 6 characters long')
                          return
                        }
                        if (regPassword !== confirmPassword) {
                          toast.error('Passwords do not match')
                          return
                        }
                        const otpStr = otp.join('')
                        if (otpStr.length < 6) {
                          toast.error('Please enter the 6-digit OTP code')
                          return
                        }
                        
                        try {
                          setIsLoading(true)
                          const response = await authApi.verifyOtpAndRegister({
                            otp: otpStr,
                            password: regPassword,
                            confirmPassword: confirmPassword
                          }, {
                            name: regName.trim(),
                            email: regEmail.trim().toLowerCase(),
                            department: regDept,
                            year: regYear,
                            batch: `${regDept} ${regBatch}`,
                            rollNumber: regRoll.trim()
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Lock size={16} className="text-indigo-400" /> Reset Password
              </h3>
              <button onClick={() => { setShowForgotModal(false); setForgotStep('email') }} className="text-slate-400 hover:text-white text-xl leading-none">&times;</button>
            </div>

            {forgotStep === 'email' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Enter your registered college email. We'll send a 6-digit OTP.</p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="priti@college.edu"
                  className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleForgotSendOtp}
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-xs"
                >
                  {forgotLoading ? 'Sending OTP...' : 'Send Reset OTP →'}
                </button>
              </div>
            )}

            {forgotStep === 'otp' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Enter the 6-digit code sent to <span className="text-indigo-300 font-semibold">{forgotEmail}</span></p>
                <div className="flex gap-2 justify-between">
                  {forgotOtp.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`fotp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleForgotOtpChange(e.target.value, idx)}
                      className="w-10 h-11 text-center font-bold text-lg rounded-xl bg-[#0f172a] border border-[#1e293b] text-white focus:border-indigo-500 focus:outline-none"
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type={showForgotPwd ? 'text' : 'password'}
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="New Password (min 6 chars)"
                      className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-sm text-white focus:outline-none focus:border-indigo-500 pr-9"
                    />
                    <button type="button" onClick={() => setShowForgotPwd(!showForgotPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showForgotPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <input
                    type="password"
                    value={forgotConfirmPass}
                    onChange={(e) => setForgotConfirmPass(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full px-3 py-2 rounded-xl bg-[#080d18] border border-[#1e293b] text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  onClick={handleForgotReset}
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold text-xs"
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button onClick={() => setForgotStep('email')} className="w-full text-xs text-slate-400 hover:text-white text-center">
                  ← Back to email
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
