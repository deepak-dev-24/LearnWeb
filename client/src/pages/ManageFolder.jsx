import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCourse } from '../features/folder/folderSlice';
import { fetchLectures, updateLecture, deleteLecture } from '../features/lectures/lectureSlice';
import { api } from '../lib/api';
import Layout from '../components/Layout';
import {
  FiArrowLeft, FiPlus, FiEdit2, FiTrash2,
  FiPlay, FiVideo, FiAlertCircle, FiCheck
} from 'react-icons/fi';

export default function ManageCourse() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const { current: course } = useSelector((s) => s.courses);
  const { byCourseId: lecturesByCourse } = useSelector((s) => s.lectures);

  const lectures = lecturesByCourse[id] || [];

  const [showAddLecture, setShowAddLecture] = useState(false);
  const [showEditLecture, setShowEditLecture] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [lectureForm, setLectureForm] = useState({
    title: '', description: '', videoUrl: ''
  })
  const [addError, setAddError] = useState('')
  const [editError, setEditError] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchCourse(id));
    dispatch(fetchLectures(id));
  }, [dispatch, id]);

  // ── Redirect if not logged in
  if (!token) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d0f14' }}>
          <div className="text-center">
            <p className="text-slate-400 mb-4">You need to be logged in.</p>
            <Link to="/login" className="px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ backgroundColor: '#06b6d4', color: '#000' }}>
              Login
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  // ── Loading
  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4"
          style={{ backgroundColor: '#0d0f14' }}>
          <div className="w-10 h-10 border-2 border-slate-700 border-t-cyan-500 rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-mono">loading folder...</p>
        </div>
      </Layout>
    );
  }

  const handleAddLecture = async (e) => {
    e.preventDefault();
    setAddError('')
    setAddLoading(true)
    try {
      await api.post(`/courses/${id}/lectures`, {
        title: lectureForm.title,
        description: lectureForm.description,
        videoUrl: lectureForm.videoUrl
      });
      setShowAddLecture(false);
      setLectureForm({ title: '', description: '', videoUrl: '' });
      dispatch(fetchLectures(id));
    } catch (error) {
      setAddError(error.response?.data?.error || 'Failed to add lecture')
    } finally {
      setAddLoading(false)
    }
  };

  const handleUpdateLecture = async (e) => {
    e.preventDefault();
    setEditError('')
    setEditLoading(true)
    try {
      await dispatch(updateLecture({
        courseId: id,
        lectureId: editingLecture._id,
        data: {
          title: lectureForm.title,
          description: lectureForm.description,
          videoUrl: lectureForm.videoUrl
        }
      }));
      setShowEditLecture(false);
      setLectureForm({ title: '', description: '', videoUrl: '' });
      setEditingLecture(null);
      dispatch(fetchLectures(id));
    } catch (error) {
      setEditError(error.response?.data?.error || 'Failed to update lecture')
    } finally {
      setEditLoading(false)
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if (window.confirm('Delete this lecture? This cannot be undone.')) {
      try {
        await dispatch(deleteLecture({ courseId: id, lectureId }));
        dispatch(fetchLectures(id));
      } catch (error) {
        alert('Failed to delete lecture');
      }
    }
  };

  const openEditLecture = (lecture) => {
    setLectureForm({
      title: lecture.title,
      description: lecture.description || '',
      videoUrl: lecture.videoUrl || ''
    });
    setEditingLecture(lecture);
    setEditError('')
    setShowEditLecture(true);
  };

  const closeAdd = () => {
    setShowAddLecture(false)
    setLectureForm({ title: '', description: '', videoUrl: '' })
    setAddError('')
  }

  const closeEdit = () => {
    setShowEditLecture(false)
    setLectureForm({ title: '', description: '', videoUrl: '' })
    setEditingLecture(null)
    setEditError('')
  }

  return (
    <Layout>
      <div className="min-h-screen py-10 px-4" style={{ backgroundColor: '#0d0f14' }}>
        <div className="max-w-4xl mx-auto">

          {/* ── Back ── */}
          <Link
            to={`/courses/${id}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8 group"
          >
            <FiArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to folder
          </Link>

          {/* ── Header ── */}
          <div className="mb-8">
            <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-2">
              managing folder
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-1">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                {course.description}
              </p>
            )}
          </div>

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(6,182,212,0.15)' }}>
                <FiVideo className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">{lectures.length}</p>
                <p className="text-slate-500 text-xs">Total Lectures</p>
              </div>
            </div>
            <div className="rounded-2xl p-5 flex items-center gap-4"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(16,185,129,0.15)' }}>
                <FiCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-black text-white">
                  {lectures.filter(l => l.completedBy?.length > 0).length}
                </p>
                <p className="text-slate-500 text-xs">Lectures With Progress</p>
              </div>
            </div>
          </div>

          {/* ── Lectures Section ── */}
          <div className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>

            {/* Section header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: '1px solid #2a2d35' }}>
              <div>
                <p className="text-white font-bold text-base">Lectures</p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {lectures.length} lecture{lectures.length !== 1 ? 's' : ''} in this folder
                </p>
              </div>
              <button
                onClick={() => { setShowAddLecture(true); setAddError('') }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: '#06b6d4', color: '#000' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#22d3ee'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#06b6d4'}
              >
                <FiPlus className="w-4 h-4" />
                Add Lecture
              </button>
            </div>

            {/* Empty */}
            {lectures.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
                  style={{ backgroundColor: '#22252e' }}>
                  🎬
                </div>
                <p className="text-slate-300 font-bold mb-1">No lectures yet</p>
                <p className="text-slate-600 text-sm mb-6">
                  Add your first lecture to get started
                </p>
                <button
                  onClick={() => setShowAddLecture(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
                  style={{ backgroundColor: '#06b6d4', color: '#000' }}
                >
                  <FiPlus className="w-4 h-4" />
                  Add First Lecture
                </button>
              </div>
            )}

            {/* Lecture list */}
            {lectures.length > 0 && (
              <div className="divide-y" style={{ borderColor: '#2a2d35' }}>
                {lectures.map((lecture, idx) => (
                  <div key={lecture._id}
                    className="flex items-center gap-4 px-6 py-4 group transition-all duration-200"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#22252e'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Number */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                      style={{ backgroundColor: '#22252e', color: '#6b7280' }}>
                      {idx + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 font-semibold text-sm truncate">
                        {lecture.title}
                      </p>
                      {lecture.description && (
                        <p className="text-slate-600 text-xs truncate mt-0.5">
                          {lecture.description}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Link
                        to={`/courses/${id}/lectures/${lecture._id}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}
                        title="Watch"
                        onMouseEnter={e => { e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.borderColor = '#06b6d4' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2e3140' }}
                      >
                        <FiPlay className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => openEditLecture(lecture)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}
                        title="Edit"
                        onMouseEnter={e => { e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.borderColor = '#06b6d4' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2e3140' }}
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLecture(lecture._id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}
                        title="Delete"
                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = '#f87171' }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2e3140' }}
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Add Lecture Modal ── */}
      {showAddLecture && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl shadow-2xl max-w-lg w-full p-7"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-xl">Add Lecture</h2>
                <p className="text-slate-500 text-xs mt-0.5">Add a new lecture to this folder</p>
              </div>
              <button onClick={closeAdd}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 transition-all"
                style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLecture} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>Title *</label>
                <input
                  className="w-full text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                  placeholder="e.g. Introduction to Arrays"
                  value={lectureForm.title}
                  onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#06b6d4'}
                  onBlur={e => e.target.style.borderColor = '#2e3140'}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>Description</label>
                <textarea
                  className="w-full text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none resize-none placeholder-slate-600"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                  rows={2}
                  placeholder="What does this lecture cover?"
                  value={lectureForm.description}
                  onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#06b6d4'}
                  onBlur={e => e.target.style.borderColor = '#2e3140'}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>YouTube URL *</label>
                <input
                  type="url"
                  className="w-full text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                  placeholder="https://youtube.com/watch?v=..."
                  value={lectureForm.videoUrl}
                  onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#06b6d4'}
                  onBlur={e => e.target.style.borderColor = '#2e3140'}
                  required
                />
              </div>

              {addError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#2e1515', border: '1px solid #4a2020', color: '#f87171' }}>
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  {addError}
                </div>
              )}

              <div style={{ borderTop: '1px solid #2a2d35', paddingTop: '16px' }}>
                <div className="flex gap-3">
                  <button type="submit" disabled={addLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                    style={{ backgroundColor: '#06b6d4', color: '#000' }}
                    onMouseEnter={e => { if (!addLoading) e.currentTarget.style.backgroundColor = '#22d3ee' }}
                    onMouseLeave={e => { if (!addLoading) e.currentTarget.style.backgroundColor = '#06b6d4' }}
                  >
                    {addLoading ? (
                      <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Adding...</>
                    ) : (
                      <><FiPlus className="w-4 h-4" /> Add Lecture</>
                    )}
                  </button>
                  <button type="button" onClick={closeAdd}
                    className="px-6 py-2.5 rounded-xl font-medium text-sm"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Lecture Modal ── */}
      {showEditLecture && editingLecture && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="rounded-2xl shadow-2xl max-w-lg w-full p-7"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-xl">Edit Lecture</h2>
                <p className="text-slate-500 text-xs mt-0.5">Update lecture details</p>
              </div>
              <button onClick={closeEdit}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500"
                style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateLecture} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>Title *</label>
                <input
                  className="w-full text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                  value={lectureForm.title}
                  onChange={(e) => setLectureForm({ ...lectureForm, title: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#06b6d4'}
                  onBlur={e => e.target.style.borderColor = '#2e3140'}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>Description</label>
                <textarea
                  className="w-full text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none resize-none placeholder-slate-600"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                  rows={2}
                  value={lectureForm.description}
                  onChange={(e) => setLectureForm({ ...lectureForm, description: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#06b6d4'}
                  onBlur={e => e.target.style.borderColor = '#2e3140'}
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wide mb-1.5"
                  style={{ color: '#94a3b8' }}>YouTube URL *</label>
                <input
                  type="url"
                  className="w-full text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none placeholder-slate-600"
                  style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                  placeholder="https://youtube.com/watch?v=..."
                  value={lectureForm.videoUrl}
                  onChange={(e) => setLectureForm({ ...lectureForm, videoUrl: e.target.value })}
                  onFocus={e => e.target.style.borderColor = '#06b6d4'}
                  onBlur={e => e.target.style.borderColor = '#2e3140'}
                  required
                />
              </div>

              {editError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#2e1515', border: '1px solid #4a2020', color: '#f87171' }}>
                  <FiAlertCircle className="w-4 h-4 shrink-0" />
                  {editError}
                </div>
              )}

              <div style={{ borderTop: '1px solid #2a2d35', paddingTop: '16px' }}>
                <div className="flex gap-3">
                  <button type="submit" disabled={editLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50"
                    style={{ backgroundColor: '#06b6d4', color: '#000' }}
                    onMouseEnter={e => { if (!editLoading) e.currentTarget.style.backgroundColor = '#22d3ee' }}
                    onMouseLeave={e => { if (!editLoading) e.currentTarget.style.backgroundColor = '#06b6d4' }}
                  >
                    {editLoading ? (
                      <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <><FiCheck className="w-4 h-4" /> Save Changes</>
                    )}
                  </button>
                  <button type="button" onClick={closeEdit}
                    className="px-6 py-2.5 rounded-xl font-medium text-sm"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </Layout>
  );
}