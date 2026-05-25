import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/auth/authSlice'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiAlertCircle, FiCheck, FiX } from 'react-icons/fi'
import { api } from '../lib/api'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading, error, user } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [oauthError, setOauthError] = useState(null)

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [resetForm, setResetForm] = useState({ name: '', email: '', newPassword: '', confirmPassword: '' })
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

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
    const res = await dispatch(login(form))
    if (res.meta.requestStatus === 'fulfilled') navigate('/dashboard')
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setResetError('')
    setResetLoading(true)
    if (resetForm.newPassword.length < 6) {
      setResetError('Password must be at least 6 characters')
      setResetLoading(false)
      return
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Passwords do not match')
      setResetLoading(false)
      return
    }
    try {
      const verifyRes = await api.post('/auth/verify-reset', {
        name: resetForm.name,
        email: resetForm.email
      })
      await api.post('/auth/reset-password', {
        userId: verifyRes.data.userId,
        newPassword: resetForm.newPassword
      })
      setResetSuccess(true)
      setTimeout(() => {
        setShowForgotModal(false)
        setResetSuccess(false)
        setResetForm({ name: '', email: '', newPassword: '', confirmPassword: '' })
      }, 2000)
    } catch (err) {
      setResetError(err.response?.data?.error || 'Password reset failed')
    } finally {
      setResetLoading(false)
    }
  }

  const closeForgotModal = () => {
    setShowForgotModal(false)
    setResetForm({ name: '', email: '', newPassword: '', confirmPassword: '' })
    setResetError('')
    setResetSuccess(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0f' }}>

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(6,182,212,0.02) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(6,182,212,0.02) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Glow blobs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ backgroundColor: 'rgba(6,182,212,0.04)', filter: 'blur(80px)' }} />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
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
            <h1 className="text-3xl font-black text-white mb-1">Welcome back</h1>
            <p className="text-slate-500 text-sm">Sign in to your study workspace</p>
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

              {/* Email */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#4b5563' }} />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full text-slate-100 text-sm pl-10 pr-4 py-3 rounded-xl outline-none transition-colors placeholder-slate-600"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                    onFocus={e => e.target.style.borderColor = '#06b6d4'}
                    onBlur={e => e.target.style.borderColor = '#2e3140'}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-mono uppercase tracking-wide"
                    style={{ color: '#94a3b8' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-medium transition-colors"
                    style={{ color: '#06b6d4' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
                    onMouseLeave={e => e.currentTarget.style.color = '#06b6d4'}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: '#4b5563' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full text-slate-100 text-sm pl-10 pr-10 py-3 rounded-xl outline-none transition-colors placeholder-slate-600"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                    onFocus={e => e.target.style.borderColor = '#06b6d4'}
                    onBlur={e => e.target.style.borderColor = '#2e3140'}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: '#4b5563' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
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
                    Signing in...
                  </>
                ) : 'Sign In →'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ backgroundColor: '#2a2d35' }} />
              <span className="text-slate-600 text-xs font-mono">or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#2a2d35' }} />
            </div>

            {/* Sign up link */}
            <p className="text-center text-sm" style={{ color: '#6b7280' }}>
              Don't have an account?{' '}
              <Link to="/signup"
                className="font-bold transition-colors"
                style={{ color: '#06b6d4' }}
                onMouseEnter={e => e.currentTarget.style.color = '#22d3ee'}
                onMouseLeave={e => e.currentTarget.style.color = '#06b6d4'}>
                Create one free
              </Link>
            </p>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link to="/" className="text-xs font-mono transition-colors"
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

      {/* ── Forgot Password Modal ── */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-2xl p-7 relative"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>

            {/* Close */}
            <button
              onClick={closeForgotModal}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280' }}
            >
              <FiX className="w-4 h-4" />
            </button>

            <div className="mb-6">
              <h3 className="text-white font-black text-xl mb-1">Reset Password</h3>
              <p className="text-slate-500 text-sm">Enter your details to reset your password</p>
            </div>

            {resetSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                  <FiCheck className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="text-emerald-400 font-bold mb-1">Password Reset Successful!</p>
                <p className="text-slate-500 text-xs">You can now login with your new password</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">

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
                      value={resetForm.name}
                      onChange={(e) => setResetForm({ ...resetForm, name: e.target.value })}
                      className="w-full text-slate-100 text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none placeholder-slate-600"
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
                    style={{ color: '#94a3b8' }}>Email</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: '#4b5563' }} />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={resetForm.email}
                      onChange={(e) => setResetForm({ ...resetForm, email: e.target.value })}
                      className="w-full text-slate-100 text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none placeholder-slate-600"
                      style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                      onFocus={e => e.target.style.borderColor = '#06b6d4'}
                      onBlur={e => e.target.style.borderColor = '#2e3140'}
                      required
                    />
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                    style={{ color: '#94a3b8' }}>New Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: '#4b5563' }} />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="New password"
                      value={resetForm.newPassword}
                      onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                      className="w-full text-slate-100 text-sm pl-10 pr-10 py-2.5 rounded-xl outline-none placeholder-slate-600"
                      style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                      onFocus={e => e.target.style.borderColor = '#06b6d4'}
                      onBlur={e => e.target.style.borderColor = '#2e3140'}
                      required
                    />
                    <button type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#4b5563' }}>
                      {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                    style={{ color: '#94a3b8' }}>Confirm Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: '#4b5563' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm password"
                      value={resetForm.confirmPassword}
                      onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                      className="w-full text-slate-100 text-sm pl-10 pr-10 py-2.5 rounded-xl outline-none placeholder-slate-600"
                      style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                      onFocus={e => e.target.style.borderColor = '#06b6d4'}
                      onBlur={e => e.target.style.borderColor = '#2e3140'}
                      required
                    />
                    <button type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: '#4b5563' }}>
                      {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {resetError && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: '#2e1515', border: '1px solid #4a2020', color: '#f87171' }}>
                    <FiAlertCircle className="w-4 h-4 shrink-0" />
                    {resetError}
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                    style={{ backgroundColor: '#06b6d4', color: '#000' }}
                    onMouseEnter={e => { if (!resetLoading) e.currentTarget.style.backgroundColor = '#22d3ee' }}
                    onMouseLeave={e => { if (!resetLoading) e.currentTarget.style.backgroundColor = '#06b6d4' }}
                  >
                    {resetLoading ? (
                      <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Resetting...</>
                    ) : 'Reset Password'}
                  </button>
                  <button
                    type="button"
                    onClick={closeForgotModal}
                    className="px-5 py-2.5 rounded-xl font-medium text-sm"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}