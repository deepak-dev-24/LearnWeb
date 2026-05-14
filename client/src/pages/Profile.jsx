import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { FiUser, FiMail, FiCalendar, FiLogOut, FiFolder, FiPlay, FiEdit2, FiCheck, FiX } from 'react-icons/fi'

export default function Profile() {
  const { user } = useSelector((s) => s.auth)
  const { items: courses } = useSelector((s) => s.courses)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-2">
            your account
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
            Profile
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Left — Avatar + quick info ── */}
          <div className="lg:col-span-1 flex flex-col gap-5">

            {/* Avatar card */}
            <div className="rounded-2xl p-6 text-center"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>

              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6, #8b5cf6)' }}>
                  <span className="text-white text-4xl font-black">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online dot */}
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
                  style={{ backgroundColor: '#10b981', borderColor: '#1a1d24' }} />
              </div>

              <h2 className="text-white font-black text-xl mb-1">{user.name}</h2>
              <p className="text-slate-500 text-sm mb-4">{user.email}</p>

              {/* Member since */}
              <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-mono">
                <FiCalendar className="w-3 h-3" />
                Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short'
                })}
              </div>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl p-5"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-4">
                your workspace
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: '#22252e' }}>
                  <div className="flex items-center gap-2">
                    <FiFolder className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-400 text-sm">Study Folders</span>
                  </div>
                  <span className="text-white font-black text-lg">{courses?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl"
                  style={{ backgroundColor: '#22252e' }}>
                  <div className="flex items-center gap-2">
                    <FiPlay className="w-4 h-4 text-violet-400" />
                    <span className="text-slate-400 text-sm">Total Lectures</span>
                  </div>
                  <span className="text-white font-black text-lg">—</span>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl p-5"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-4">
                quick links
              </p>
              <div className="space-y-2">
                {[
                  { to: '/courses', label: 'My Folders', icon: <FiFolder className="w-4 h-4" />, color: '#06b6d4' },
                  { to: '/feed', label: 'Study Feed', icon: <FiPlay className="w-4 h-4" />, color: '#8b5cf6' },
                  { to: '/dashboard', label: 'Dashboard', icon: <FiUser className="w-4 h-4" />, color: '#10b981' },
                ].map((link, i) => (
                  <Link
                    key={i}
                    to={link.to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                    style={{ backgroundColor: '#22252e' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2a2d35'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#22252e'}
                  >
                    <span style={{ color: link.color }}>{link.icon}</span>
                    <span className="text-slate-400 text-sm group-hover:text-slate-200 transition-colors">
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right — Info + Settings ── */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Personal Information */}
            <div className="rounded-2xl p-6"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>

              <div className="flex items-center justify-between mb-6">
                <p className="text-white font-bold text-base">Personal Information</p>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#06b6d4'; e.currentTarget.style.borderColor = '#06b6d4' }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = '#2e3140' }}
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ backgroundColor: '#06b6d4', color: '#000' }}
                    >
                      <FiCheck className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({ name: user.name, email: user.email })
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ backgroundColor: '#22252e', border: '1px solid #2e3140', color: '#6b7280' }}
                    >
                      <FiX className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide mb-2"
                    style={{ color: '#6b7280' }}>
                    <FiUser className="w-3 h-3" /> Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none"
                      style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                      onFocus={e => e.target.style.borderColor = '#06b6d4'}
                      onBlur={e => e.target.style.borderColor = '#2e3140'}
                    />
                  ) : (
                    <p className="text-white font-semibold">{user.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide mb-2"
                    style={{ color: '#6b7280' }}>
                    <FiMail className="w-3 h-3" /> Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-slate-100 text-sm px-4 py-2.5 rounded-xl outline-none"
                      style={{ backgroundColor: '#22252e', border: '1px solid #2e3140' }}
                      onFocus={e => e.target.style.borderColor = '#06b6d4'}
                      onBlur={e => e.target.style.borderColor = '#2e3140'}
                    />
                  ) : (
                    <p className="text-white font-semibold">{user.email}</p>
                  )}
                </div>

                {/* Member since */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide mb-2"
                    style={{ color: '#6b7280' }}>
                    <FiCalendar className="w-3 h-3" /> Member Since
                  </label>
                  <p className="text-white font-semibold">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Note about edit */}
              {isEditing && (
                <p className="text-slate-600 text-xs mt-4 font-mono">
                  note: profile update api coming soon — changes won't be saved yet
                </p>
              )}
            </div>

            {/* Logout card */}
            <div className="rounded-2xl p-6"
              style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
              <p className="text-white font-bold text-base mb-1">Sign Out</p>
              <p className="text-slate-500 text-xs mb-5">
                You'll be logged out of your account and redirected to the home page.
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: '#2e1515', border: '1px solid #4a2020', color: '#f87171' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#3a1a1a'; e.currentTarget.style.borderColor = '#f87171' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2e1515'; e.currentTarget.style.borderColor = '#4a2020' }}
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}