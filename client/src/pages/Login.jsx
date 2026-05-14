import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/auth/authSlice'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiX } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { api } from '../lib/api'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading, error, user } = useSelector((s) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [oauthError, setOauthError] = useState(null)

  // Forgot Password Modal States
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

  const handleGoogleLogin = () => {
    setOauthError(null)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    window.location.href = `${apiUrl}/auth/google`
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#16161d] to-[#0a0a0f] flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Coder's
              </span>
            </Link>
            <h2 className="text-4xl font-bold text-slate-100 mb-2">Welcome Back!</h2>
            <p className="text-slate-400 text-lg">Sign in to continue your learning journey</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-2xl shadow-2xl p-8">
            {oauthError && (
              <div className="mb-4 bg-yellow-900/20 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{oauthError}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-slate-500" />
                  </div>
                  <input 
                    className="w-full bg-slate-800 border border-slate-600 text-slate-100 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500" 
                    placeholder="you@example.com" 
                    type="email" 
                    value={form.email} 
                    onChange={(e)=>setForm({...form, email:e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-300">Password</label>
                  <button 
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-slate-500" />
                  </div>
                  <input 
                    className="w-full bg-slate-800 border border-slate-600 text-slate-100 pl-10 pr-12 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500" 
                    placeholder="Enter your password" 
                    type={showPassword ? "text" : "password"}
                    value={form.password} 
                    onChange={(e)=>setForm({...form, password:e.target.value})}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-600 rounded bg-slate-800"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-400">
                  Remember me for 30 days
                </label>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button 
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-4 py-3 rounded-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Don't have an account?{' '}
                <Link className="text-cyan-400 hover:text-cyan-300 font-bold transition" to="/signup">
                  Sign up now
                </Link>
              </p>
            </div>

            {user && (
              <div className="mt-4 bg-green-900/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg text-sm text-center">
                ✓ Logged in as {user.email}
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/" className="text-slate-400 hover:text-cyan-400 transition text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowForgotModal(false)
                setResetForm({ name: '', email: '', newPassword: '', confirmPassword: '' })
                setResetError('')
                setResetSuccess(false)
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <FiX className="text-2xl" />
            </button>

            <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Reset Password</h3>
            <p className="text-slate-400 mb-6">Enter your details to reset your password</p>

            {resetSuccess ? (
              <div className="bg-green-900/20 border border-green-500/50 text-green-400 px-4 py-6 rounded-lg text-center">
                <svg className="w-16 h-16 mx-auto mb-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="font-bold text-lg">Password Reset Successful!</p>
                <p className="text-sm mt-1 text-green-400/80">You can now login with your new password</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="text-slate-500" />
                    </div>
                    <input 
                      className="w-full bg-slate-800 border border-slate-600 text-slate-100 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500" 
                      placeholder="Your full name" 
                      type="text" 
                      value={resetForm.name} 
                      onChange={(e)=>setResetForm({...resetForm, name:e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="text-slate-500" />
                    </div>
                    <input 
                      className="w-full bg-slate-800 border border-slate-600 text-slate-100 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500" 
                      placeholder="you@example.com" 
                      type="email" 
                      value={resetForm.email} 
                      onChange={(e)=>setResetForm({...resetForm, email:e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-slate-500" />
                    </div>
                    <input 
                      className="w-full bg-slate-800 border border-slate-600 text-slate-100 pl-10 pr-12 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500" 
                      placeholder="New password" 
                      type={showNewPassword ? "text" : "password"}
                      value={resetForm.newPassword} 
                      onChange={(e)=>setResetForm({...resetForm, newPassword:e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showNewPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="text-slate-500" />
                    </div>
                    <input 
                      className="w-full bg-slate-800 border border-slate-600 text-slate-100 pl-10 pr-12 py-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-slate-500" 
                      placeholder="Confirm password" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={resetForm.confirmPassword} 
                      onChange={(e)=>setResetForm({...resetForm, confirmPassword:e.target.value})}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {resetError && (
                  <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                    <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{resetError}</span>
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-3 rounded-lg font-bold hover:shadow-2xl hover:shadow-cyan-500/50 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Resetting...
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-400 py-8 mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© {new Date().getFullYear()} Coder's. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}