import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { fetchCourse } from '../features/folder/folderSlice'
import { fetchLectures, markLectureComplete } from '../features/lectures/lectureSlice'
import { FiArrowLeft, FiPlay, FiCheck, FiSettings, FiBookOpen, FiTarget, FiGrid, FiList } from 'react-icons/fi'

// Extract YouTube thumbnail
const getYouTubeThumbnail = (url) => {
  if (!url) return null
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = match && match[7].length === 11 ? match[7] : null
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export default function CourseDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { current, loading: courseLoading } = useSelector((s) => s.courses)
  const { byCourseId, loading: lecturesLoading } = useSelector((s) => s.lectures)
  const { user } = useSelector((s) => s.auth)

  const lectures = byCourseId[id] || []
  const isStudent = user?.role === 'student'

  const [todayInput, setTodayInput] = useState('')
  const [nextGoal, setNextGoal] = useState('')
  const [savedToday, setSavedToday] = useState('')
  const [savedGoal, setSavedGoal] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    dispatch(fetchCourse(id))
    dispatch(fetchLectures(id))
    const t = localStorage.getItem(`today_${id}`) || ''
    const g = localStorage.getItem(`goal_${id}`) || ''
    const v = localStorage.getItem(`view_${id}`) || 'grid'
    setSavedToday(t)
    setSavedGoal(g)
    setTodayInput(t)
    setNextGoal(g)
    setViewMode(v)
  }, [dispatch, id])

  const totalLectures = lectures.length
  const completedLectures = lectures.filter((l) =>
    l.completedBy?.some(
      (uid) => uid === user?.id || uid?._id === user?.id || uid?.toString() === user?.id
    )
  ).length
  const progressPercent = totalLectures > 0
    ? Math.round((completedLectures / totalLectures) * 100)
    : 0

  const handleMarkComplete = (lectureId) => {
    dispatch(markLectureComplete({ courseId: id, lectureId }))
  }

  const handleSaveInputs = () => {
    localStorage.setItem(`today_${id}`, todayInput)
    localStorage.setItem(`goal_${id}`, nextGoal)
    setSavedToday(todayInput)
    setSavedGoal(nextGoal)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const handleViewChange = (mode) => {
    setViewMode(mode)
    localStorage.setItem(`view_${id}`, mode)
  }

  const isLectureCompleted = (lecture) =>
    lecture.completedBy?.some(
      (uid) => uid === user?.id || uid?._id === user?.id || uid?.toString() === user?.id
    )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#111318' }}>

      {/* ── Loading ── */}
      {courseLoading && (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <div className="w-10 h-10 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-mono">opening folder...</p>
        </div>
      )}

      {current && !courseLoading && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* ── Back ── */}
          <Link
            to="/courses"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8 group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to folders
          </Link>

          {/* ── Header + Progress ── */}
          <div className="grid lg:grid-cols-3 gap-5 mb-8">

            {/* Folder identity */}
            <div className="lg:col-span-2 rounded-2xl p-6 flex flex-col justify-between"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">
                    📂 study folder
                  </span>
                  {isStudent && (
                    <Link
                      to={`/courses/${id}/manage`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-slate-300 text-xs font-medium rounded-lg transition-all"
                      style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                    >
                      <FiSettings className="w-3 h-3" />
                      Manage
                    </Link>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                  {current.title}
                </h1>
                {current.description && (
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {current.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 mt-5 pt-5"
                style={{ borderTop: '1px solid #2a2d35' }}>
                <div className="flex items-center gap-2">
                  <FiBookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400 text-xs">
                    <span className="text-white font-bold">{totalLectures}</span> lectures
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-slate-400 text-xs">
                    <span className="text-white font-bold">{completedLectures}</span> done
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiTarget className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400 text-xs">
                    <span className="text-white font-bold">{totalLectures - completedLectures}</span> remaining
                  </span>
                </div>
              </div>
            </div>

            {/* Progress ring */}
            <div className="rounded-2xl p-6 flex flex-col items-center justify-center"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <div className="relative w-28 h-28 mb-4">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#2a2d35" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42"
                    fill="none"
                    stroke={progressPercent === 100 ? '#10b981' : progressPercent >= 50 ? '#3b82f6' : '#06b6d4'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPercent / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-black leading-none ${
                    progressPercent === 100 ? 'text-emerald-400' :
                    progressPercent >= 50 ? 'text-blue-400' : 'text-cyan-400'
                  }`}>
                    {progressPercent}%
                  </span>
                  <span className="text-slate-500 text-xs mt-0.5">done</span>
                </div>
              </div>
              <p className="text-white font-bold text-sm text-center mb-1">
                {progressPercent === 100 ? '🎉 All done!' : progressPercent === 0 ? 'Not started yet' : 'Keep going!'}
              </p>
              <p className="text-slate-500 text-xs text-center">
                {completedLectures} of {totalLectures} lectures
              </p>
            </div>
          </div>

          {/* ── Daily Inputs ── */}
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div className="rounded-2xl p-5"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <p className="text-xs font-mono uppercase tracking-wide mb-3"
                style={{ color: '#10b981' }}>
                ✅ What did you complete today?
              </p>
              <textarea
                className="w-full text-slate-200 text-sm px-3 py-2.5 rounded-xl outline-none resize-none placeholder-slate-600"
                style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                rows={3}
                placeholder="e.g. Completed arrays and linked lists..."
                value={todayInput}
                onChange={(e) => setTodayInput(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                onBlur={(e) => e.target.style.borderColor = '#2e3140'}
              />
            </div>
            <div className="rounded-2xl p-5"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <p className="text-xs font-mono uppercase tracking-wide mb-3"
                style={{ color: '#f59e0b' }}>
                🎯 What do you want to complete next?
              </p>
              <textarea
                className="w-full text-slate-200 text-sm px-3 py-2.5 rounded-xl outline-none resize-none placeholder-slate-600"
                style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                rows={3}
                placeholder="e.g. Binary trees and recursion..."
                value={nextGoal}
                onChange={(e) => setNextGoal(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = '#2e3140'}
              />
            </div>
          </div>

          <div className="flex justify-end mb-10">
            <button
              onClick={handleSaveInputs}
              className="px-5 py-2 font-bold text-sm rounded-xl transition-all duration-200"
              style={{ backgroundColor: justSaved ? '#10b981' : '#06b6d4', color: '#000' }}
            >
              {justSaved ? '✓ Saved!' : 'Save Notes'}
            </button>
          </div>

          {/* ── Lectures Header + View Toggle ── */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">
                Lectures
              </p>
              <div className="h-px w-16" style={{ backgroundColor: '#2a2d35' }} />
              <span className="text-slate-500 text-xs font-mono">
                {completedLectures}/{totalLectures} done
              </span>
            </div>

            {/* ── View Toggle ── */}
            <div className="flex items-center rounded-xl overflow-hidden"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <button
                onClick={() => handleViewChange('grid')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: viewMode === 'grid' ? '#06b6d4' : 'transparent',
                  color: viewMode === 'grid' ? '#000' : '#6b7280',
                }}
              >
                <FiGrid className="w-3.5 h-3.5" />
                Grid
              </button>
              <button
                onClick={() => handleViewChange('list')}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: viewMode === 'list' ? '#06b6d4' : 'transparent',
                  color: viewMode === 'list' ? '#000' : '#6b7280',
                }}
              >
                <FiList className="w-3.5 h-3.5" />
                List
              </button>
            </div>
          </div>

          {/* ── Loading ── */}
          {lecturesLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
            </div>
          )}

          {/* ── Empty ── */}
          {!lecturesLoading && lectures.length === 0 && (
            <div className="text-center py-16 rounded-2xl"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <p className="text-4xl mb-3">📂</p>
              <p className="text-slate-300 font-bold mb-1">No lectures yet</p>
              <p className="text-slate-500 text-sm mb-5">
                {isStudent ? 'Add lectures from the manage page.' : 'Lectures will appear here once added.'}
              </p>
              {isStudent && (
                <Link
                  to={`/courses/${id}/manage`}
                  className="inline-flex items-center gap-2 px-4 py-2 text-slate-300 text-sm font-medium rounded-xl transition-all"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                >
                  <FiSettings className="w-3.5 h-3.5" />
                  Manage Folder
                </Link>
              )}
            </div>
          )}

          {/* ── GRID VIEW ── */}
          {!lecturesLoading && lectures.length > 0 && viewMode === 'grid' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lectures.map((lecture, idx) => {
                const done = isLectureCompleted(lecture)
                const thumbnail = getYouTubeThumbnail(lecture.videoUrl)

                return (
                  <div
                    key={lecture._id}
                    className="group rounded-2xl overflow-hidden transition-all duration-200 flex flex-col"
                    style={{
                      backgroundColor: done ? '#141a18' : '#1a1d24',
                      border: done ? '1px solid #1a3a2e' : '1px solid #2a2d35',
                    }}
                    onMouseEnter={(e) => {
                      if (!done) e.currentTarget.style.borderColor = '#3a3d48'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = done ? '#1a3a2e' : '#2a2d35'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={lecture.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          style={{ opacity: done ? 0.4 : 0.9, filter: done ? 'grayscale(40%)' : 'none' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: '#22252e' }}>
                          <span className="text-4xl opacity-20">🎬</span>
                        </div>
                      )}

                      {/* Hover play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                        <Link
                          to={`/courses/${id}/lectures/${lecture._id}`}
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 hover:scale-110"
                          style={{ backgroundColor: '#06b6d4' }}
                        >
                          <FiPlay className="w-5 h-5 fill-black text-black ml-0.5" />
                        </Link>
                      </div>

                      {/* Done badge */}
                      {done && (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                          <div className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#10b981' }}>
                            <FiCheck className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}

                      {/* Number badge */}
                      <div className="absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#94a3b8' }}>
                        {idx + 1}
                      </div>

                      {/* Completed tag */}
                      {done && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-xs font-bold"
                          style={{ backgroundColor: '#0d2e20', color: '#10b981', border: '1px solid #1a4a30' }}>
                          ✓ Done
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3
                        className="font-bold text-sm leading-snug mb-1 line-clamp-2"
                        style={{
                          color: done ? '#4b5563' : '#f1f5f9',
                          textDecoration: done ? 'line-through' : 'none',
                        }}
                      >
                        {lecture.title}
                      </h3>
                      {lecture.description && (
                        <p className="text-xs leading-relaxed line-clamp-2 mb-3"
                          style={{ color: '#4b5563' }}>
                          {lecture.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-auto pt-3"
                        style={{ borderTop: '1px solid #2a2d35' }}>
                        <Link
                          to={`/courses/${id}/lectures/${lecture._id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 font-bold text-xs rounded-lg transition-all duration-200"
                          style={{ backgroundColor: '#06b6d4', color: '#000' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22d3ee'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#06b6d4'}
                        >
                          <FiPlay className="w-3 h-3 fill-black" />
                          {done ? 'Rewatch' : 'Watch'}
                        </Link>

                        <button
                          onClick={() => handleMarkComplete(lecture._id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                          style={done ? {
                            backgroundColor: '#0d2e20',
                            color: '#10b981',
                            border: '1px solid #1a4a30',
                          } : {
                            backgroundColor: '#22252e',
                            color: '#6b7280',
                            border: '1px solid #2e3140',
                          }}
                          title={done ? 'Mark incomplete' : 'Mark complete'}
                          onMouseEnter={(e) => {
                            if (done) {
                              e.currentTarget.style.backgroundColor = '#2e1515'
                              e.currentTarget.style.color = '#f87171'
                            } else {
                              e.currentTarget.style.backgroundColor = '#0d2e20'
                              e.currentTarget.style.color = '#10b981'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (done) {
                              e.currentTarget.style.backgroundColor = '#0d2e20'
                              e.currentTarget.style.color = '#10b981'
                            } else {
                              e.currentTarget.style.backgroundColor = '#22252e'
                              e.currentTarget.style.color = '#6b7280'
                            }
                          }}
                        >
                          <FiCheck className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {!lecturesLoading && lectures.length > 0 && viewMode === 'list' && (
            <div className="space-y-3">
              {lectures.map((lecture, idx) => {
                const done = isLectureCompleted(lecture)
                const thumbnail = getYouTubeThumbnail(lecture.videoUrl)

                return (
                  <div
                    key={lecture._id}
                    className="group flex gap-0 rounded-2xl overflow-hidden transition-all duration-200"
                    style={{
                      backgroundColor: done ? '#141a18' : '#1a1d24',
                      border: done ? '1px solid #1a3a2e' : '1px solid #2a2d35',
                    }}
                    onMouseEnter={(e) => {
                      if (!done) e.currentTarget.style.borderColor = '#3a3d48'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = done ? '#1a3a2e' : '#2a2d35'
                    }}
                  >
                    {/* Thumbnail */}
                    <div className="relative shrink-0 w-40 md:w-52" style={{ minHeight: '100px' }}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={lecture.title}
                          className="w-full h-full object-cover"
                          style={{
                            opacity: done ? 0.4 : 0.85,
                            filter: done ? 'grayscale(40%)' : 'none',
                            minHeight: '100px',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: '#22252e', minHeight: '100px' }}>
                          <span className="text-3xl opacity-20">🎬</span>
                        </div>
                      )}

                      {/* Hover play */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#06b6d4' }}>
                          <FiPlay className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
                        </div>
                      </div>

                      {done && (
                        <div className="absolute inset-0 flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: '#10b981' }}>
                            <FiCheck className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: '#94a3b8' }}>
                        {idx + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="mb-1.5">
                          {done ? (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                              style={{ backgroundColor: '#0d2e20', color: '#10b981', border: '1px solid #1a4a30' }}>
                              ✓ Completed
                            </span>
                          ) : (
                            <span className="text-xs font-mono" style={{ color: '#4b5563' }}>
                              Lecture {idx + 1}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm leading-snug mb-1"
                          style={{
                            color: done ? '#4b5563' : '#f1f5f9',
                            textDecoration: done ? 'line-through' : 'none',
                          }}>
                          {lecture.title}
                        </h3>
                        {lecture.description && (
                          <p className="text-xs line-clamp-2" style={{ color: '#4b5563' }}>
                            {lecture.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Link
                          to={`/courses/${id}/lectures/${lecture._id}`}
                          className="flex items-center gap-1.5 px-4 py-1.5 font-bold text-xs rounded-lg transition-all"
                          style={{ backgroundColor: '#06b6d4', color: '#000' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22d3ee'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#06b6d4'}
                        >
                          <FiPlay className="w-3 h-3 fill-black" />
                          {done ? 'Rewatch' : 'Watch'}
                        </Link>

                        <button
                          onClick={() => handleMarkComplete(lecture._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                          style={done ? {
                            backgroundColor: '#0d2e20',
                            color: '#10b981',
                            border: '1px solid #1a4a30',
                          } : {
                            backgroundColor: '#22252e',
                            color: '#6b7280',
                            border: '1px solid #2e3140',
                          }}
                          onMouseEnter={(e) => {
                            if (done) {
                              e.currentTarget.style.backgroundColor = '#2e1515'
                              e.currentTarget.style.color = '#f87171'
                            } else {
                              e.currentTarget.style.backgroundColor = '#0d2e20'
                              e.currentTarget.style.color = '#10b981'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (done) {
                              e.currentTarget.style.backgroundColor = '#0d2e20'
                              e.currentTarget.style.color = '#10b981'
                            } else {
                              e.currentTarget.style.backgroundColor = '#22252e'
                              e.currentTarget.style.color = '#6b7280'
                            }
                          }}
                        >
                          <FiCheck className="w-3 h-3" />
                          {done ? 'Mark incomplete' : 'Mark done'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Bottom summary ── */}
          {!lecturesLoading && lectures.length > 0 && (
            <div className="mt-8 rounded-2xl p-5 flex items-center justify-between"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <div>
                <p className="text-white font-bold text-sm mb-0.5">
                  {progressPercent === 100
                    ? '🎉 You finished this folder!'
                    : `${totalLectures - completedLectures} lectures remaining`}
                </p>
                <p className="text-slate-500 text-xs">
                  {progressPercent === 100
                    ? 'Great work. Move to your next folder.'
                    : 'Keep going — consistency builds mastery.'}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-black ${
                  progressPercent === 100 ? 'text-emerald-400' :
                  progressPercent >= 50 ? 'text-blue-400' : 'text-cyan-400'
                }`}>
                  {progressPercent}%
                </p>
                <p className="text-slate-600 text-xs">complete</p>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}