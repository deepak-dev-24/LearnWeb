import { useMemo, useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchLectures } from '../features/lectures/lectureSlice'
import {
  FiArrowLeft, FiClock, FiEdit3, FiPlay, FiPause,
  FiRefreshCw, FiCheck, FiAlertCircle,
  FiMaximize, FiMinimize
} from 'react-icons/fi'

// ── Pomodoro presets
const PRESETS = [
  { label: '25 min', value: 25 * 60 },
  { label: '45 min', value: 45 * 60 },
  { label: '60 min', value: 60 * 60 },
  { label: 'Custom', value: null },
]

// ── Focus Timer Component
const FocusTimer = () => {
  const [selected, setSelected] = useState(0)
  const [customMin, setCustomMin] = useState('')
  const [showCustom, setShowCustom] = useState(false)
  const [total, setTotal] = useState(PRESETS[0].value)
  const [seconds, setSeconds] = useState(PRESETS[0].value)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [idle, setIdle] = useState(false)
  const intervalRef = useRef(null)
  const idleRef = useRef(null)
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    const onActivity = () => {
      lastActivityRef.current = Date.now()
      setIdle(false)
    }
    window.addEventListener('mousemove', onActivity)
    window.addEventListener('keydown', onActivity)
    idleRef.current = setInterval(() => {
      if (running && Date.now() - lastActivityRef.current > 90000) setIdle(true)
    }, 10000)
    return () => {
      window.removeEventListener('mousemove', onActivity)
      window.removeEventListener('keydown', onActivity)
      clearInterval(idleRef.current)
    }
  }, [running])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            setDone(true)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const selectPreset = (i) => {
    setSelected(i)
    if (PRESETS[i].value) {
      setShowCustom(false)
      setTotal(PRESETS[i].value)
      setSeconds(PRESETS[i].value)
      setRunning(false)
      setDone(false)
    } else {
      setShowCustom(true)
    }
  }

  const applyCustom = () => {
    const v = parseInt(customMin) * 60
    if (!isNaN(v) && v > 0) {
      setTotal(v)
      setSeconds(v)
      setRunning(false)
      setDone(false)
      setShowCustom(false)
    }
  }

  const reset = () => {
    clearInterval(intervalRef.current)
    setSeconds(total)
    setRunning(false)
    setDone(false)
    setIdle(false)
  }

  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  const progress = total > 0 ? ((total - seconds) / total) * 100 : 0
  const circumference = 2 * Math.PI * 40
  const strokeDash = circumference - (progress / 100) * circumference

  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiClock className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Focus Timer</span>
        </div>
        {running && (
          <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            live
          </span>
        )}
      </div>

      {idle && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: '#2e1a0e', border: '1px solid #7c3a1a', color: '#fb923c' }}>
          <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
          Hey! You seem distracted. Come back to the video 👀
        </div>
      )}

      {done && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ backgroundColor: '#0d2e20', border: '1px solid #10b981', color: '#10b981' }}>
          <FiCheck className="w-3.5 h-3.5 shrink-0" />
          Session complete! Take a short break 🎉
        </div>
      )}

      <div className="flex justify-center mb-5">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#22252e" strokeWidth="7" />
            <circle
              cx="50" cy="50" r="40" fill="none"
              stroke={done ? '#10b981' : idle ? '#f97316' : running ? '#06b6d4' : '#334155'}
              strokeWidth="7" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={strokeDash}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {done ? <span className="text-2xl">🎉</span> : (
              <>
                <span className="text-xl font-black font-mono text-slate-100 leading-none">{mins}:{secs}</span>
                <span className="text-slate-600 text-xs font-mono mt-0.5">{running ? 'focusing' : 'paused'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => { setRunning(r => !r); setDone(false) }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all duration-200"
          style={{ backgroundColor: running ? '#1e293b' : '#06b6d4', color: running ? '#94a3b8' : '#000', border: running ? '1px solid #2e3a4a' : 'none' }}
        >
          {running ? <><FiPause className="w-3.5 h-3.5" /> Pause</> : <><FiPlay className="w-3.5 h-3.5" /> {done ? 'Restart' : 'Start'}</>}
        </button>
        <button onClick={reset} className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
          style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }} title="Reset">
          <FiRefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {PRESETS.map((p, i) => (
          <button key={i} onClick={() => selectPreset(i)}
            className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all"
            style={{ backgroundColor: selected === i ? '#06b6d4' : '#22252e', color: selected === i ? '#000' : '#6b7280', border: selected === i ? 'none' : '1px solid #2e3140' }}>
            {p.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="flex gap-2 mt-3">
          <input type="number" min="1" max="180" placeholder="minutes" value={customMin}
            onChange={e => setCustomMin(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200 outline-none"
            style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
            onFocus={e => e.target.style.borderColor = '#06b6d4'}
            onBlur={e => e.target.style.borderColor = '#2e3140'}
          />
          <button onClick={applyCustom} className="px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ backgroundColor: '#06b6d4', color: '#000' }}>Set</button>
        </div>
      )}
    </div>
  )
}

// ── Notes Component
const Notes = ({ lectureId }) => {
  const storageKey = `notes_${lectureId}`
  const [text, setText] = useState(() => localStorage.getItem(storageKey) || '')
  const [saved, setSaved] = useState(false)
  const saveRef = useRef(null)

  const handleChange = (e) => {
    setText(e.target.value)
    setSaved(false)
    clearTimeout(saveRef.current)
    saveRef.current = setTimeout(() => {
      localStorage.setItem(storageKey, e.target.value)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    }, 800)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  return (
    <div className="rounded-2xl p-5 flex flex-col flex-1"
      style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiEdit3 className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono uppercase tracking-widest text-slate-400">My Notes</span>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
              <FiCheck className="w-3 h-3" /> saved
            </span>
          )}
          <span className="text-xs font-mono text-slate-600">{wordCount}w</span>
        </div>
      </div>
      <textarea value={text} onChange={handleChange}
        placeholder={`📝 Write anything while watching...\n\n• Key points\n• Things to remember\n• Questions to revisit`}
        className="flex-1 w-full text-slate-300 text-sm leading-relaxed resize-none outline-none placeholder-slate-700 font-mono"
        style={{ backgroundColor: 'transparent', minHeight: '180px', caretColor: '#06b6d4' }}
      />
      <div className="pt-3 mt-2 flex items-center justify-between" style={{ borderTop: '1px solid #22252e' }}>
        <span className="text-slate-700 text-xs font-mono">auto-saves as you type</span>
        <button onClick={() => { setText(''); localStorage.removeItem(storageKey) }}
          className="text-xs text-slate-700 hover:text-red-400 transition-colors font-mono">clear</button>
      </div>
    </div>
  )
}

// ── Main VideoPlayer
export default function VideoPlayer() {
  const { id, lectureId } = useParams()
  const dispatch = useDispatch()
  const { byCourseId } = useSelector((s) => s.lectures)

  // ── THE FIX: if lectures not in Redux, fetch them ──
  useEffect(() => {
    if (!byCourseId[id] || byCourseId[id].length === 0) {
      dispatch(fetchLectures(id))
    }
  }, [id, dispatch, byCourseId])

  const lecture = useMemo(
    () => (byCourseId[id] || []).find(l => l._id === lectureId),
    [byCourseId, id, lectureId]
  )

  const [loadError, setLoadError] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Track if we are still loading
  const isLoading = !byCourseId[id]

  // Tab visibility warning
  const [tabWarning, setTabWarning] = useState(false)
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) setTabWarning(true)
      else setTimeout(() => setTabWarning(false), 3000)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Escape key exits focus mode
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && focusMode) setFocusMode(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focusMode])

  // ── Show loading while fetching ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: '#111318' }}>
        <div className="w-10 h-10 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
        <p className="text-slate-500 text-sm font-mono">loading lecture...</p>
      </div>
    )
  }

  // ── Lecture not found after fetch ──
  if (!lecture) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111318' }}>
        <div className="text-center">
          <div className="text-7xl mb-5">🎬</div>
          <h2 className="text-2xl font-bold text-slate-100 mb-3">Lecture Not Found</h2>
          <p className="text-slate-400 mb-7 text-sm">This lecture doesn't exist or was removed.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to={`/courses/${id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ backgroundColor: '#06b6d4', color: '#000' }}>
              ← Back to Folder
            </Link>
            <Link to="/feed"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35', color: '#94a3b8' }}>
              Browse Feed
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const VideoContainer = ({ children }) => (
    <div className="relative w-full rounded-xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: focusMode ? 'unset' : '16/9', height: focusMode ? '100%' : 'auto', backgroundColor: '#000' }}>
      {children}
    </div>
  )

  const renderVideoPlayer = (url) => {
    if (!url) return (
      <VideoContainer>
        <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#111318' }}>
          <div className="text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <p className="text-red-400 text-sm font-semibold">No video available.</p>
          </div>
        </div>
      </VideoContainer>
    )

    if (url.match(/\.(mp4|mov|avi|wmv|webm)$/i) || url.startsWith('blob:') ||
      (url.startsWith('http') && !url.includes('youtube') && !url.includes('vimeo'))) {
      return (
        <VideoContainer>
          <video src={url} controls className="absolute inset-0 w-full h-full object-contain bg-black"
            onError={() => setLoadError(true)} preload="metadata" controlsList="nodownload">
            Your browser does not support the video tag.
          </video>
        </VideoContainer>
      )
    }

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0]
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0]
      if (!videoId) return (
        <VideoContainer>
          <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#111318' }}>
            <p className="text-red-400 text-sm">Invalid YouTube URL</p>
          </div>
        </VideoContainer>
      )
      if (loadError) return (
        <VideoContainer>
          <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#111318' }}>
            <p className="text-red-400 text-sm">Failed to load video</p>
          </div>
        </VideoContainer>
      )
      return (
        <VideoContainer>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1`}
            title={lecture.title} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            className="absolute inset-0 w-full h-full"
            allowFullScreen onError={() => setLoadError(true)} loading="lazy"
          />
        </VideoContainer>
      )
    }

    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop()?.split('?')[0]
      if (!videoId) return (
        <VideoContainer>
          <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#111318' }}>
            <p className="text-red-400 text-sm">Invalid Vimeo URL</p>
          </div>
        </VideoContainer>
      )
      return (
        <VideoContainer>
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&playsinline=1`}
            title={lecture.title} frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            className="absolute inset-0 w-full h-full"
            allowFullScreen loading="lazy"
          />
        </VideoContainer>
      )
    }

    return (
      <VideoContainer>
        <div className="flex items-center justify-center h-full" style={{ backgroundColor: '#111318' }}>
          <div className="text-center px-6">
            <div className="text-5xl mb-3">🎥</div>
            <p className="text-yellow-400 text-sm font-semibold mb-1">Unsupported Format</p>
            <p className="text-slate-500 text-xs">Use YouTube, Vimeo, or MP4/WebM.</p>
          </div>
        </div>
      </VideoContainer>
    )
  }

  // ── FOCUS MODE ──
  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: '#0c0e12' }}>
        <button
          onClick={() => setFocusMode(false)}
          className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35', color: '#6b7280' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2d35'; e.currentTarget.style.color = '#6b7280' }}
        >
          <FiMinimize className="w-3.5 h-3.5" />
          Exit Focus Mode
          <span className="text-slate-700 font-mono ml-1">esc</span>
        </button>

        <div className="flex-1 flex flex-col justify-center p-6 pr-3" style={{ height: '100vh', overflow: 'hidden' }}>
          <div className="mb-3">
            <span className="text-cyan-400 text-xs font-mono uppercase tracking-widest">📂 now watching</span>
            <h1 className="text-lg font-black text-slate-100 leading-tight mt-1 line-clamp-1">{lecture.title}</h1>
          </div>
          <div className="rounded-2xl overflow-hidden flex-1" style={{ border: '1px solid #2a2d35', height: 'calc(100vh - 120px)' }}>
            {renderVideoPlayer(lecture.videoUrl)}
          </div>
        </div>

        <div className="w-80 xl:w-96 shrink-0 flex flex-col gap-4 p-6 pl-3 overflow-y-auto"
          style={{ borderLeft: '1px solid #1e2028' }}>
          {tabWarning && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold animate-pulse"
              style={{ backgroundColor: '#2e1a0e', border: '1px solid #f97316', color: '#fb923c' }}>
              <FiAlertCircle className="w-3.5 h-3.5" />
              You left the tab! Stay focused 👀
            </div>
          )}
          <FocusTimer />
          <Notes lectureId={lectureId} />
        </div>
      </div>
    )
  }

  // ── NORMAL MODE ──
  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: '#111318' }}>
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center justify-between mb-5">
          <Link to={`/courses/${id}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors group">
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to folder
          </Link>

          <div className="flex items-center gap-3">
            {tabWarning && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse"
                style={{ backgroundColor: '#2e1a0e', border: '1px solid #f97316', color: '#fb923c' }}>
                <FiAlertCircle className="w-3.5 h-3.5" />
                You left the tab! Stay focused 👀
              </div>
            )}
            <button onClick={() => setFocusMode(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
              style={{ backgroundColor: '#06b6d4', color: '#000' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#22d3ee'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#06b6d4'}>
              <FiMaximize className="w-3.5 h-3.5" />
              Enter Focus Mode
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-slate-400 text-xs font-mono">focus mode</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl overflow-hidden mb-4"
              style={{ backgroundColor: '#000', border: '1px solid #2a2d35' }}>
              {renderVideoPlayer(lecture.videoUrl)}
            </div>
            <div className="rounded-2xl p-5" style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2 block">📂 now watching</span>
              <h1 className="text-xl font-black text-slate-100 leading-tight mb-2">{lecture.title}</h1>
              {lecture.description && (
                <p className="text-slate-400 text-sm leading-relaxed">{lecture.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: '1px solid #22252e' }}>
                {[
                  { icon: '💡', text: 'Take notes on the right' },
                  { icon: '🔄', text: 'Rewatch tricky parts' },
                  { icon: '⚡', text: 'Practice after watching' },
                ].map((tip, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500"
                    style={{ backgroundColor: '#22252e' }}>
                    <span>{tip.icon}</span><span>{tip.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4 shrink-0">
            <FocusTimer />
            <Notes lectureId={lectureId} />
            <Link to={`/courses/${id}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35', color: '#6b7280' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2d35'; e.currentTarget.style.color = '#6b7280' }}>
              View All Lectures
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}