import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { fetchLectures } from '../features/lectures/lectureSlice'
import Layout from '../components/Layout'

export default function Lectures() {
  const { id } = useParams() // course id
  const dispatch = useDispatch()
  const { byCourseId, loading, error } = useSelector((s)=> s.lectures)
  const lectures = byCourseId[id] || []

  useEffect(()=>{ dispatch(fetchLectures(id)) }, [dispatch, id])

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#16161d] to-[#0a0a0f] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              to={`/courses/${id}`} 
              className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2 mb-4 transition-colors"
            >
              ← Back to Course
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Course Lectures
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Watch and learn at your own pace
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mb-4"></div>
              <p className="text-lg text-slate-400">Loading lectures...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border-2 border-red-500/50 text-red-400 px-6 py-4 rounded-xl shadow-lg mb-6">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && lectures.length === 0 && (
            <div className="text-center py-24 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border-2 border-slate-700 shadow-2xl">
              <div className="text-9xl mb-6 animate-bounce">🎬</div>
              <h3 className="text-3xl font-bold mb-4 text-slate-100">No Lectures Yet</h3>
              <p className="text-slate-400 text-xl max-w-md mx-auto mb-8">
                Lectures will appear here once the instructor adds them.
              </p>
              <Link 
                to={`/courses/${id}`}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-200"
              >
                Back to Course
              </Link>
            </div>
          )}

          {/* Lectures List */}
          {!loading && lectures.length > 0 && (
            <div className="space-y-4">
              {lectures.map((l, idx) => (
                <div 
                  key={l._id} 
                  className="group bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-slate-700 hover:border-cyan-500/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/20 hover:scale-[1.02]"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left: Lecture Number Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-xl">{idx + 1}</span>
                      </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/30">
                          LECTURE {idx + 1}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-400 transition-colors">
                        {l.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                        {l.description || 'Click play to start watching this lecture'}
                      </p>
                    </div>

                    {/* Right: Play Button */}
                    <div className="flex-shrink-0">
                      <Link 
                        to={`/courses/${id}/lectures/${l._id}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                        Play
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Stats */}
          {!loading && lectures.length > 0 && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700 px-6 py-3 rounded-xl">
                <span className="text-slate-400">Total Lectures:</span>
                <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {lectures.length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}