import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchFeed } from '../features/feed/feedSlice'
import { FiPlay, FiClock } from 'react-icons/fi'

const getYouTubeThumbnail = (url) => {
  if (!url) return null
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = match && match[7]?.length === 11 ? match[7] : null
  if (!videoId) return null
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

const timeAgo = (dateStr) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 30) return `${days} days ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

export default function Feed() {
  const dispatch = useDispatch()
  const { items, loading, error, } = useSelector((s) => s.feed)
  const [activeFilter, setActiveFilter] = useState('All')
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    dispatch(fetchFeed())
  }, [dispatch])

  // Build filter tags from unique folder names
  const folders = ['All', ...new Set(items.map(l => l.course?.title).filter(Boolean))]

  // Filter items
  const filtered = activeFilter === 'All'
    ? items
    : items.filter(l => l.course?.title === activeFilter)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f0f' }}>

      {/* ── Sticky Filter Bar ── */}
      <div
        className="sticky top-0 z-40 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto"
        style={{
          backgroundColor: '#0f0f0f',
          borderBottom: '1px solid #1a1a1a',
          scrollbarWidth: 'none',
        }}
      >
        <style>{`
          .filter-bar::-webkit-scrollbar { display: none; }
          .video-card:hover .thumb-img { transform: scale(1.05); }
        `}</style>

        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => setActiveFilter(folder)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: activeFilter === folder ? '#ffffff' : '#272727',
              color: activeFilter === folder ? '#000000' : '#ffffff',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {folder}
          </button>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            <p className="text-neutral-500 text-sm">Loading feed...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-lg mx-auto px-5 py-4 rounded-xl text-sm text-red-400"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid #3a1a1a' }}>
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-white font-bold text-lg mb-2">No videos found</p>
            <p className="text-neutral-500 text-sm max-w-xs mb-6">
              {activeFilter === 'All'
                ? 'Add lectures to your study folders and they\'ll appear here.'
                : `No lectures in "${activeFilter}" yet.`}
            </p>
            {activeFilter !== 'All' && (
              <button
                onClick={() => setActiveFilter('All')}
                className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ backgroundColor: '#272727', color: '#fff' }}
              >
                Show All
              </button>
            )}
          </div>
        )}

        {/* ── 3-column YouTube-style Grid ── */}
        {!loading && filtered.length > 0 && (
          <div
            className="grid gap-x-4 gap-y-8"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {filtered.map((lecture) => {
              const thumbnail = getYouTubeThumbnail(lecture.videoUrl)
              const courseId = lecture.course?._id
              const courseTitle = lecture.course?.title || 'Study Folder'
              const isHovered = hoveredId === lecture._id

              return (
                <Link
                  key={lecture._id}
                  to={`/courses/${courseId}/lectures/${lecture._id}`}
                  className="video-card flex flex-col cursor-pointer"
                  style={{ textDecoration: 'none' }}
                  onMouseEnter={() => setHoveredId(lecture._id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative w-full rounded-xl overflow-hidden"
                    style={{
                      aspectRatio: '16/9',
                      backgroundColor: '#272727',
                      transition: 'border-radius 0.2s ease',
                      borderRadius: isHovered ? '4px' : '12px',
                    }}
                  >
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={lecture.title}
                        className="thumb-img w-full h-full object-cover"
                        style={{
                          transition: 'transform 0.3s ease',
                          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: '#272727' }}>
                        <span className="text-5xl opacity-20">🎬</span>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-opacity duration-200"
                      style={{
                        backgroundColor: isHovered ? 'rgba(0,0,0,0.35)' : 'transparent',
                        opacity: isHovered ? 1 : 0,
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          transform: isHovered ? 'scale(1)' : 'scale(0.8)',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <FiPlay className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>

                    {/* Duration badge */}
                    <div
                      className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}
                    >
                      {lecture.durationSec
                        ? `${Math.floor(lecture.durationSec / 60)}:${String(lecture.durationSec % 60).padStart(2, '0')}`
                        : <span className="flex items-center gap-1"><FiClock className="w-2.5 h-2.5" /> Study</span>
                      }
                    </div>
                  </div>

                  {/* ── Info Row — exactly like YouTube ── */}
                  <div className="flex gap-3 mt-3 px-0">

                    {/* Channel avatar */}
                    <div
                      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-black mt-0.5"
                      style={{ backgroundColor: '#06b6d4', color: '#000' }}
                    >
                      {courseTitle.charAt(0).toUpperCase()}
                    </div>

                    {/* Text info */}
                    <div className="flex-1 min-w-0">

                      {/* Title — 2 lines max like YT */}
                      <h3
                        style={{
                          color: '#f1f1f1',
                          fontSize: '14px',
                          fontWeight: '600',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          marginBottom: '4px',
                        }}
                      >
                        {lecture.title}
                      </h3>

                      {/* Folder name — like channel */}
                      <p style={{ color: '#aaaaaa', fontSize: '13px', marginBottom: '2px' }}>
                        {courseTitle}
                      </p>

                      {/* Time ago */}
                      <p style={{ color: '#aaaaaa', fontSize: '13px' }}>
                        {timeAgo(lecture.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}