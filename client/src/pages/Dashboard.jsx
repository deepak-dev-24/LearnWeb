import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { fetchCourses } from '../features/folder/folderSlice'
import { fetchFeed } from '../features/feed/feedSlice'
import { fetchHistory } from '../features/plan/planSlice'
import {
  FiFolder, FiPlay, FiUser, FiPlus,
  FiGrid, FiVideo, FiCheck
} from 'react-icons/fi'

export default function Dashboard() {
  const { user, token } = useSelector((s) => s.auth)
  const { items: courses, loading } = useSelector((s) => s.courses)
  const { items: feedItems } = useSelector((s) => s.feed)
  const { history } = useSelector((s) => s.plan)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (token && user) {
      dispatch(fetchCourses())
      dispatch(fetchFeed())
      dispatch(fetchHistory())
    }
  }, [dispatch, token, user])

  if (!token || !user) {
    navigate('/login')
    return null
  }

  // ── Real stats ──
  const totalFolders = courses.length
  const totalLectures = feedItems?.length || 0
  const thisWeekDone = (() => {
    if (!history || history.length === 0) return 0
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    return history
      .filter(day => new Date(day.date) >= oneWeekAgo)
      .reduce((acc, day) => acc + (day.completedCount || 0), 0)
  })()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Welcome ── */}
        <div className="mb-10">
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-2">
            your dashboard
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-1">
            Welcome back, {user.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm">
            Here's an overview of your personal study workspace.
          </p>
        </div>

        {/* ── Stats Row — all real data ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: <FiFolder className="w-5 h-5 text-cyan-400" />,
              bg: 'rgba(6,182,212,0.1)',
              value: totalFolders,
              label: 'Study Folders',
              sub: totalFolders === 0 ? 'Create your first folder' : `${totalFolders} folder${totalFolders !== 1 ? 's' : ''} created`,
            },
            {
              icon: <FiVideo className="w-5 h-5 text-violet-400" />,
              bg: 'rgba(139,92,246,0.1)',
              value: totalLectures,
              label: 'Total Lectures',
              sub: totalLectures === 0 ? 'No lectures yet' : `Across all your folders`,
            },
            {
              icon: <FiCheck className="w-5 h-5 text-emerald-400" />,
              bg: 'rgba(16,185,129,0.1)',
              value: thisWeekDone,
              label: 'Tasks Done This Week',
              sub: thisWeekDone === 0 ? 'No tasks completed yet' : `${thisWeekDone} task${thisWeekDone !== 1 ? 's' : ''} completed`,
            },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: stat.bg }}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-slate-300 text-sm font-semibold">{stat.label}</p>
                <p className="text-slate-600 text-xs mt-0.5">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div className="mb-10">
          <p className="text-slate-400 text-xs font-mono uppercase tracking-widest mb-4">
            quick actions
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                to: '/courses/create',
                icon: <FiPlus className="w-6 h-6" />,
                label: 'New Folder',
                desc: 'Create a study space',
                color: '#06b6d4',
                colorBg: 'rgba(6,182,212,0.1)',
              },
              {
                to: '/courses',
                icon: <FiGrid className="w-6 h-6" />,
                label: 'My Folders',
                desc: 'Browse your folders',
                color: '#8b5cf6',
                colorBg: 'rgba(139,92,246,0.1)',
              },
              {
                to: '/feed',
                icon: <FiPlay className="w-6 h-6" />,
                label: 'Study Feed',
                desc: 'Browse all lectures',
                color: '#10b981',
                colorBg: 'rgba(16,185,129,0.1)',
              },
              {
                to: '/profile',
                icon: <FiUser className="w-6 h-6" />,
                label: 'Profile',
                desc: 'Manage your account',
                color: '#f59e0b',
                colorBg: 'rgba(245,158,11,0.1)',
              },
            ].map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className="group rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = action.color + '60'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2d35'}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: action.colorBg, color: action.color }}>
                  {action.icon}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{action.label}</p>
                  <p className="text-slate-600 text-xs mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── My Study Folders ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-slate-400 text-xs font-mono uppercase tracking-widest">
              my study folders
            </p>
            <Link
              to="/courses/create"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ backgroundColor: '#06b6d4', color: '#000' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#22d3ee'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#06b6d4'}
            >
              <FiPlus className="w-3.5 h-3.5" />
              New Folder
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Empty */}
          {!loading && courses.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl text-center"
              style={{ backgroundColor: '#1a1d24', border: '1px dashed #2a2d35' }}>
              <div className="text-5xl mb-4">📂</div>
              <p className="text-slate-300 font-bold mb-1">No folders yet</p>
              <p className="text-slate-600 text-sm mb-6 max-w-xs">
                Create your first study folder and start organizing your learning.
              </p>
              <Link
                to="/courses/create"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                style={{ backgroundColor: '#06b6d4', color: '#000' }}
              >
                <FiPlus className="w-4 h-4" />
                Create First Folder
              </Link>
            </div>
          )}

          {/* Folders grid */}
          {!loading && courses.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course, index) => {
                const colors = [
                  { accent: '#06b6d4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.25)' },
                  { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)' },
                  { accent: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)' },
                  { accent: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.25)' },
                  { accent: '#ec4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.25)' },
                  { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
                ]
                const c = colors[index % colors.length]

                return (
                  <Link
                    key={course._id}
                    to={`/courses/${course._id}`}
                    className="group rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02]"
                    style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 20px ${c.accent}20`}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}>
                        📂
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: c.bg, color: c.accent, border: `1px solid ${c.border}` }}>
                        Study Folder
                      </span>
                    </div>

                    <h3 className="text-white font-black text-base leading-snug mb-1 line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 mb-4">
                      {course.description || 'Your personal study space for this subject.'}
                    </p>

                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop: `1px solid ${c.border}` }}>
                      <span className="text-xs font-mono" style={{ color: c.accent }}>
                        Open →
                      </span>
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center group-hover:translate-x-0.5 transition-transform"
                        style={{ backgroundColor: c.bg }}>
                        <FiPlay className="w-3 h-3" style={{ color: c.accent }} />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}