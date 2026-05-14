import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../lib/api'
import ImageUpload from '../components/ImageUpload'
import Layout from '../components/Layout'
import { FiArrowLeft, FiFolder, FiType, FiFileText, FiImage, FiAlertCircle } from 'react-icons/fi'

export default function CreateCourse() {
  const navigate = useNavigate()
  const { user, token } = useSelector((s) => s.auth)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    thumbnail: ''
  })

  // ── Only change: removed admin check, now any logged in user can create
  if (!token) {
    navigate('/login')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/courses', form)
      navigate('/courses')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create folder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: '#0d0f14' }}>
        <div className="max-w-2xl mx-auto">

          {/* ── Back ── */}
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-10 group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Back to folders
          </Link>

          {/* ── Header ── */}
          <div className="mb-8">
            <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
              your workspace
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
              Create Study Folder
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              A study folder is a dedicated space for one subject or topic. Add lectures inside after creating it.
            </p>
          </div>

          {/* ── Form Card ── */}
          <div
            className="rounded-2xl p-7 mb-6"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Folder Name */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide mb-2"
                  style={{ color: '#94a3b8' }}
                >
                  <FiType className="w-3.5 h-3.5" />
                  Folder Name *
                </label>
                <input
                  className="w-full text-slate-100 text-sm px-4 py-3 rounded-xl outline-none transition-colors placeholder-slate-600"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                  placeholder="e.g. DSA, Backend Development, Java..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#06b6d4'}
                  onBlur={e => e.target.style.borderColor = '#2e3140'}
                  required
                />
                <p className="text-slate-600 text-xs mt-1.5 font-mono">
                  Keep it short and topic-specific
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide mb-2"
                  style={{ color: '#94a3b8' }}
                >
                  <FiFileText className="w-3.5 h-3.5" />
                  Description
                </label>
                <textarea
                  className="w-full text-slate-100 text-sm px-4 py-3 rounded-xl outline-none transition-colors resize-none placeholder-slate-600"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                  rows={3}
                  placeholder="What will you study in this folder? e.g. Arrays, Trees, Graphs..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#06b6d4'}
                  onBlur={e => e.target.style.borderColor = '#2e3140'}
                />
              </div>

              {/* Thumbnail */}
              <div>
                <label
                  className="flex items-center gap-2 text-xs font-mono uppercase tracking-wide mb-2"
                  style={{ color: '#94a3b8' }}
                >
                  <FiImage className="w-3.5 h-3.5" />
                  Thumbnail
                  <span className="text-slate-700 font-normal normal-case">— optional</span>
                </label>
                <ImageUpload
                  currentImage={form.thumbnail}
                  onUploadSuccess={(url) => setForm({ ...form, thumbnail: url })}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#2e1515', border: '1px solid #4a2020', color: '#f87171' }}
                >
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Divider */}
              <div style={{ borderTop: '1px solid #2a2d35' }} />

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#06b6d4', color: '#000' }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#22d3ee' }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#06b6d4' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiFolder className="w-4 h-4" />
                      Create Folder
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/courses')}
                  className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#3a3d48' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2e3140' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* ── Tips card ── */}
          <div
            className="rounded-2xl p-5"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-4"
              style={{ color: '#06b6d4' }}>
              💡 tips for a good folder
            </p>
            <ul className="space-y-2.5">
              {[
                'Name it after one specific topic — not too broad, not too narrow',
                'One folder = one subject. DSA and Backend should be separate folders',
                'Add a thumbnail so it stands out in your workspace',
                'Write a short description so you remember what goes inside',
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ backgroundColor: '#06b6d4' }}
                  />
                  <span className="text-slate-500 text-xs leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </Layout>
  )
}