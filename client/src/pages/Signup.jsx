import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signup } from '../features/auth/authSlice'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'

export default function Signup() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading, error } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [oauthError, setOauthError] = useState(null)
  const [termsError, setTermsError] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      const errorMessages = {
        google_auth_failed: 'Google authentication failed. Please try again.',
        authentication_failed: 'Authentication failed. Please try again.',
        invalid_token: 'Invalid authentication token. Please try again.',
        no_token: 'No authentication token received. Please try again.'
      }
      setOauthError(errorMessages[errorParam] || 'An error occurred during authentication.')
    }
  }, [searchParams])

  const onSubmit = async (e) => {
    e.preventDefault()
    setOauthError(null)
    setTermsError(false)
    if (!acceptTerms) {
      setTermsError(true)
      return
    }
    const res = await dispatch(signup(form))
    if (res.meta.requestStatus === 'fulfilled') navigate('/dashboard')
  }

  // Password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z0-9]/.test(password)) strength++
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['', '#f87171', '#f97316', '#fbbf24', '#10b981']
    return { strength, label: labels[strength], color: colors[strength] }
  }

  const passwordStrength = getPasswordStrength(form.password)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0f' }}>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(6,182,212,0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(6,182,212,0.02) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Glow blobs */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(6,182,212,0.04)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(139,92,246,0.04)', filter: 'blur(80px)' }} />

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative">
        <div className="w-full max-w-md">

          {/* ── Logo + Header ── */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
                <span className="text-white font-black text-lg">L</span>
              </div>
              <span className="text-xl font-black text-white tracking-tight">LearnWeb</span>
            </Link>
            <h1 className="text-3xl font-black text-white mb-1">Create your workspace</h1>
            <p className="text-slate-500 text-sm">Start your personal distraction-free study journey</p>
          </div>

          {/* ── Card ── */}
          <div className="rounded-2xl p-7"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>

            {/* OAuth error */}
            {oauthError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm mb-5"
                style={{ backgroundColor: '#2e2a0e', border: '1px solid #7c6a1a', color: '#fbbf24' }}>
                <FiAlertCircle className="w-4 h-4 shrink-0" />
                {oauthError}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#4b5563' }} />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl outline-none placeholder-slate-600"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                    onFocus={e => e.target.style.borderColor = '#06b6d4'}
                    onBlur={e => e.target.style.borderColor = '#2e3140'}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#4b5563' }} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl outline-none placeholder-slate-600"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                    onFocus={e => e.target.style.borderColor = '#06b6d4'}
                    onBlur={e => e.target.style.borderColor = '#2e3140'}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#4b5563' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full text-slate-100 text-sm pl-10 pr-10 py-3 rounded-xl outline-none placeholder-slate-600"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                    onFocus={e => e.target.style.borderColor = '#06b6d4'}
                    onBlur={e => e.target.style.borderColor = '#2e3140'}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#4b5563' }}>
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {form.password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: i <= passwordStrength.strength
                                ? passwordStrength.color
                                : '#2a2d35'
                            }} />
                        ))}
                      </div>
                      <span className="text-xs font-mono" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <p className="text-xs font-mono" style={{ color: '#4b5563' }}>
                      Use 8+ chars with letters, numbers & symbols
                    </p>
                  </div>
                )}
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => { setAcceptTerms(e.target.checked); setTermsError(false) }}
                      className="sr-only"
                    />
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: acceptTerms ? '#06b6d4' : '#22252e',
                        border: `1px solid ${acceptTerms ? '#06b6d4' : termsError ? '#f87171' : '#2e3140'}`
                      }}
                      onClick={() => { setAcceptTerms(!acceptTerms); setTermsError(false) }}
                    >
                      {acceptTerms && (
                        <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-xs leading-relaxed" style={{ color: '#6b7280' }}>
                    I agree to the{' '}
                    <a href="#" style={{ color: '#06b6d4' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" style={{ color: '#06b6d4' }}>Privacy Policy</a>
                  </span>
                </label>
                {termsError && (
                  <p className="text-xs mt-1.5 font-mono" style={{ color: '#f87171' }}>
                    Please accept the terms to continue
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#2e1515', border: '1px solid #4a2020', color: '#f87171' }}>
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#06b6d4', color: '#000' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#22d3ee' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#06b6d4' }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : 'Create Account →'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: '#2a2d35' }} />
              <span className="text-slate-600 text-xs font-mono">or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#2a2d35' }} />
            </div>

            {/* Sign in link */}
            <p className="text-center text-sm" style={{ color: '#6b7280' }}>
              Already have an account?{' '}
              <Link to="/login"
                className="font-bold transition-colors"
                style={{ color: '#06b6d4' }}
                onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
                onMouseLeave={e => e.currentTarget.style.color = '#06b6d4'}>
                Sign in
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link to="/"
              className="text-xs font-mono transition-colors"
              style={{ color: '#4b5563' }}
              onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
              onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}>
              ← Back to home
            </Link>
          </div>

          {/* Bottom tagline */}
          <p className="text-center text-xs font-mono mt-4" style={{ color: '#2a2d35' }}>
            no ads · no distractions · just learning
          </p>
        </div>
      </div>
    </div>
  )
}