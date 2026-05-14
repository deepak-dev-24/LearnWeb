// src/pages/DailyPlan.jsx
import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchTodayPlan, addTask, toggleTask, deleteTask, fetchHistory } from '../features/plan/planSlice'
import { FiPlus, FiCheck, FiTrash2, FiClock, FiTrendingUp, FiSun, FiChevronDown, FiChevronUp } from 'react-icons/fi'

// ─────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────
const COLORS = ['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#f97316', '#ec4899', '#3b82f6']

const Confetti = ({ active }) => {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const particles = useRef([])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    particles.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 14 + 6,
      h: Math.random() * 7 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 4 + 2,
      opacity: 1,
    }))
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.current.forEach(p => {
        p.x += p.vx; p.y += p.vy
        p.rotation += p.rotationSpeed
        p.opacity -= 0.005
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      })
      particles.current = particles.current.filter(p => p.opacity > 0 && p.y < canvas.height)
      if (particles.current.length > 0) animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [active])

  if (!active) return null
  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none', width: '100vw', height: '100vh' }} />
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const todayLabel = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const getDayState = () => { const h = new Date().getHours(); if (h < 12) return 'morning'; if (h < 20) return 'execute'; return 'reflect' }
const softMessage = (completed, total) => {
  if (total === 0) return 'What do you want to accomplish today?'
  if (completed === total) return 'You did what you said. 🔥'
  if (completed === 0) return 'Today still has time. Start with one task.'
  const r = total - completed
  if (r === 1) return '1 task remaining. Finish strong.'
  return `${r} tasks remaining. Keep the momentum.`
}
const historyMessage = (p) => {
  if (p === 100) return 'Strong day ⚡'
  if (p >= 70) return 'Solid effort 💪'
  if (p >= 40) return 'Showed up ✅'
  return 'Kept going 🌱'
}
const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

// ─────────────────────────────────────────
// RIPPLE BUTTON
// ─────────────────────────────────────────
const RippleButton = ({ onClick, children, color, textColor = '#000', style = {}, disabled = false }) => {
  const [ripples, setRipples] = useState([])
  const btnRef = useRef(null)
  const handleClick = (e) => {
    if (disabled) return
    const rect = btnRef.current.getBoundingClientRect()
    const id = Date.now()
    setRipples(r => [...r, { x: e.clientX - rect.left, y: e.clientY - rect.top, id }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700)
    onClick && onClick(e)
  }
  return (
    <button ref={btnRef} onClick={handleClick} disabled={disabled}
      style={{
        position: 'relative', overflow: 'hidden',
        backgroundColor: disabled ? '#1a1d24' : color,
        color: disabled ? '#374151' : textColor,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = `0 0 40px ${color}50` } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = style.boxShadow || 'none' } }}
    >
      {ripples.map(r => (
        <span key={r.id} style={{
          position: 'absolute', left: r.x, top: r.y,
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.35)',
          transform: 'translate(-50%,-50%) scale(0)',
          animation: 'rippleOut 0.7s ease-out forwards',
          pointerEvents: 'none',
        }} />
      ))}
      {children}
    </button>
  )
}

// ─────────────────────────────────────────
// PRODUCTIVE HOURS TIMER
// ─────────────────────────────────────────
const ProductiveTimer = () => {
  const PRODUCTIVE_START = 6
  const PRODUCTIVE_END = 23
  const TOTAL = (PRODUCTIVE_END - PRODUCTIVE_START) * 60
  const getLeft = () => {
    const now = new Date(); const h = now.getHours(); const m = now.getMinutes()
    if (h < PRODUCTIVE_START) return { mins: TOTAL, notStarted: true, over: false }
    if (h >= PRODUCTIVE_END) return { mins: 0, notStarted: false, over: true }
    return { mins: TOTAL - ((h - PRODUCTIVE_START) * 60 + m), notStarted: false, over: false }
  }
  const [timeLeft, setTimeLeft] = useState(getLeft())
  useEffect(() => { const t = setInterval(() => setTimeLeft(getLeft()), 1000); return () => clearInterval(t) }, [])
  const { mins, over, notStarted } = timeLeft
  const hours = Math.floor(mins / 60)
  const minutes = mins % 60
  const progress = over ? 100 : notStarted ? 0 : ((TOTAL - mins) / TOTAL) * 100
  const urgencyColor = over ? '#10b981' : mins < 60 ? '#f97316' : mins < 180 ? '#f59e0b' : '#06b6d4'
  const getMessage = () => {
    if (over) return 'Productive hours are over. Rest well. 🌙'
    if (notStarted) return 'Productive hours start at 6am. Plan ahead!'
    if (mins < 60) return 'Less than an hour left. Finish strong! 🔥'
    if (mins < 180) return 'A few hours remain. Make them count.'
    if (mins < 360) return 'Half the day gone. Stay consistent.'
    return 'Fresh productive day ahead. Start strong!'
  }
  return (
    <div style={{
      backgroundColor: '#111318',
      border: `2px solid ${urgencyColor}`,
      borderRadius: 20, padding: '24px 28px', marginBottom: 28,
      transition: 'border-color 1s ease',
      boxShadow: `0 0 32px ${urgencyColor}15`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            backgroundColor: urgencyColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${urgencyColor}60`, flexShrink: 0,
          }}>
            <FiSun style={{ width: 22, height: 22, color: '#000' }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: urgencyColor, margin: '0 0 3px' }}>
              Productive Time Left Today
            </p>
            <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#6b7280', margin: 0 }}>
              {getMessage()}
            </p>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {over
            ? <span style={{ fontSize: 32, fontWeight: 900, color: '#10b981' }}>Done!</span>
            : <span style={{ fontSize: 40, fontWeight: 900, fontFamily: 'monospace', color: urgencyColor }}>
                {hours}h {String(minutes).padStart(2, '0')}m
              </span>
          }
        </div>
      </div>
      <div style={{ marginTop: 16, width: '100%', height: 6, borderRadius: 999, backgroundColor: '#1e2028' }}>
        <div style={{
          height: 6, borderRadius: 999,
          width: `${progress}%`,
          backgroundColor: urgencyColor,
          transition: 'width 1s linear, background-color 1s ease',
          boxShadow: `0 0 10px ${urgencyColor}60`,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        {['6am', '9am', '12pm', '3pm', '6pm', '9pm', '11pm'].map((t, i) => (
          <span key={i} style={{ fontSize: 10, fontFamily: 'monospace', color: '#2a2d35' }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// HISTORY CARD
// ─────────────────────────────────────────
const HistoryCard = ({ plan }) => {
  const [expanded, setExpanded] = useState(false)
  const completed = plan.completedCount || 0
  const total = plan.totalCount || 0
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  const tasks = plan.tasks || []
  const doneTasks = tasks.filter(t => t.completed)
  const pendingTasks = tasks.filter(t => !t.completed)

  return (
    <div style={{
      backgroundColor: '#111318',
      border: '1px solid #a855f730',
      borderRadius: 16, overflow: 'hidden',
      transition: 'border-color 0.2s ease',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = '#a855f760'}
      onMouseLeave={e => e.currentTarget.style.borderColor = '#a855f730'}
    >
      <button onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a1d24'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          backgroundColor: percent === 100 ? '#0f2e1e' : '#1e1030',
          border: `2px solid ${percent === 100 ? '#10b981' : '#a855f7'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 900, color: percent === 100 ? '#10b981' : '#a855f7' }}>
            {percent}%
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', margin: '0 0 3px' }}>
            {formatDate(plan.date)}
          </p>
          <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#a855f7', margin: 0 }}>
            {historyMessage(percent)} · {completed}/{total} tasks
          </p>
        </div>
        <div style={{ color: '#7c3aed', flexShrink: 0 }}>
          {expanded ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </button>

      <div style={{ padding: '0 20px 12px' }}>
        <div style={{ width: '100%', height: 4, borderRadius: 999, backgroundColor: '#1e2028' }}>
          <div style={{
            height: 4, borderRadius: 999,
            width: `${percent}%`,
            backgroundColor: percent === 100 ? '#10b981' : '#a855f7',
            transition: 'width 0.5s ease',
            boxShadow: `0 0 8px ${percent === 100 ? '#10b981' : '#a855f7'}60`,
          }} />
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '16px 20px 20px', borderTop: '1px solid #1e2028' }}>
          {doneTasks.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#10b981', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 10px' }}>
                ✓ Completed ({doneTasks.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {doneTasks.map((task, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12,
                    backgroundColor: '#0f2e1e', border: '1px solid #10b98125',
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                      backgroundColor: '#10b981',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <FiCheck style={{ width: 11, height: 11, color: '#000' }} />
                    </div>
                    <p style={{ fontSize: 13, color: '#4b5563', textDecoration: 'line-through', margin: 0 }}>{task.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pendingTasks.length > 0 && (
            <div>
              <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#374151', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 10px' }}>
                ○ Not completed ({pendingTasks.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {pendingTasks.map((task, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 12,
                    backgroundColor: '#111318', border: '1px solid #1e2028',
                  }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: '2px solid #2a2d35' }} />
                    <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>{task.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tasks.length === 0 && (
            <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#2a2d35', textAlign: 'center', padding: '12px 0', margin: 0 }}>
              No tasks recorded for this day.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
export default function DailyPlan() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { today: plan, history, loading } = useSelector((s) => s.plan)

  const [taskText, setTaskText]     = useState('')
  const [estimate, setEstimate]     = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [adding, setAdding]         = useState(false)
  const [confetti, setConfetti]     = useState(false)
  const prevCompleted = useRef(0)
  const prevTotal     = useRef(0)
  const dayState      = getDayState()

  useEffect(() => {
    dispatch(fetchTodayPlan())
    dispatch(fetchHistory())
  }, [dispatch])

  const tasks     = plan?.tasks || []
  const completed = tasks.filter(t => t.completed).length
  const total     = tasks.length
  const percent   = total > 0 ? Math.round((completed / total) * 100) : 0

  useEffect(() => {
    if (total > 0 && completed === total &&
      (prevCompleted.current !== completed || prevTotal.current !== total)) {
      setConfetti(true)
      setTimeout(() => setConfetti(false), 4500)
    }
    prevCompleted.current = completed
    prevTotal.current = total
  }, [completed, total])

  const handleAdd = async () => {
    if (!taskText.trim()) return
    setAdding(true)
    await dispatch(addTask({ text: taskText.trim(), estimate: estimate.trim() }))
    setTaskText(''); setEstimate('')
    setAdding(false)
  }
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() } }

  // ─────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0f', padding: '32px 24px', fontFamily: 'system-ui, sans-serif' }}>

      <style>{`
        @keyframes rippleOut { to { transform:translate(-50%,-50%) scale(28); opacity:0; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        input:focus, textarea:focus { outline: none !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #1e2028; border-radius: 4px; }
      `}</style>

      <Confetti active={confetti} />

      {confetti && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            textAlign: 'center', padding: '40px 56px', borderRadius: 28,
            backgroundColor: 'rgba(0,0,0,0.88)', border: '2px solid #10b981',
            boxShadow: '0 0 60px rgba(16,185,129,0.3)',
            animation: 'scaleIn 0.4s ease',
          }}>
            <p style={{ fontSize: 72, margin: '0 0 8px' }}>🎉</p>
            <p style={{ fontSize: 36, fontWeight: 900, color: '#10b981', margin: '0 0 6px' }}>All Done!</p>
            <p style={{ fontSize: 18, color: '#6ee7b7', margin: 0 }}>You did what you said. 🔥</p>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── BACK BUTTON ── */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: '1px solid #2a2d35',
            borderRadius: 10, padding: '8px 18px',
            color: '#4b5563', fontSize: 12,
            fontFamily: 'monospace', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: 28, letterSpacing: 1,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = '#6b7280'; e.currentTarget.style.transform = 'translateX(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#2a2d35'; e.currentTarget.style.transform = 'translateX(0)' }}
        >
          ← HOME
        </button>

        {/* ── HEADER ── */}
        <div style={{ marginBottom: 32, animation: 'fadeUp 0.6s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: '#06b6d4',
              display: 'inline-block',
              boxShadow: '0 0 10px #06b6d4',
              animation: 'pulse 2s infinite',
            }} />
            <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#6b7280', letterSpacing: 4, textTransform: 'uppercase' }}>
              {dayState === 'morning' ? 'morning — plan your day'
                : dayState === 'execute' ? 'afternoon — execute your plan'
                : 'evening — review your day'}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: '#f1f5f9', margin: '0 0 6px', letterSpacing: -2 }}>
            Today's Plan
          </h1>
          <p style={{ fontSize: 14, fontFamily: 'monospace', color: '#374151', margin: 0, letterSpacing: 1 }}>
            {todayLabel()}
          </p>
        </div>

        {/* ── PRODUCTIVE TIMER ── */}
        <ProductiveTimer />

        {/* ── MAIN GRID ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.6fr) minmax(320px,1fr)',
          gap: 24, alignItems: 'start',
        }}>

          {/* ════════════════════════
              LEFT — TASKS
          ════════════════════════ */}
          <div style={{ animation: 'fadeUp 0.7s ease' }}>

            {/* Section label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 4, height: 32, borderRadius: 999, backgroundColor: '#10b981', boxShadow: '0 0 12px #10b98170' }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 4, margin: 0 }}>Tasks</p>
            </div>

            {/* Progress bar card */}
            {total > 0 && (
              <div style={{
                backgroundColor: '#111318', border: '1px solid #10b98130',
                borderRadius: 20, padding: '20px 24px', marginBottom: 16,
                boxShadow: '0 0 24px rgba(16,185,129,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontSize: 15, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
                    {softMessage(completed, total)}
                  </p>
                  <span style={{ fontSize: 40, fontWeight: 900, fontFamily: 'monospace', color: percent === 100 ? '#10b981' : '#06b6d4' }}>
                    {percent}%
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, borderRadius: 999, backgroundColor: '#1e2028' }}>
                  <div style={{
                    height: 6, borderRadius: 999,
                    width: `${percent}%`,
                    backgroundColor: percent === 100 ? '#10b981' : '#06b6d4',
                    transition: 'width 0.7s ease, background-color 0.5s ease',
                    boxShadow: `0 0 10px ${percent === 100 ? '#10b981' : '#06b6d4'}60`,
                  }} />
                </div>
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151', margin: '8px 0 0' }}>
                  {completed} of {total} tasks completed
                </p>
              </div>
            )}

            {/* Add task card */}
            <div style={{
              backgroundColor: '#111318', border: '1px solid #1e2028',
              borderRadius: 20, padding: '20px 24px', marginBottom: 20,
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: 3, margin: '0 0 14px' }}>
                + Add a task
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  placeholder='"Watch Node.js video", "Practice REST APIs"'
                  value={taskText}
                  onChange={e => setTaskText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    backgroundColor: '#1a1d24', border: '2px solid #1e2028',
                    borderRadius: 14, padding: '14px 18px',
                    fontSize: 14, color: '#f1f5f9',
                    caretColor: '#10b981',
                    transition: 'border-color 0.2s ease',
                    fontFamily: 'system-ui, sans-serif',
                  }}
                  onFocus={e => e.target.style.borderColor = '#10b981'}
                  onBlur={e => e.target.style.borderColor = '#1e2028'}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    placeholder="Time estimate — e.g. 30 min (optional)"
                    value={estimate}
                    onChange={e => setEstimate(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                      flex: 1,
                      backgroundColor: '#1a1d24', border: '2px solid #1e2028',
                      borderRadius: 12, padding: '12px 16px',
                      fontSize: 13, color: '#94a3b8',
                      caretColor: '#10b981',
                      transition: 'border-color 0.2s ease',
                      fontFamily: 'system-ui, sans-serif',
                    }}
                    onFocus={e => e.target.style.borderColor = '#10b981'}
                    onBlur={e => e.target.style.borderColor = '#1e2028'}
                  />
                  <RippleButton
                    onClick={handleAdd}
                    disabled={!taskText.trim() || adding}
                    color="#10b981"
                    textColor="#000"
                    style={{
                      borderRadius: 12, padding: '12px 24px',
                      fontSize: 14, fontWeight: 800,
                      display: 'flex', alignItems: 'center', gap: 6,
                      boxShadow: taskText.trim() ? '0 0 24px rgba(16,185,129,0.3)' : 'none',
                      letterSpacing: 0.5,
                    }}
                  >
                    <FiPlus style={{ width: 16, height: 16 }} />
                    {adding ? '...' : 'Add'}
                  </RippleButton>
                </div>
              </div>
            </div>

            {/* Loading */}
            {loading && tasks.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  border: '3px solid #1e2028',
                  borderTopColor: '#10b981',
                  animation: 'spin 0.8s linear infinite',
                }} />
              </div>
            )}

            {/* Empty state */}
            {!loading && tasks.length === 0 && (
              <div style={{
                backgroundColor: '#111318', border: '1px dashed #1e2028',
                borderRadius: 20, padding: '48px 24px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 48, margin: '0 0 12px' }}>📋</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', margin: '0 0 6px' }}>No tasks yet</p>
                <p style={{ fontSize: 13, color: '#374151', margin: 0 }}>What do you want to accomplish today?</p>
              </div>
            )}

            {/* Task list */}
            {tasks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tasks.map((task, idx) => (
                  <div key={task._id}
                    style={{
                      backgroundColor: task.completed ? '#0c1f15' : '#111318',
                      border: `1.5px solid ${task.completed ? '#10b98145' : '#1e2028'}`,
                      borderRadius: 18, padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                      transition: 'all 0.3s ease',
                      animation: 'slideIn 0.3s ease',
                      boxShadow: task.completed ? '0 0 16px rgba(16,185,129,0.05)' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (!task.completed) e.currentTarget.style.borderColor = '#2a2d35'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = task.completed ? '#10b98145' : '#1e2028'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Index */}
                    <span style={{
                      fontSize: 12, fontFamily: 'monospace', flexShrink: 0,
                      width: 24, textAlign: 'center',
                      color: task.completed ? '#10b981' : '#2a2d35',
                      fontWeight: 700,
                    }}>
                      {idx + 1}
                    </span>

                    {/* Toggle button */}
                    <button
                      onClick={() => dispatch(toggleTask(task._id))}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: task.completed ? '#10b981' : 'transparent',
                        border: task.completed ? 'none' : '2px solid #2a2d35',
                        boxShadow: task.completed ? '0 0 16px rgba(16,185,129,0.5)' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'all 0.25s ease',
                      }}
                      onMouseEnter={e => { if (!task.completed) { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.transform = 'scale(1.1)' } }}
                      onMouseLeave={e => { if (!task.completed) { e.currentTarget.style.borderColor = '#2a2d35'; e.currentTarget.style.transform = 'scale(1)' } }}
                    >
                      {task.completed && <FiCheck style={{ width: 16, height: 16, color: '#000' }} />}
                    </button>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 15, fontWeight: 600, margin: 0,
                        color: task.completed ? '#374151' : '#f1f5f9',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        transition: 'all 0.3s ease',
                      }}>
                        {task.text}
                      </p>
                      {task.estimate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                          <FiClock style={{ width: 11, height: 11, color: '#374151' }} />
                          <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#374151' }}>{task.estimate}</span>
                        </div>
                      )}
                    </div>

                    {/* Done badge */}
                    {task.completed && (
                      <span style={{
                        fontSize: 11, fontWeight: 700, flexShrink: 0,
                        padding: '4px 10px', borderRadius: 8,
                        backgroundColor: '#0f2e1e', color: '#10b981',
                        border: '1px solid #10b98130', fontFamily: 'monospace',
                      }}>
                        ✓ done
                      </span>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => dispatch(deleteTask(task._id))}
                      style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#2a2d35', transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.backgroundColor = '#2e1515'; e.currentTarget.style.borderRadius = '8px' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#2a2d35'; e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <FiTrash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ════════════════════════
              RIGHT — STATS + HISTORY
          ════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeUp 0.8s ease' }}>

            {/* ── EXECUTION STATS ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 4, height: 32, borderRadius: 999, backgroundColor: '#06b6d4', boxShadow: '0 0 12px #06b6d470' }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: 4, margin: 0 }}>Execution</p>
              </div>

              <div style={{
                backgroundColor: '#111318', border: '1px solid #06b6d425',
                borderRadius: 20, padding: '24px',
                boxShadow: '0 0 24px rgba(6,182,212,0.05)',
              }}>
                {/* Big percent */}
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    fontSize: 'clamp(56px, 6vw, 80px)',
                    fontWeight: 900, fontFamily: 'monospace',
                    color: percent === 100 ? '#10b981' : '#06b6d4',
                    lineHeight: 1,
                    textShadow: `0 0 30px ${percent === 100 ? '#10b981' : '#06b6d4'}40`,
                    transition: 'color 0.5s ease',
                  }}>
                    {percent}%
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 6, borderRadius: 999, backgroundColor: '#1e2028', marginBottom: 20 }}>
                  <div style={{
                    height: 6, borderRadius: 999,
                    width: `${percent}%`,
                    backgroundColor: percent === 100 ? '#10b981' : '#06b6d4',
                    transition: 'width 0.7s ease, background-color 0.5s ease',
                    boxShadow: `0 0 10px ${percent === 100 ? '#10b981' : '#06b6d4'}60`,
                  }} />
                </div>

                {/* Stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                  {[
                    { label: 'done',  value: completed,       color: '#10b981' },
                    { label: 'left',  value: total - completed, color: '#475569' },
                    { label: 'total', value: total,            color: '#06b6d4' },
                  ].map((s, i) => (
                    <div key={i} style={{
                      backgroundColor: '#1a1d24', border: '1px solid #1e2028',
                      borderRadius: 14, padding: '14px 10px', textAlign: 'center',
                      transition: 'border-color 0.2s, transform 0.2s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}50`; e.currentTarget.style.transform = 'translateY(-2px)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2028'; e.currentTarget.style.transform = 'translateY(0)' }}
                    >
                      <p style={{ fontSize: 28, fontWeight: 900, fontFamily: 'monospace', color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                      <p style={{ fontSize: 10, fontFamily: 'monospace', color: '#374151', margin: '6px 0 0', textTransform: 'uppercase', letterSpacing: 2 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Quote */}
                <div style={{
                  backgroundColor: '#1a1d24', border: '1px solid #1e2028',
                  borderRadius: 14, padding: '14px 16px',
                }}>
                  <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4b5563', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
                    {percent === 100 ? '"You showed up and delivered. 🌟"'
                      : percent >= 50 ? '"More than halfway. Keep going. 💪"'
                      : '"You planned this. Now execute it."'}
                  </p>
                </div>
              </div>
            </div>

            {/* ── HISTORY ── */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 4, height: 32, borderRadius: 999, backgroundColor: '#a855f7', boxShadow: '0 0 12px #a855f770' }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#a855f7', textTransform: 'uppercase', letterSpacing: 4, margin: 0 }}>Past Days</p>
              </div>

              <div style={{
                backgroundColor: '#111318', border: '1px solid #a855f725',
                borderRadius: 20, padding: '20px 24px',
              }}>
                <button
                  onClick={() => setShowHistory(h => !h)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: 0, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FiTrendingUp style={{ width: 18, height: 18, color: '#a855f7' }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#d8b4fe' }}>View consistency</span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#7c3aed' }}>
                    {showHistory ? '▲ hide' : '▼ show'}
                  </span>
                </button>

                {!showHistory && (
                  <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#4c1d95', margin: '12px 0 0' }}>
                    {history.length > 0
                      ? `${history.length} days recorded. Click to expand.`
                      : 'Complete today to start your history.'}
                  </p>
                )}

                {showHistory && (
                  <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {(!history || history.length === 0)
                      ? (
                        <div style={{ textAlign: 'center', padding: '24px 0' }}>
                          <p style={{ fontSize: 32, margin: '0 0 8px' }}>📅</p>
                          <p style={{ fontSize: 13, color: '#7c3aed', margin: 0 }}>No history yet. Complete your first day!</p>
                        </div>
                      )
                      : history.map(p => <HistoryCard key={p._id} plan={p} />)
                    }
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}