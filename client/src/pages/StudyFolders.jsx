import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCourses, updateCourse, deleteCourse } from '../features/folder/folderSlice'
import { Link } from 'react-router-dom'
import ImageUpload from '../components/ImageUpload'
import { FiEdit2, FiTrash2, FiPlus, FiChevronRight, FiPlay } from 'react-icons/fi'

export default function CoursesList() {
  const dispatch = useDispatch()
  const { items, loading, error } = useSelector((s) => s.courses)
  const { token, user } = useSelector((s) => s.auth)
  const [editingCourse, setEditingCourse] = useState(null)
  const [courseForm, setCourseForm] = useState({ title: '', description: '', thumbnail: '' })

  useEffect(() => {
    dispatch(fetchCourses())
  }, [dispatch])

  const handleEditCourse = (course) => {
    setCourseForm({
      title: course.title,
      description: course.description || '',
      thumbnail: course.thumbnail || ''
    })
    setEditingCourse(course)
  }

  const handleUpdateCourse = async (e) => {
    e.preventDefault()
    try {
      await dispatch(updateCourse({ id: editingCourse._id, data: courseForm }))
      setEditingCourse(null)
      setCourseForm({ title: '', description: '', thumbnail: '' })
    } catch (error) {
      alert('Failed to update folder')
    }
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Delete this study folder? All lectures and data will be lost.')) {
      try {
        await dispatch(deleteCourse(courseId))
      } catch (error) {
        alert('Failed to delete folder')
      }
    }
  }

  const folderThemes = [
    {
      gradient: 'from-cyan-400 to-blue-500',
      bg: 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20',
      border: 'border-cyan-500/40',
      hoverBorder: 'hover:border-cyan-400/70',
      glow: 'hover:shadow-cyan-500/30',
      btnBg: 'bg-cyan-500 hover:bg-cyan-400',
      tag: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      emoji: '💻',
    },
    {
      gradient: 'from-violet-400 to-purple-600',
      bg: 'bg-gradient-to-br from-violet-500/20 to-purple-600/20',
      border: 'border-violet-500/40',
      hoverBorder: 'hover:border-violet-400/70',
      glow: 'hover:shadow-violet-500/30',
      btnBg: 'bg-violet-500 hover:bg-violet-400',
      tag: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      emoji: '🧠',
    },
    {
      gradient: 'from-emerald-400 to-teal-500',
      bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20',
      border: 'border-emerald-500/40',
      hoverBorder: 'hover:border-emerald-400/70',
      glow: 'hover:shadow-emerald-500/30',
      btnBg: 'bg-emerald-500 hover:bg-emerald-400',
      tag: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      emoji: '🌿',
    },
    {
      gradient: 'from-orange-400 to-pink-500',
      bg: 'bg-gradient-to-br from-orange-500/20 to-pink-600/20',
      border: 'border-orange-500/40',
      hoverBorder: 'hover:border-orange-400/70',
      glow: 'hover:shadow-orange-500/30',
      btnBg: 'bg-orange-500 hover:bg-orange-400',
      tag: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      emoji: '🔥',
    },
    {
      gradient: 'from-pink-400 to-rose-500',
      bg: 'bg-gradient-to-br from-pink-500/20 to-rose-600/20',
      border: 'border-pink-500/40',
      hoverBorder: 'hover:border-pink-400/70',
      glow: 'hover:shadow-pink-500/30',
      btnBg: 'bg-pink-500 hover:bg-pink-400',
      tag: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      emoji: '⚡',
    },
    {
      gradient: 'from-amber-400 to-yellow-500',
      bg: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/20',
      border: 'border-amber-500/40',
      hoverBorder: 'hover:border-amber-400/70',
      glow: 'hover:shadow-amber-500/30',
      btnBg: 'bg-amber-500 hover:bg-amber-400',
      tag: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      emoji: '🚀',
    },
  ]

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* ── Header ── */}
        <div className="mb-12">
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">
            your study workspace
          </p>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-100 leading-tight">
                Study Folders
              </h1>
              <p className="text-slate-500 text-base mt-2 max-w-lg">
                Pick a folder and dive straight in. Each one is your dedicated space for a subject.
              </p>
            </div>

            {/* ── New Folder button — visible to all logged in users ── */}
            {token && (
              <Link
                to="/courses/create"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-black font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105"
                style={{ backgroundColor: '#06b6d4' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#22d3ee'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#06b6d4'}
              >
                <FiPlus className="w-4 h-4" />
                New Folder
              </Link>
            )}

            {!token && (
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/30"
              >
                Get Started →
              </Link>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-slate-600 text-sm font-mono">loading folders...</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="max-w-lg mx-auto bg-red-500/5 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* ── Empty State ── */}
        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 text-5xl">
              📂
            </div>
            <h3 className="text-slate-200 font-black text-2xl mb-2">No folders yet</h3>
            <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">
              Create your first study folder and start organizing your learning journey.
            </p>
            {token && (
              <Link
                to="/courses/create"
                className="inline-flex items-center gap-2 px-6 py-3 text-black font-bold text-sm rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: '#06b6d4' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#22d3ee'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#06b6d4'}
              >
                <FiPlus className="w-4 h-4" />
                Create First Folder
              </Link>
            )}
          </div>
        )}

        {/* ── Folders Grid ── */}
        {!loading && items.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-8">
              <span className="text-slate-600 text-xs font-mono">
                {items.length} folder{items.length !== 1 ? 's' : ''}
              </span>
              <div className="flex-1 h-px bg-slate-800/80" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((c, index) => {
                const theme = folderThemes[index % folderThemes.length]
                return (
                  <div
                    key={c._id}
                    className={`group relative rounded-2xl border ${theme.border} ${theme.hoverBorder} ${theme.bg} transition-all duration-300 hover:shadow-2xl ${theme.glow} hover:scale-[1.02] overflow-hidden`}
                  >
                    {/* Top gradient bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${theme.gradient}`} />

                    {/* Thumbnail or emoji hero */}
                    <div className="relative h-40 overflow-hidden">
                      {c.thumbnail ? (
                        <>
                          <img
                            src={c.thumbnail}
                            alt={c.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center relative">
                          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-10`} />
                          <div className="absolute top-2 right-4 text-6xl opacity-10 select-none rotate-12">
                            {theme.emoji}
                          </div>
                          <div className="absolute bottom-2 left-4 text-4xl opacity-10 select-none -rotate-6">
                            {theme.emoji}
                          </div>
                          <span className="text-6xl relative z-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                            {theme.emoji}
                          </span>
                        </div>
                      )}

                      {/* ── Edit/Delete — visible to ALL logged in users on hover ── */}
                      {token && (
                        <div className="absolute top-3 left-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                          <button
                            onClick={(e) => { e.preventDefault(); handleEditCourse(c) }}
                            className="w-7 h-7 bg-black/70 hover:bg-black/90 border border-slate-600 text-slate-300 hover:text-cyan-400 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); handleDeleteCourse(c._id) }}
                            className="w-7 h-7 bg-black/70 hover:bg-black/90 border border-slate-600 text-slate-300 hover:text-red-400 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
                            title="Delete"
                          >
                            <FiTrash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-5">
                      <div className="mb-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${theme.tag}`}>
                          {theme.emoji} Study Folder
                        </span>
                      </div>

                      <h3 className="text-white font-black text-xl leading-snug mb-2">
                        {c.title}
                      </h3>

                      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-5">
                        {c.description || 'Your personal study space for this subject. Open and start learning.'}
                      </p>

                      <Link
                        to={`/courses/${c._id}`}
                        className={`flex items-center justify-between w-full px-4 py-3 ${theme.btnBg} text-black font-bold text-sm rounded-xl transition-all duration-200 hover:shadow-lg group/btn`}
                      >
                        <div className="flex items-center gap-2">
                          <FiPlay className="w-3.5 h-3.5 fill-black" />
                          <span>Open & Start Learning</span>
                        </div>
                        <FiChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-slate-100 font-bold text-xl">Edit Folder</h2>
                <p className="text-slate-500 text-xs mt-0.5">Update your study folder details</p>
              </div>
              <button
                onClick={() => { setEditingCourse(null); setCourseForm({ title: '', description: '', thumbnail: '' }) }}
                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 rounded-lg flex items-center justify-center transition-all text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Folder Name *</label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500/50 text-slate-100 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. DSA, Backend, Java..."
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Description</label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 focus:border-cyan-500/50 text-slate-100 px-4 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none"
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="What will you study in this folder?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Thumbnail</label>
                <ImageUpload
                  currentImage={courseForm.thumbnail}
                  onUploadSuccess={(url) => setCourseForm({ ...courseForm, thumbnail: url })}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 rounded-xl text-sm transition-all duration-200"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingCourse(null); setCourseForm({ title: '', description: '', thumbnail: '' }) }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl text-sm transition-all border border-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}