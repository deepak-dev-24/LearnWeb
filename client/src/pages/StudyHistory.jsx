// src/pages/StudyHistory.jsx

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchHistory, fetchTodaySessions } from '../features/studySession/studySessionSlice'
import { FiArrowLeft, FiCalendar, FiClock, FiZap, FiCheckCircle, FiBook } from 'react-icons/fi'

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })
}

const formatShortDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  })
}

const focusColor = (rating) => {
  if (rating === 'Fully') return '#10b981'
  if (rating === 'Mostly') return '#06b6d4'
  return '#f59e0b'
}

const focusEmoji = (rating) => {
  if (rating === 'Fully') return '🔥'
  if (rating === 'Mostly') return '💪'
  return '🌱'
}

const getDayMessage = (sessions) => {
  const fullyCount = sessions.filter(s => s.focusRating === 'Fully').length
  const total = sessions.length
  const totalMin = sessions.reduce((a, s) => a + s.duration, 0)

  if (fullyCount === total) return 'Perfect day. Every session was fully focused.'
  if (totalMin >= 100) return 'Deep work day. You put in serious time.'
  if (totalMin >= 50) return 'Solid effort. More than most people.'
  return 'You showed up. That always counts.'
}

// ─────────────────────────────────────────
// SESSION CARD
// ─────────────────────────────────────────
const SessionCard = ({ session, index }) => {
  const [expanded, setExpanded] = useState(false)
  const color = focusColor(session.focusRating)

  return (
    <div
      className="transition-all duration-300"
      style={{
        backgroundColor: '#1a1d24',
        border: `1px solid ${expanded ? color + '60' : '#2a2d35'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'border-color 0.3s ease',
      }}
    >
      {/* Card Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '16px 20px', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 16,
        }}
      >
        {/* Session number */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          backgroundColor: `${color}15`,
          border: `1.5px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace', fontSize: 15, fontWeight: 900, color,
        }}>
          #{index + 1}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <span style={{
              fontSize: 12, fontFamily: 'monospace',
              backgroundColor: `${color}15`,
              border: `1px solid ${color}30`,
              color, padding: '3px 10px', borderRadius: 8,
              fontWeight: 700,
            }}>
              {focusEmoji(session.focusRating)} {session.focusRating}
            </span>
            <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#4b5563' }}>
              {session.duration} min
            </span>
          </div>
          <p style={{
            margin: 0, fontSize: 13, color: '#6b7280',
            fontFamily: 'monospace',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '90%',
          }}>
            {session.reflection
              ? `"${session.reflection}"`
              : 'No reflection written'}
          </p>
        </div>

        {/* Expand icon */}
        <span style={{
          color: '#374151', fontSize: 12,
          transition: 'transform 0.3s ease',
          transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'block',
        }}>▼</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: `1px solid ${color}20`,
          paddingTop: 16,
          animation: 'fadeIn 0.3s ease',
        }}>
          {session.reflection ? (
            <div style={{
              backgroundColor: '#22252e',
              border: `1px solid ${color}25`,
              borderRadius: 12, padding: '14px 18px',
              marginBottom: 12,
            }}>
              <p style={{
                fontSize: 11, fontFamily: 'monospace',
                color: color, margin: '0 0 8px',
                textTransform: 'uppercase', letterSpacing: 2,
              }}>
                📝 What I did
              </p>
              <p style={{
                fontSize: 14, color: '#94a3b8',
                margin: 0, lineHeight: 1.7,
                fontStyle: 'italic',
              }}>
                "{session.reflection}"
              </p>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#22252e',
              borderRadius: 12, padding: '14px 18px',
              marginBottom: 12,
            }}>
              <p style={{ fontSize: 13, color: '#374151', margin: 0, fontStyle: 'italic' }}>
                No reflection was written for this session.
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              flex: 1, backgroundColor: '#22252e',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <p style={{ fontSize: 10, color: '#374151', fontFamily: 'monospace', margin: '0 0 4px', letterSpacing: 2, textTransform: 'uppercase' }}>Duration</p>
              <p style={{ fontSize: 16, fontWeight: 900, color: '#06b6d4', fontFamily: 'monospace', margin: 0 }}>{session.duration} min</p>
            </div>
            <div style={{
              flex: 1, backgroundColor: '#22252e',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <p style={{ fontSize: 10, color: '#374151', fontFamily: 'monospace', margin: '0 0 4px', letterSpacing: 2, textTransform: 'uppercase' }}>Focus</p>
              <p style={{ fontSize: 16, fontWeight: 900, color, fontFamily: 'monospace', margin: 0 }}>{session.focusRating}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// DAY CARD — groups sessions by date
// ─────────────────────────────────────────
const DayCard = ({ date, sessions }) => {
  const [expanded, setExpanded] = useState(false)
  const totalMin = sessions.reduce((a, s) => a + s.duration, 0)
  const fullyCount = sessions.filter(s => s.focusRating === 'Fully').length
  const isToday = formatDate(date) === 'Today'

  return (
    <div style={{
      backgroundColor: '#111318',
      border: isToday ? '1px solid #06b6d440' : '1px solid #1e2028',
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 16,
    }}>
      {/* Day Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', background: 'none', border: 'none',
          padding: '20px 24px', cursor: 'pointer', textAlign: 'left',
          display: 'flex', alignItems: 'center', gap: 16,
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1a1d24'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        {/* Date block */}
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          backgroundColor: isToday ? '#06b6d415' : '#1a1d24',
          border: isToday ? '1.5px solid #06b6d440' : '1px solid #2a2d35',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <FiCalendar style={{ color: isToday ? '#06b6d4' : '#374151', fontSize: 18 }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h3 style={{
              margin: 0, fontSize: 16, fontWeight: 800,
              color: isToday ? '#06b6d4' : '#f1f5f9',
            }}>
              {formatDate(date)}
            </h3>
            {isToday && (
              <span style={{
                fontSize: 10, fontFamily: 'monospace',
                backgroundColor: '#06b6d415',
                border: '1px solid #06b6d430',
                color: '#06b6d4',
                padding: '2px 8px', borderRadius: 6,
                letterSpacing: 2,
              }}>TODAY</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: 12, color: '#374151', fontFamily: 'monospace' }}>
            {formatShortDate(date)}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#f97316', fontFamily: 'monospace' }}>
              {sessions.length}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#374151', fontFamily: 'monospace', letterSpacing: 1 }}>
              sessions
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#06b6d4', fontFamily: 'monospace' }}>
              {totalMin}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#374151', fontFamily: 'monospace', letterSpacing: 1 }}>
              minutes
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#10b981', fontFamily: 'monospace' }}>
              {fullyCount}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: '#374151', fontFamily: 'monospace', letterSpacing: 1 }}>
              fully
            </p>
          </div>

          {/* Expand icon */}
          <span style={{
            color: '#374151', fontSize: 12,
            transition: 'transform 0.3s ease',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            marginLeft: 8,
          }}>▼</span>
        </div>
      </button>

      {/* Progress bar */}
      <div style={{ padding: '0 24px 16px' }}>
        <div style={{ height: 2, backgroundColor: '#1e2028', borderRadius: 2 }}>
          <div style={{
            height: 2, borderRadius: 2,
            width: `${Math.min((totalMin / 100) * 100, 100)}%`,
            backgroundColor: isToday ? '#06b6d4' : '#f97316',
            transition: 'width 1s ease',
          }} />
        </div>
        <p style={{
          margin: '8px 0 0', fontSize: 11,
          color: '#2a2d35', fontFamily: 'monospace',
          fontStyle: 'italic',
        }}>
          "{getDayMessage(sessions)}"
        </p>
      </div>

      {/* Expanded sessions */}
      {expanded && (
        <div style={{
          padding: '0 16px 16px',
          borderTop: '1px solid #1e2028',
          paddingTop: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {sessions.map((session, i) => (
            <SessionCard key={session._id} session={session} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────
export default function StudyHistory() {
  const dispatch = useDispatch()
  const { history, todaySessions, loading } = useSelector((s) => s.studySession)
  const [activeTab, setActiveTab] = useState('history')

  useEffect(() => {
    dispatch(fetchHistory())
    dispatch(fetchTodaySessions())
  }, [dispatch])

  // history is an object grouped by date from backend
  // Convert to array of { date, sessions }
  const historyDays = Object.entries(history || {})
    .map(([date, sessions]) => ({ date, sessions }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const totalSessions = historyDays.reduce((a, d) => a + d.sessions.length, 0)
  const totalMinutes  = historyDays.reduce((a, d) => a + d.sessions.reduce((b, s) => b + s.duration, 0), 0)
  const totalDays     = historyDays.length
  const fullySessions = historyDays.reduce((a, d) => a + d.sessions.filter(s => s.focusRating === 'Fully').length, 0)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d0f14', padding: '32px 16px' }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* ── Back Button ── */}
        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#6b7280', fontSize: 13, fontFamily: 'monospace',
            textDecoration: 'none', marginBottom: 32,
            padding: '10px 18px',
            backgroundColor: '#1a1d24',
            border: '1px solid #2a2d35',
            borderRadius: 12,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = '#4b5563' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2a2d35' }}
        >
          ← Back
        </Link>

        {/* ── Header ── */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              backgroundColor: '#f97316', animation: 'pulse 2s infinite',
            }} />
            <p style={{
              fontSize: 11, fontFamily: 'monospace', color: '#374151',
              textTransform: 'uppercase', letterSpacing: 4, margin: 0,
            }}>offline study · journal</p>
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 900, color: '#f1f5f9',
            margin: '0 0 8px', letterSpacing: -1,
          }}>Study History</h1>
          <p style={{ color: '#374151', fontSize: 14, fontFamily: 'monospace', margin: 0 }}>
            Every session you've ever completed. All your reflections.
          </p>
        </div>

        {/* ── Overall Stats ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12, marginBottom: 32,
        }}>
          {[
            { label: 'Total Sessions',  value: totalSessions, color: '#f97316', icon: '⚡' },
            { label: 'Minutes Studied', value: totalMinutes,  color: '#06b6d4', icon: '⏱️' },
            { label: 'Days Studied',    value: totalDays,     color: '#a855f7', icon: '📅' },
            { label: 'Fully Focused',   value: fullySessions, color: '#10b981', icon: '🔥' },
          ].map((s, i) => (
            <div key={i} style={{
              backgroundColor: '#1a1d24',
              border: `1px solid ${s.color}25`,
              borderRadius: 16, padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <p style={{
                  fontSize: 'clamp(24px, 4vw, 36px)',
                  fontWeight: 900, color: s.color,
                  fontFamily: 'monospace', margin: 0, lineHeight: 1,
                }}>{s.value}</p>
                <p style={{
                  fontSize: 11, color: '#374151',
                  fontFamily: 'monospace', margin: '4px 0 0',
                  textTransform: 'uppercase', letterSpacing: 1,
                }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 24,
          backgroundColor: '#1a1d24',
          border: '1px solid #2a2d35',
          borderRadius: 14, padding: 4,
        }}>
          {[
            { key: 'history', label: '📅 All Days' },
            { key: 'today',   label: '⚡ Today' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: '10px 16px',
                borderRadius: 10, border: 'none',
                backgroundColor: activeTab === tab.key ? '#f97316' : 'transparent',
                color: activeTab === tab.key ? '#000' : '#6b7280',
                fontSize: 13, fontWeight: 700,
                fontFamily: 'monospace', cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === tab.key ? '0 0 20px rgba(249,115,22,0.25)' : 'none',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '2px solid #1e2028',
              borderTopColor: '#f97316',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        )}

        {/* ── Today Tab ── */}
        {!loading && activeTab === 'today' && (
          <div>
            {todaySessions.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 24px',
                backgroundColor: '#1a1d24',
                border: '1px dashed #2a2d35',
                borderRadius: 20,
              }}>
                <p style={{ fontSize: 48, margin: '0 0 16px' }}>📖</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px' }}>
                  No sessions today yet
                </p>
                <p style={{ fontSize: 13, color: '#374151', margin: '0 0 24px' }}>
                  Start your first offline study session
                </p>
                <Link to="/offline-study" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  backgroundColor: '#f97316', color: '#000',
                  padding: '12px 28px', borderRadius: 12,
                  fontWeight: 900, fontSize: 14, textDecoration: 'none',
                }}>
                  ▶ Begin Session
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Today summary */}
                <div style={{
                  backgroundColor: '#1a1d24',
                  border: '1px solid #f9741640',
                  borderRadius: 16, padding: '16px 20px',
                  marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 16,
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, color: '#f97316', fontFamily: 'monospace', marginBottom: 4 }}>
                      Today's Progress
                    </p>
                    <p style={{ margin: 0, fontSize: 11, color: '#374151', fontFamily: 'monospace' }}>
                      {getDayMessage(todaySessions)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 20 }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#f97316', fontFamily: 'monospace' }}>
                        {todaySessions.length}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: '#374151', fontFamily: 'monospace' }}>sessions</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#06b6d4', fontFamily: 'monospace' }}>
                        {todaySessions.reduce((a, s) => a + s.duration, 0)}
                      </p>
                      <p style={{ margin: 0, fontSize: 10, color: '#374151', fontFamily: 'monospace' }}>minutes</p>
                    </div>
                  </div>
                </div>

                {todaySessions.map((session, i) => (
                  <SessionCard key={session._id} session={session} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── History Tab ── */}
        {!loading && activeTab === 'history' && (
          <div>
            {historyDays.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '60px 24px',
                backgroundColor: '#1a1d24',
                border: '1px dashed #2a2d35',
                borderRadius: 20,
              }}>
                <p style={{ fontSize: 48, margin: '0 0 16px' }}>📚</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', margin: '0 0 8px' }}>
                  No study history yet
                </p>
                <p style={{ fontSize: 13, color: '#374151', margin: '0 0 24px' }}>
                  Complete your first session to start building your journal
                </p>
                <Link to="/offline-study" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  backgroundColor: '#f97316', color: '#000',
                  padding: '12px 28px', borderRadius: 12,
                  fontWeight: 900, fontSize: 14, textDecoration: 'none',
                }}>
                  ▶ Start Studying
                </Link>
              </div>
            ) : (
              <div>
                {historyDays.map(({ date, sessions }) => (
                  <DayCard key={date} date={date} sessions={sessions} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Bottom CTA ── */}
        {!loading && (
          <div style={{
            marginTop: 32,
            display: 'flex', gap: 12, justifyContent: 'center',
          }}>
            <Link to="/offline-study" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backgroundColor: '#f97316', color: '#000',
              padding: '12px 28px', borderRadius: 12,
              fontWeight: 900, fontSize: 14, textDecoration: 'none',
              boxShadow: '0 0 30px rgba(249,115,22,0.25)',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              ▶ New Session
            </Link>
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              backgroundColor: '#1a1d24', color: '#6b7280',
              padding: '12px 24px', borderRadius: 12,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              border: '1px solid #2a2d35',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = '#4b5563' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2a2d35' }}
            >
              ← Home
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}