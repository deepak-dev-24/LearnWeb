// src/pages/OfflineStudy.jsx
import { useEffect, useState, useRef, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { saveSession, fetchTodaySessions } from '../features/studySession/studySessionSlice'

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────
const SESSION_DURATION = 25 * 60
const BREAK_DURATION   = 5  * 60

const INSTRUCTOR_MESSAGES = [
  "You opened this for a reason.",
  "The book is still there.",
  "Stay with it.",
  "You planned this.",
  "Don't break focus.",
  "Every minute counts.",
  "This is your time.",
  "Eyes on the page.",
  "No one else is doing this for you.",
  "The discomfort is the work.",
  "You're closer than you think.",
  "Don't look away now.",
]

const FOCUS_RESPONSES = {
  Fully:        "That's a solid session. Keep this energy.",
  Mostly:       "Good enough. Next session, go deeper.",
  'Not really': "Noted. The next 25 minutes are yours to reclaim.",
}

const fmt = (sec) => {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

const todayLabel = () => new Date().toLocaleDateString('en-US', {
  weekday: 'long', month: 'long', day: 'numeric'
})

const getColor = (elapsed, total) => {
  const rem = (total - elapsed) / 60
  if (rem <= 5)               return { primary: '#f59e0b', secondary: '#fbbf24', glow: 'rgba(245,158,11,0.3)' }
  if (elapsed / total >= 0.4) return { primary: '#06b6d4', secondary: '#22d3ee', glow: 'rgba(6,182,212,0.25)' }
  return                             { primary: '#f97316', secondary: '#fb923c', glow: 'rgba(249,115,22,0.25)' }
}

// ─────────────────────────────────────────
// ANIMATED COUNTER
// ─────────────────────────────────────────
const AnimatedNumber = ({ value, color }) => {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = parseInt(value)
    if (start === end) { setDisplay(end); return }
    const step = Math.ceil(end / 30)
    const timer = setInterval(() => {
      start = Math.min(start + step, end)
      setDisplay(start)
      if (start >= end) clearInterval(timer)
    }, 40)
    return () => clearInterval(timer)
  }, [value])
  return (
    <span style={{ color, fontFamily: 'monospace', fontWeight: 900 }}>
      {display}
    </span>
  )
}

// ─────────────────────────────────────────
// PARTICLE SYSTEM
// ─────────────────────────────────────────
const Particles = ({ color, active }) => {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const particles = useRef([])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width  = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const cx = canvas.width  / 2
    const cy = canvas.height / 2

    const spawn = () => {
      const angle = Math.random() * Math.PI * 2
      const r     = Math.min(canvas.width, canvas.height) * 0.28
      particles.current.push({
        x:     cx + r * Math.cos(angle),
        y:     cy + r * Math.sin(angle),
        vx:    (Math.random() - 0.5) * 0.6,
        vy:    (Math.random() - 0.5) * 0.6,
        life:  1,
        decay: 0.004 + Math.random() * 0.004,
        size:  1 + Math.random() * 2,
      })
    }

    let frame = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      if (frame % 8 === 0) spawn()
      particles.current = particles.current.filter(p => p.life > 0)
      particles.current.forEach(p => {
        p.x    += p.vx
        p.y    += p.vy
        p.life -= p.decay
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.globalAlpha = p.life * 0.6
        ctx.fill()
      })
      ctx.globalAlpha = 1
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [active, color])

  if (!active) return null
  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
  )
}

// ─────────────────────────────────────────
// HUGE CLOCK RING
// ─────────────────────────────────────────
const HugeClock = ({ elapsed, total, color, isBreak }) => {
  const vw      = Math.min(window.innerWidth * 0.65, window.innerHeight * 0.65, 520)
  const size    = vw
  const cx      = size / 2
  const cy      = size / 2
  const r1      = cx * 0.86
  const r2      = cx * 0.72
  const circ1   = 2 * Math.PI * r1
  const circ2   = 2 * Math.PI * r2
  const prog    = elapsed / total
  const minProg = (elapsed % 60) / 60
  const remaining = total - elapsed

  return (
    <div style={{
      position: 'relative', width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute',
        width: size * 0.5, height: size * 0.5,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)`,
        animation: 'glowPulse 3s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <svg width={size} height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i / 60) * 2 * Math.PI - Math.PI / 2
          const isMaj = i % 5 === 0
          const ro = r1 + 16
          const ri = ro - (isMaj ? 12 : 5)
          return (
            <line key={i}
              x1={cx + ri * Math.cos(angle)} y1={cy + ri * Math.sin(angle)}
              x2={cx + ro * Math.cos(angle)} y2={cy + ro * Math.sin(angle)}
              stroke={isMaj ? color.primary : '#1e2028'}
              strokeWidth={isMaj ? 2.5 : 1}
              opacity={isMaj ? 0.7 : 0.25}
            />
          )
        })}

        <circle cx={cx} cy={cy} r={r1} fill="none" stroke="#141418" strokeWidth="4" />
        <circle cx={cx} cy={cy} r={r1} fill="none"
          stroke={color.primary} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circ1}
          strokeDashoffset={circ1 - prog * circ1}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 1.5s ease', opacity: 0.4 }}
        />

        <circle cx={cx} cy={cy} r={r2} fill="none" stroke="#141418" strokeWidth="6" />
        <circle cx={cx} cy={cy} r={r2} fill="none"
          stroke={color.primary} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ2}
          strokeDashoffset={circ2 - prog * circ2}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 1.5s ease' }}
          filter={`drop-shadow(0 0 8px ${color.primary})`}
        />

        {(() => {
          const angle = minProg * 2 * Math.PI - Math.PI / 2
          return (
            <circle
              cx={cx + r2 * Math.cos(angle)}
              cy={cy + r2 * Math.sin(angle)}
              r="8"
              fill={color.secondary}
              filter={`drop-shadow(0 0 6px ${color.secondary})`}
              style={{ transition: 'cx 1s linear, cy 1s linear' }}
            />
          )
        })()}

        <text x={cx} y={cy - size * 0.04}
          textAnchor="middle" fill={color.secondary}
          fontSize={size * 0.2} fontWeight="900"
          fontFamily="monospace" letterSpacing="2"
          style={{ transition: 'fill 1.5s ease' }}
          filter={`drop-shadow(0 0 12px ${color.primary})`}
        >
          {fmt(remaining)}
        </text>

        <text x={cx} y={cy + size * 0.075}
          textAnchor="middle" fill="#2a2d35"
          fontSize={size * 0.042} fontFamily="monospace"
          letterSpacing="8" fontWeight="400"
        >
          {isBreak ? 'BREAK' : 'FOCUS'}
        </text>

        <text x={cx} y={cy + size * 0.145}
          textAnchor="middle" fill="#1e2028"
          fontSize={size * 0.03} fontFamily="monospace" letterSpacing="3"
        >
          {isBreak ? 'rest · breathe · return' : 'eyes on the material'}
        </text>
      </svg>
    </div>
  )
}

// ─────────────────────────────────────────
// WATCHING EYE
// ─────────────────────────────────────────
const WatchingEye = ({ color }) => {
  const [blink, setBlink] = useState(false)
  const [pupilX, setPupilX] = useState(0)

  useEffect(() => {
    const blinkLoop = () => {
      const d = 2000 + Math.random() * 5000
      setTimeout(() => {
        setBlink(true)
        setTimeout(() => { setBlink(false); blinkLoop() }, 150)
      }, d)
    }
    blinkLoop()
    const drift = setInterval(() => {
      setPupilX((Math.random() - 0.5) * 6)
    }, 2000)
    return () => clearInterval(drift)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 72, height: 40, borderRadius: '50%',
        border: `2px solid ${color}50`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: `0 0 24px ${color}25, inset 0 0 12px rgba(0,0,0,0.5)`,
        animation: 'eyeGlow 3s ease-in-out infinite',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: blink ? '100%' : '0%',
          backgroundColor: '#0a0a0f',
          transition: 'height 0.1s ease', zIndex: 3,
        }} />
        <div style={{
          width: 52, height: 28, borderRadius: '50%',
          backgroundColor: '#0f0f14',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: '50%',
            backgroundColor: color, opacity: 0.85,
            boxShadow: `0 0 14px ${color}`,
            transform: `translateX(${pupilX}px)`,
            transition: 'transform 1.5s ease',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#0a0a0f' }} />
          </div>
        </div>
      </div>
      <span style={{
        fontSize: 9, fontFamily: 'monospace',
        color: `${color}60`, letterSpacing: 4, textTransform: 'uppercase',
      }}>watching</span>
    </div>
  )
}

// ─────────────────────────────────────────
// FLASH MESSAGE
// ─────────────────────────────────────────
const FlashMessage = ({ msg, visible, color }) => (
  <div style={{
    position: 'absolute', top: '12%', left: '50%',
    transform: 'translateX(-50%)',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.5s ease',
    pointerEvents: 'none', zIndex: 20,
    textAlign: 'center', width: '80%',
  }}>
    <p style={{
      fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 800,
      color, fontFamily: 'monospace', margin: 0, letterSpacing: 1,
      textShadow: `0 0 30px ${color}`,
      animation: visible ? 'flashIn 0.4s ease' : 'none',
    }}>"{msg}"</p>
  </div>
)

// ─────────────────────────────────────────
// RIPPLE BUTTON
// ─────────────────────────────────────────
const RippleButton = ({ onClick, children, color, textColor = '#000', style = {} }) => {
  const [ripples, setRipples] = useState([])
  const btnRef = useRef(null)

  const handleClick = (e) => {
    const rect = btnRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(r => [...r, { x, y, id }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700)
    onClick && onClick(e)
  }

  return (
    <button ref={btnRef} onClick={handleClick}
      style={{
        position: 'relative', overflow: 'hidden',
        backgroundColor: color, color: textColor,
        border: 'none', cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'scale(1.05)'
        e.currentTarget.style.boxShadow = `0 0 50px ${color}60`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.boxShadow = style.boxShadow || 'none'
      }}
    >
      {ripples.map(r => (
        <span key={r.id} style={{
          position: 'absolute', left: r.x, top: r.y,
          width: 10, height: 10, borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.4)',
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
// GHOST BUTTON
// ─────────────────────────────────────────
const GhostButton = ({ onClick, children, style = {} }) => (
  <button onClick={onClick}
    style={{
      background: 'none', border: '1px solid #2a2d35',
      borderRadius: 12, padding: '12px 28px',
      color: '#6b7280', fontSize: 13,
      fontFamily: 'monospace', cursor: 'pointer',
      transition: 'all 0.2s ease', letterSpacing: 1,
      ...style,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = '#6b7280'
      e.currentTarget.style.color = '#f1f5f9'
      e.currentTarget.style.transform = 'scale(1.03)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = '#2a2d35'
      e.currentTarget.style.color = '#6b7280'
      e.currentTarget.style.transform = 'scale(1)'
    }}
  >{children}</button>
)

// ─────────────────────────────────────────
// SESSION CARD
// ─────────────────────────────────────────
const SessionCard = ({ session }) => {
  const c = { Fully: '#10b981', Mostly: '#06b6d4', 'Not really': '#f59e0b' }[session.focusRating]
  return (
    <div style={{
      backgroundColor: '#111318', border: `1px solid ${c}25`,
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', gap: 18, alignItems: 'flex-start',
      transition: 'border-color 0.2s ease, transform 0.2s ease',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${c}60`; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${c}25`; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${c}15`, border: `2px solid ${c}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'monospace', fontSize: 15, fontWeight: 900, color: c,
      }}>#{session.sessionNumber}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            fontSize: 12, fontFamily: 'monospace', color: c,
            background: `${c}15`, padding: '4px 10px',
            borderRadius: 7, border: `1px solid ${c}30`, fontWeight: 700,
          }}>{session.focusRating}</span>
          <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#4b5563' }}>
            {session.duration} min
          </span>
        </div>
        <p style={{
          fontSize: 14, color: session.reflection ? '#94a3b8' : '#374151',
          fontStyle: session.reflection ? 'normal' : 'italic',
          margin: 0, lineHeight: 1.6,
        }}>
          {session.reflection ? `"${session.reflection}"` : 'No reflection written.'}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// TAB WARNING
// ─────────────────────────────────────────
const TabWarning = ({ visible }) => {
  if (!visible) return null
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      backgroundColor: '#f97316', padding: '14px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'slideDown 0.3s ease',
    }}>
      <span style={{ color: '#000', fontWeight: 900, fontSize: 15, fontFamily: 'monospace', letterSpacing: 1 }}>
        ⚡ You left. Come back. The session is still running.
      </span>
    </div>
  )
}

// ─────────────────────────────────────────
// BACK BUTTON
// ─────────────────────────────────────────
const BackButton = ({ onClick }) => (
  <button onClick={onClick}
    style={{
      position: 'fixed', top: 20, left: 20, zIndex: 999,
      background: 'none', border: '1px solid #2a2d35',
      borderRadius: 10, padding: '8px 18px',
      color: '#4b5563', fontSize: 12,
      fontFamily: 'monospace', cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: 6,
      transition: 'all 0.2s ease', letterSpacing: 1,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.color = '#f1f5f9'
      e.currentTarget.style.borderColor = '#6b7280'
      e.currentTarget.style.transform = 'translateX(-2px)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.color = '#4b5563'
      e.currentTarget.style.borderColor = '#2a2d35'
      e.currentTarget.style.transform = 'translateX(0)'
    }}
  >
    ← HOME
  </button>
)

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
export default function OfflineStudy() {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { todaySessions } = useSelector((s) => s.studySession)

  const [phase, setPhase]               = useState('idle')
  const [elapsed, setElapsed]           = useState(0)
  const [breakElapsed, setBreakElapsed] = useState(0)
  const [reflectionText, setReflectionText] = useState('')
  const [focusRating, setFocusRating]       = useState(null)
  const [reflectionResponse, setReflectionResponse] = useState('')
  const [saving, setSaving]             = useState(false)
  const [currentMsg, setCurrentMsg]     = useState('')
  const [msgVisible, setMsgVisible]     = useState(false)
  const [tabWarning, setTabWarning]     = useState(false)

  const timerRef  = useRef(null)
  const breakRef  = useRef(null)
  const msgRef    = useRef(null)
  const msgTO     = useRef(null)

  const color         = getColor(elapsed, SESSION_DURATION)
  const totalFocusMin = todaySessions.reduce((a, s) => a + s.duration, 0)

  useEffect(() => { dispatch(fetchTodaySessions()) }, [dispatch])

  useEffect(() => {
    const fn = () => {
      if (document.hidden && phase === 'session') {
        setTabWarning(true)
        setTimeout(() => setTabWarning(false), 4000)
      }
    }
    document.addEventListener('visibilitychange', fn)
    return () => document.removeEventListener('visibilitychange', fn)
  }, [phase])

  useEffect(() => {
    if (phase !== 'session') { clearInterval(timerRef.current); return }
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= SESSION_DURATION) {
          clearInterval(timerRef.current)
          setPhase('reflection')
          return SESSION_DURATION
        }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [phase])

  useEffect(() => {
    if (phase !== 'break') { clearInterval(breakRef.current); return }
    setBreakElapsed(0)
    breakRef.current = setInterval(() => {
      setBreakElapsed(prev => {
        if (prev + 1 >= BREAK_DURATION) {
          clearInterval(breakRef.current)
          startNext()
          return BREAK_DURATION
        }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(breakRef.current)
  }, [phase])

  useEffect(() => {
    if (phase !== 'session') {
      clearInterval(msgRef.current)
      clearTimeout(msgTO.current)
      setMsgVisible(false)
      return
    }
    const show = () => {
      const msg = INSTRUCTOR_MESSAGES[Math.floor(Math.random() * INSTRUCTOR_MESSAGES.length)]
      setCurrentMsg(msg)
      setMsgVisible(true)
      msgTO.current = setTimeout(() => setMsgVisible(false), 5000)
    }
    const first = setTimeout(show, 60000)
    msgRef.current = setInterval(show, 5 * 60000)
    return () => { clearTimeout(first); clearInterval(msgRef.current); clearTimeout(msgTO.current) }
  }, [phase])

  const startSession = () => { setElapsed(0); setPhase('session') }
  const startNext    = useCallback(() => { setElapsed(0); setPhase('session') }, [])

  const submitReflection = async () => {
    if (!focusRating) return
    setSaving(true)
    await dispatch(saveSession({
      duration: Math.round(SESSION_DURATION / 60),
      reflection: reflectionText.trim(),
      focusRating,
    }))
    setReflectionResponse(FOCUS_RESPONSES[focusRating])
    setSaving(false)
    setTimeout(() => {
      const next = todaySessions.length + 1
      setReflectionText(''); setFocusRating(null); setReflectionResponse('')
      if (next >= 4) setPhase('summary')
      else setPhase('break')
    }, 2800)
  }

  const endAll = () => {
    clearInterval(timerRef.current)
    clearInterval(breakRef.current)
    setPhase('summary')
  }

  const resetAll = () => {
    setPhase('idle'); setElapsed(0); setBreakElapsed(0)
    setReflectionText(''); setFocusRating(null); setReflectionResponse('')
    dispatch(fetchTodaySessions())
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: '#0a0a0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      overflowY: 'auto',
    }}>
      <style>{`
        @keyframes glowPulse {
          0%,100% { opacity:0.6; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.18); }
        }
        @keyframes eyeGlow {
          0%,100% { box-shadow: 0 0 24px rgba(249,115,22,0.2); }
          50%      { box-shadow: 0 0 40px rgba(249,115,22,0.45); }
        }
        @keyframes flashIn {
          0%   { opacity:0; transform:translateX(-50%) scale(0.85); }
          60%  { opacity:1; transform:translateX(-50%) scale(1.04); }
          100% { transform:translateX(-50%) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes slideDown {
          from { transform:translateY(-100%); }
          to   { transform:translateY(0); }
        }
        @keyframes breathe {
          0%,100% { transform:scale(1); }
          50%      { transform:scale(1.006); }
        }
        @keyframes rippleOut {
          to { transform:translate(-50%,-50%) scale(28); opacity:0; }
        }
        textarea { outline: none !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:#0a0a0f; }
        ::-webkit-scrollbar-thumb { background:#1e2028; border-radius:4px; }
      `}</style>

      <TabWarning visible={tabWarning} />

      {/* ══════════════════════════
          IDLE
      ══════════════════════════ */}
      {phase === 'idle' && (
        <div style={{
          textAlign: 'center', width: '100%',
          padding: '80px 24px 60px',
          animation: 'fadeUp 0.8s ease',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
        }}>
          <BackButton onClick={() => navigate('/')} />

          {/* Eye */}
          <div style={{ marginBottom: 32 }}>
            <WatchingEye color="#f97316" />
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(42px, 7vw, 88px)',
            fontWeight: 900, color: '#f1f5f9',
            margin: '0 0 8px', letterSpacing: -3, lineHeight: 1,
          }}>Offline Study</h1>

          <p style={{
            fontSize: 'clamp(12px, 1.4vw, 15px)',
            color: '#2a2d35', fontFamily: 'monospace',
            margin: '0 0 32px', letterSpacing: 3, textTransform: 'uppercase',
          }}>{todayLabel()}</p>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 20px)',
            color: '#374151', lineHeight: 2,
            margin: '0 0 48px', maxWidth: 440,
          }}>
            Put the phone down.<br />
            Open the book.<br />
            25 minutes. Just you and the material.
          </p>

          {/* Today stats */}
          {todaySessions.length > 0 && (
            <div style={{
              display: 'flex', gap: 'clamp(24px,5vw,64px)',
              marginBottom: 48,
              padding: 'clamp(16px,2.5vw,28px) clamp(32px,5vw,64px)',
              backgroundColor: '#111318',
              border: '1px solid #1e2028', borderRadius: 20,
            }}>
              {[
                { label: 'Sessions Today',  value: todaySessions.length, color: '#f97316' },
                { label: 'Minutes Focused', value: totalFocusMin,        color: '#06b6d4' },
                { label: 'Fully Focused',   value: todaySessions.filter(s => s.focusRating === 'Fully').length, color: '#10b981' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <p style={{
                    fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900,
                    fontFamily: 'monospace', margin: 0, lineHeight: 1,
                  }}>
                    <AnimatedNumber value={s.value} color={s.color} />
                  </p>
                  <p style={{
                    fontSize: 11, color: '#374151', fontFamily: 'monospace',
                    margin: '8px 0 0', letterSpacing: 2, textTransform: 'uppercase',
                  }}>{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── BEGIN BUTTON ── */}
          <RippleButton
            onClick={startSession}
            color="#f97316"
            textColor="#000"
            style={{
              borderRadius: 18,
              padding: 'clamp(16px,2.5vw,22px) clamp(56px,8vw,96px)',
              fontSize: 'clamp(16px,2.2vw,22px)',
              fontWeight: 900, letterSpacing: 2,
              boxShadow: '0 0 60px rgba(249,115,22,0.35)',
            }}
          >
            BEGIN SESSION
          </RippleButton>

          {/* ── BOTTOM LINKS — always visible ── */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 12, marginTop: 28,
          }}>

            {/* View today's sessions — only if sessions exist */}
            {todaySessions.length > 0 && (
              <button
                onClick={() => setPhase('summary')}
                style={{
                  background: 'none', border: 'none',
                  color: '#374151', fontSize: 12,
                  fontFamily: 'monospace', cursor: 'pointer',
                  letterSpacing: 3, textTransform: 'uppercase',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
                onMouseLeave={e => e.currentTarget.style.color = '#374151'}
              >
                View Today's Sessions →
              </button>
            )}

            {/* ── VIEW ALL HISTORY — always visible ── */}
            <button
              onClick={() => navigate('/study-history')}
              style={{
                background: 'none',
                border: '1px solid #1e2028',
                borderRadius: 10,
                padding: '10px 28px',
                color: '#2a2d35', fontSize: 11,
                fontFamily: 'monospace', cursor: 'pointer',
                letterSpacing: 3, textTransform: 'uppercase',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#94a3b8'
                e.currentTarget.style.borderColor = '#4b5563'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = '#2a2d35'
                e.currentTarget.style.borderColor = '#1e2028'
              }}
            >
              📅 View All History →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════
          SESSION
      ══════════════════════════ */}
      {phase === 'session' && (
        <div style={{
          position: 'relative', width: '100%', height: '100vh',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <Particles color={color.primary} active={true} />
          <FlashMessage msg={currentMsg} visible={msgVisible} color={color.secondary} />

          <div style={{ position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 5 }}>
            <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#2a2d35', textTransform: 'uppercase', letterSpacing: 6, margin: 0 }}>
              Session {todaySessions.length + 1} of 4
            </p>
          </div>

          <div style={{ position: 'absolute', top: 24, left: 28, zIndex: 5 }}>
            <WatchingEye color={color.primary} />
          </div>

          <div style={{ animation: 'breathe 5s ease-in-out infinite', position: 'relative', zIndex: 2 }}>
            <HugeClock elapsed={elapsed} total={SESSION_DURATION} color={color} isBreak={false} />
          </div>

          <div style={{ position: 'absolute', bottom: 28, left: 28, zIndex: 5 }}>
            <p style={{ fontSize: 10, color: '#1e2028', fontFamily: 'monospace', letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
              {todaySessions.length} done today
            </p>
          </div>

          <div style={{ position: 'absolute', bottom: 24, right: 28, zIndex: 5 }}>
            <GhostButton onClick={endAll} style={{ fontSize: 11, padding: '8px 20px' }}>
              END SESSION
            </GhostButton>
          </div>
        </div>
      )}

      {/* ══════════════════════════
          REFLECTION
      ══════════════════════════ */}
      {phase === 'reflection' && (
        <div style={{
          position: 'absolute', inset: 0,
          overflowY: 'auto',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          padding: '60px 24px 60px', boxSizing: 'border-box',
        }}>
          <div style={{ width: '100%', maxWidth: 680, animation: 'fadeUp 0.5s ease' }}>

            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#f97316', textTransform: 'uppercase', letterSpacing: 6, margin: '0 0 12px' }}>
                Session {todaySessions.length + 1} · Complete
              </p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#f1f5f9', margin: 0 }}>
                Take a moment.
              </h2>
            </div>

            {reflectionResponse ? (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(32px,5vw,60px) clamp(24px,4vw,48px)',
                background: '#0f0f14', border: '1px solid #1e2028',
                borderRadius: 24, animation: 'fadeUp 0.4s ease',
              }}>
                <p style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', color: '#94a3b8', fontStyle: 'italic', margin: 0, lineHeight: 1.7 }}>
                  "{reflectionResponse}"
                </p>
              </div>
            ) : (
              <div style={{
                background: '#0d0d12', border: '1px solid #1e2028',
                borderRadius: 24, padding: 'clamp(24px,4vw,40px)',
                display: 'flex', flexDirection: 'column', gap: 'clamp(20px,3vw,32px)',
              }}>
                <div>
                  <p style={{ fontSize: 'clamp(14px,1.8vw,18px)', color: '#6b7280', margin: '0 0 14px', fontWeight: 600 }}>
                    What did you actually do just now?
                  </p>
                  <textarea
                    value={reflectionText}
                    onChange={e => setReflectionText(e.target.value)}
                    placeholder="I read chapter 3, solved 5 problems..."
                    rows={5}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      backgroundColor: '#111318', border: '1px solid #1e2028',
                      borderRadius: 14, padding: 'clamp(14px,2vw,20px) clamp(16px,2vw,22px)',
                      color: '#f1f5f9', fontSize: 'clamp(14px,1.6vw,17px)',
                      resize: 'vertical', outline: 'none',
                      fontFamily: 'system-ui, sans-serif',
                      lineHeight: 1.7, caretColor: '#f97316',
                      transition: 'border-color 0.2s ease',
                    }}
                    onFocus={e => e.target.style.borderColor = '#f97316'}
                    onBlur={e => e.target.style.borderColor = '#1e2028'}
                  />
                </div>

                <div>
                  <p style={{ fontSize: 'clamp(14px,1.8vw,18px)', color: '#6b7280', margin: '0 0 16px', fontWeight: 600 }}>
                    Did you stay focused?
                  </p>
                  <div style={{ display: 'flex', gap: 14 }}>
                    {[
                      { label: 'Fully',      color: '#10b981' },
                      { label: 'Mostly',     color: '#06b6d4' },
                      { label: 'Not really', color: '#f59e0b' },
                    ].map(({ label, color: c }) => {
                      const sel = focusRating === label
                      return (
                        <button key={label} onClick={() => setFocusRating(label)}
                          style={{
                            flex: 1, padding: 'clamp(14px,1.8vw,20px) 8px',
                            borderRadius: 14,
                            border: `2px solid ${sel ? c : '#1e2028'}`,
                            backgroundColor: sel ? `${c}20` : '#111318',
                            color: sel ? c : '#4b5563',
                            fontSize: 'clamp(14px,1.5vw,17px)',
                            fontWeight: 800, cursor: 'pointer',
                            transition: 'all 0.15s ease', fontFamily: 'monospace',
                            boxShadow: sel ? `0 0 24px ${c}30` : 'none', letterSpacing: 1,
                          }}
                          onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = c; e.currentTarget.style.color = c } }}
                          onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = '#1e2028'; e.currentTarget.style.color = '#4b5563' } }}
                        >{label}</button>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={submitReflection}
                  disabled={!focusRating || saving}
                  style={{
                    backgroundColor: focusRating ? '#f97316' : '#1a1d24',
                    color: focusRating ? '#000' : '#374151',
                    border: focusRating ? 'none' : '1px solid #2a2d35',
                    borderRadius: 14, padding: 'clamp(16px,2vw,22px)',
                    fontSize: 'clamp(15px,1.6vw,18px)', fontWeight: 900,
                    cursor: focusRating ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    boxShadow: focusRating ? '0 0 40px rgba(249,115,22,0.3)' : 'none',
                    letterSpacing: 1,
                  }}
                  onMouseEnter={e => { if (focusRating) e.currentTarget.style.transform = 'scale(1.02)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {saving ? 'Saving...' : '✓ Submit Reflection'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════
          BREAK
      ══════════════════════════ */}
      {phase === 'break' && (
        <div style={{
          width: '100%', height: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 'clamp(20px,3vw,32px)',
          animation: 'fadeUp 0.5s ease',
        }}>
          <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#2a2d35', textTransform: 'uppercase', letterSpacing: 6, margin: 0 }}>
            Break Time
          </p>
          <HugeClock elapsed={breakElapsed} total={BREAK_DURATION}
            color={{ primary: '#2a2d35', secondary: '#374151', glow: 'rgba(42,45,53,0.1)' }} isBreak={true} />
          <p style={{ fontSize: 'clamp(14px, 2vw, 20px)', color: '#2a2d35', fontFamily: 'monospace', margin: 0, letterSpacing: 3 }}>
            Step away. Come back fresh.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <RippleButton
              onClick={() => { clearInterval(breakRef.current); startNext() }}
              color="#f97316" textColor="#000"
              style={{
                borderRadius: 14,
                padding: 'clamp(14px,2vw,18px) clamp(32px,5vw,52px)',
                fontSize: 'clamp(14px,1.8vw,17px)',
                fontWeight: 900, letterSpacing: 1,
                boxShadow: '0 0 36px rgba(249,115,22,0.25)',
              }}
            >Start Next Session</RippleButton>
            <GhostButton onClick={endAll}>End for today</GhostButton>
          </div>
        </div>
      )}

      {/* ══════════════════════════
          SUMMARY
      ══════════════════════════ */}
      {phase === 'summary' && (
        <div style={{
          width: '100%', minHeight: '100vh',
          padding: 'clamp(60px,6vw,90px) clamp(20px,5vw,60px)',
          boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          animation: 'fadeUp 0.6s ease',
        }}>
          <div style={{ width: '100%', maxWidth: 720 }}>

            <BackButton onClick={() => navigate('/')} />

            <div style={{ textAlign: 'center', marginBottom: 'clamp(36px,5vw,60px)' }}>
              <p style={{ fontSize: 11, fontFamily: 'monospace', color: '#f97316', textTransform: 'uppercase', letterSpacing: 6, margin: '0 0 16px' }}>
                Today's Summary
              </p>
              <h2 style={{ fontSize: 'clamp(36px,6vw,72px)', fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px', letterSpacing: -2 }}>
                {todaySessions.length} Session{todaySessions.length !== 1 ? 's' : ''} Done
              </h2>
              <p style={{ color: '#374151', fontFamily: 'monospace', fontSize: 'clamp(13px,1.5vw,16px)', margin: 0, letterSpacing: 2 }}>
                {totalFocusMin} minutes of focused work today
              </p>
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: 'clamp(12px,2vw,20px)', marginBottom: 'clamp(32px,4vw,52px)',
            }}>
              {[
                { label: 'Total Sessions',  value: todaySessions.length, color: '#f97316' },
                { label: 'Minutes Focused', value: totalFocusMin,        color: '#06b6d4' },
                { label: 'Fully Focused',   value: todaySessions.filter(s => s.focusRating === 'Fully').length, color: '#10b981' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: '#111318', border: `1px solid ${s.color}30`,
                  borderRadius: 20, padding: 'clamp(24px,3.5vw,40px) clamp(16px,2vw,24px)',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, border-color 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = `${s.color}60` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = `${s.color}30` }}
                >
                  <p style={{ fontSize: 'clamp(40px,6vw,72px)', fontWeight: 900, fontFamily: 'monospace', margin: '0 0 10px', lineHeight: 1 }}>
                    <AnimatedNumber value={s.value} color={s.color} />
                  </p>
                  <p style={{ fontSize: 11, color: '#374151', fontFamily: 'monospace', margin: 0, letterSpacing: 2, textTransform: 'uppercase' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {todaySessions.length > 0 && (
              <>
                <p style={{ fontSize: 11, color: '#2a2d35', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 4, margin: '0 0 16px' }}>
                  Session Notes
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(10px,1.5vw,14px)', marginBottom: 'clamp(28px,4vw,44px)' }}>
                  {todaySessions.map(s => <SessionCard key={s._id} session={s} />)}
                </div>
              </>
            )}

            {todaySessions.length > 0 && (
              <div style={{
                textAlign: 'center',
                padding: 'clamp(24px,3.5vw,40px)',
                background: 'linear-gradient(135deg, #0f0a05 0%, #0a0a0f 100%)',
                border: '1px solid #f97316', borderRadius: 20,
                marginBottom: 'clamp(28px,4vw,44px)',
                boxShadow: '0 0 40px rgba(249,115,22,0.08)',
              }}>
                <p style={{ color: '#f97316', fontSize: 'clamp(16px,2.2vw,24px)', fontStyle: 'italic', margin: 0, lineHeight: 1.7 }}>
                  {totalFocusMin >= 100 ? '"You put in real work today. That compounds."'
                    : totalFocusMin >= 50 ? '"More than most. Build on this."'
                    : '"You showed up. That\'s the first step."'}
                </p>
              </div>
            )}

            {/* ── Action buttons ── */}
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <RippleButton
                onClick={resetAll}
                color="#f97316" textColor="#000"
                style={{
                  borderRadius: 14,
                  padding: 'clamp(14px,2vw,20px) clamp(36px,5vw,60px)',
                  fontSize: 'clamp(14px,1.8vw,18px)',
                  fontWeight: 900, letterSpacing: 1,
                  boxShadow: '0 0 40px rgba(249,115,22,0.25)',
                }}
              >Start New Session</RippleButton>

              {/* ── VIEW ALL HISTORY button in summary ── */}
              <GhostButton onClick={() => navigate('/study-history')}>
                📅 All History
              </GhostButton>

              <GhostButton onClick={() => navigate('/')}>
                ← Back to Home
              </GhostButton>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}