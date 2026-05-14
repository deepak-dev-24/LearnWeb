import React, { useState, useEffect, useRef } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from './features/auth/authSlice';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CoursesList from './pages/StudyFolders';
import CourseDetail from './pages/FolderDetail';
import Lectures from './pages/Lectures';
import VideoPlayer from './pages/VideoPlayer';
import CreateCourse from './pages/CreateFolder';
import ManageCourse from './pages/ManageFolder';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import DailyPlan from './pages/DailyPlan';
import OfflineStudy from './pages/OfflineStudy'
import StudyHistory from './pages/StudyHistory'

import { FiBook, FiHome, FiSettings, FiCode, FiSearch, FiFolder, FiZap, FiTrendingUp, FiPlay, FiArrowRight, FiCheckSquare, FiMoon } from 'react-icons/fi';

// ── Study Timer Strip ──
const StudyTimerStrip = () => {
  const [secondsLeft, setSecondsLeft] = useState(120);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [visible, setVisible] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (started && secondsLeft > 0) {
      intervalRef.current = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    } else if (secondsLeft === 0) {
      setDone(true);
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [started, secondsLeft]);

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setSecondsLeft(120);
    setDone(false);
    setStarted(true);
  };

  if (!visible) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');
  const percent = Math.round(((120 - secondsLeft) / 120) * 100);

  return (
    <div className={`relative w-full transition-all duration-500 ${done ? 'bg-cyan-950/60 border-b border-cyan-500/30' : 'bg-slate-900/80 border-b border-slate-800/80'}`}>
      <div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 transition-all duration-1000"
        style={{ width: `${percent}%` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-11 gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${done ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-xs font-mono text-slate-500 hidden sm:block tracking-wide">
              {done ? '🎯 You\'re ready!' : 'Settle in before you start —'}
            </span>
          </div>
          <div className="flex items-center gap-3 flex-1 justify-center">
            {!done ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="bg-slate-800 border border-slate-700/50 text-slate-100 font-black font-mono text-sm px-2 py-0.5 rounded-md tabular-nums">{mins}</span>
                  <span className="text-cyan-500 font-black text-sm animate-pulse">:</span>
                  <span className="bg-slate-800 border border-slate-700/50 text-slate-100 font-black font-mono text-sm px-2 py-0.5 rounded-md tabular-nums">{secs}</span>
                </div>
                <span className="text-slate-700 text-xs hidden sm:block">—</span>
                <span className="text-xs font-medium text-slate-400 hidden sm:block">
                  {secondsLeft > 90 ? 'Close other tabs and take a deep breath.'
                    : secondsLeft > 60 ? 'Put your phone face down. You\'ve got this.'
                    : secondsLeft > 30 ? 'Almost there — open your study space.'
                    : 'Last few seconds. Lock in! 🔒'}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-cyan-400 tracking-wide">
                2 mins up — time to start studying! 🎯
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {done ? (
              <>
                <button onClick={handleReset} className="text-slate-600 hover:text-slate-400 text-xs font-mono transition-colors hidden sm:block">↺ reset</button>
                <Link to="/courses" className="bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-cyan-500/30 whitespace-nowrap">
                  Start Now →
                </Link>
              </>
            ) : (
              <Link to="/courses" className="text-slate-500 hover:text-cyan-400 text-xs font-mono transition-colors whitespace-nowrap hidden sm:block">skip →</Link>
            )}
            <button onClick={() => setVisible(false)} className="text-slate-700 hover:text-slate-400 text-xs transition-colors ml-1 leading-none">✕</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Navigation ──
const Navigation = () => {
  const { user, token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <nav className="bg-[#0a0a0f]/90 backdrop-blur-md border-b border-slate-800/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <FiCode className="text-white text-sm" />
              </div>
              <Link to="/"><span className="ml-2 text-lg font-bold text-slate-100 tracking-tight">LearnWeb</span></Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
              <Link to="/" className="text-slate-500 hover:text-slate-200 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                <FiHome className="mr-1.5 text-xs" /> Home
              </Link>
              <Link to="/courses" className="text-slate-500 hover:text-slate-200 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                <FiBook className="mr-1.5 text-xs" /> Courses
              </Link>
              <Link to="/feed" className="text-slate-500 hover:text-slate-200 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                <FiPlay className="mr-1.5 text-xs" /> Feed
              </Link>
              {token && (
                <Link to="/plan" className="text-slate-500 hover:text-slate-200 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                  <FiCheckSquare className="mr-1.5 text-xs" /> Plan
                </Link>
              )}
              {token && (
                <Link to="/offline-study" className="text-slate-500 hover:text-slate-200 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                  <FiMoon className="mr-1.5 text-xs" /> Offline
                </Link>
              )}
              {token && (
                <Link to="/dashboard" className="text-slate-500 hover:text-slate-200 inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors">
                  <FiSettings className="mr-1.5 text-xs" /> Dashboard
                </Link>
              )}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {token ? (
              <Link to="/profile">
                <button type="button" className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-cyan-500/30">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-slate-400 hover:text-slate-200 font-medium transition-colors px-3 py-2 text-sm">Login</Link>
                <Link to="/signup" className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/30">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// ── Main Layout ──
const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
    <Navigation />
    <StudyTimerStrip />
    <main className="flex-1">{children}</main>
    <footer className="border-t border-slate-800/60 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md flex items-center justify-center">
                <FiCode className="text-white text-xs" />
              </div>
              <span className="text-slate-200 font-bold">LearnWeb</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your personal distraction-free study space. Built for students who want to learn deeply, not endlessly scroll.
            </p>
          </div>
          <div className="flex gap-16">
            <div>
              <h3 className="text-slate-300 font-semibold text-sm mb-4">Platform</h3>
              <ul className="space-y-2.5 text-slate-500 text-sm">
                <li><Link to="/courses" className="hover:text-slate-300 transition-colors">Browse Courses</Link></li>
                <li><Link to="/plan" className="hover:text-slate-300 transition-colors">Daily Plan</Link></li>
                <li><Link to="/offline-study" className="hover:text-slate-300 transition-colors">Offline Study</Link></li>
                <li><Link to="/dashboard" className="hover:text-slate-300 transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-slate-300 font-semibold text-sm mb-4">Info</h3>
              <ul className="space-y-2.5 text-slate-500 text-sm">
                <li><a href="#" className="hover:text-slate-300 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-slate-300 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-slate-300 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800/60 mt-8 pt-6">
          <p className="text-slate-600 text-xs text-center">© {new Date().getFullYear()} LearnWeb. Made for students who take their learning seriously.</p>
        </div>
      </div>
    </footer>
  </div>
);

// ── Home Component ──
const Home = () => {
  const studyFlow = [
    {
      icon: <FiSearch className="w-6 h-6" />, step: "01", title: "Explore",
      desc: "Search and discover learning videos from a clean, distraction-free feed. No shorts. No recommendations pulling you away.",
      color: "from-cyan-500 to-blue-500", glow: "hover:shadow-cyan-500/20", border: "hover:border-cyan-500/40",
    },
    {
      icon: <FiFolder className="w-6 h-6" />, step: "02", title: "Organize",
      desc: "Save videos into your personal study spaces. DSA, Backend, Java — each topic lives in its own focused environment.",
      color: "from-blue-500 to-violet-500", glow: "hover:shadow-blue-500/20", border: "hover:border-blue-500/40",
    },
    {
      icon: <FiZap className="w-6 h-6" />, step: "03", title: "Focus",
      desc: "Enter Focus Mode. Just you, your video, and a Pomodoro timer. No tab-switching. No noise. Pure deep work.",
      color: "from-violet-500 to-purple-500", glow: "hover:shadow-violet-500/20", border: "hover:border-violet-500/40",
    },
    {
      icon: <FiTrendingUp className="w-6 h-6" />, step: "04", title: "Track",
      desc: "Every session recorded. Watch your daily study time grow. See your consistency turn into real progress.",
      color: "from-purple-500 to-pink-500", glow: "hover:shadow-purple-500/20", border: "hover:border-pink-500/40",
    },
  ];

  const features = [
    { emoji: "📁", title: "Study Spaces", desc: "Create personal folders for each subject. Your own organized learning environment." },
    { emoji: "⏱️", title: "Pomodoro Timer", desc: "Work in focused sprints. Rest. Repeat. Build a study habit that actually sticks." },
    { emoji: "📝", title: "Linked Notes", desc: "Write notes directly inside your study space. Everything in one place." },
    { emoji: "✅", title: "Task Tracker", desc: "Add study tasks, set deadlines, mark them done. Stay accountable to yourself." },
    { emoji: "📊", title: "Progress Dashboard", desc: "Daily, weekly, monthly charts. See your consistency grow over time." },
    { emoji: "🤖", title: "AI Study Assistant", desc: "Stuck on a concept? Ask the AI chatbot without leaving your study session." },
  ];

  return (
    <div className="bg-[#0a0a0f] text-slate-100">

      {/* ── Hero ── */}
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-700/60 px-4 py-1.5 rounded-full mb-10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-slate-400 text-xs font-mono tracking-wide">personal · distraction-free · focused</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight tracking-tight">
            <span className="text-slate-100">Your study space.</span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              No distractions.
            </span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed font-light">
            LearnWeb is not another course platform. It's your personal space to learn deeply, stay organized, and track every session — built for students who are serious about growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/courses"
              className="px-7 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold text-base transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30 hover:scale-105"
            >
              Start Learning →
            </Link>
            <Link
              to="/feed"
              className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-base transition-all duration-200 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(6,182,212,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.7)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(6,182,212,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(circle at center, rgba(6,182,212,0.08) 0%, transparent 70%)' }} />
              <span className="relative flex items-center gap-2.5 text-slate-100">
                <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(6,182,212,0.15)' }}>
                  <FiPlay className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                </span>
                Browse Feed
                <FiArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform duration-200" />
              </span>
            </Link>
          </div>

          <p className="text-slate-600 text-xs mt-6 font-mono">
            no ads · no recommendations · no infinite scroll
          </p>
        </div>
      </div>

      {/* ── FEED PREVIEW SECTION ── */}
      <div className="py-20 border-t border-slate-800/60 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-20"
          style={{ background: 'radial-gradient(ellipse at center, #06b6d4 0%, transparent 70%)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">📺 study feed</p>
              <h2 className="text-3xl md:text-4xl font-black text-slate-100 leading-tight">
                All your lectures.<br /><span className="text-slate-500">One clean feed.</span>
              </h2>
              <p className="text-slate-500 text-sm mt-3 max-w-md">
                Browse every video across all your study folders — no distractions, no recommendations, just your content.
              </p>
            </div>
            <Link
              to="/feed"
              className="group relative flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)', color: '#000' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(6,182,212,0.4), 0 0 80px rgba(59,130,246,0.2)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div className="w-8 h-8 bg-black/20 rounded-xl flex items-center justify-center">
                <FiPlay className="w-4 h-4 fill-black text-black ml-0.5" />
              </div>
              <span>Open Feed</span>
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { color: 'from-cyan-500/20 to-blue-600/20', border: 'border-cyan-500/20', icon: '⚡', label: 'DSA Lectures' },
              { color: 'from-violet-500/20 to-purple-600/20', border: 'border-violet-500/20', icon: '🧠', label: 'Backend Dev' },
              { color: 'from-emerald-500/20 to-teal-600/20', border: 'border-emerald-500/20', icon: '🌿', label: 'Java Basics' },
              { color: 'from-orange-500/20 to-pink-600/20', border: 'border-orange-500/20', icon: '🔥', label: 'React.js' },
            ].map((card, i) => (
              <Link key={i} to="/feed"
                className={`group relative rounded-2xl overflow-hidden border ${card.border} transition-all duration-300 hover:scale-[1.03] hover:shadow-xl`}
                style={{ aspectRatio: '16/9' }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${card.color}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">{card.icon}</span>
                  <span className="text-slate-300 text-xs font-semibold font-mono">{card.label}</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#06b6d4' }}>
                    <FiPlay className="w-4 h-4 fill-black text-black ml-0.5" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between px-6 py-4 rounded-2xl"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-slate-400 text-sm">
                Your personal study feed — <span className="text-slate-200 font-semibold">all lectures in one place</span>
              </p>
            </div>
            <Link to="/feed"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: '#06b6d4', color: '#000' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#22d3ee'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#06b6d4'}>
              <FiPlay className="w-3.5 h-3.5 fill-black" />
              Browse All Videos
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── DAILY PLAN + OFFLINE STUDY SECTION ── */}
      <div className="py-20 border-t border-slate-800/60 relative overflow-hidden">

        {/* Background glows */}
        <div className="absolute top-0 left-0 w-96 h-96 opacity-10 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10 rounded-full blur-3xl"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>
              🎯 study tools
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-100 leading-tight">
              Plan. Execute. <span className="text-slate-500">Stay consistent.</span>
            </h2>
            <p className="text-slate-500 text-sm mt-3 max-w-lg mx-auto">
              Two powerful tools to keep you accountable — whether you're planning your day or studying from books.
            </p>
          </div>

          {/* Two big attractive cards */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* ── Daily Plan Card ── */}
            <Link to="/plan"
              className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                backgroundColor: '#0f1f17',
                border: '1px solid #10b98140',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#10b98140'}
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

              {/* Top badge */}
              <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#10b98120', border: '1px solid #10b98150' }}>
                    <FiCheckSquare className="w-6 h-6" style={{ color: '#10b981' }} />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#10b981' }}>Daily Plan</p>
                    <p className="text-xs" style={{ color: '#374151' }}>plan · execute · track</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                  style={{ backgroundColor: '#10b98120' }}>
                  <FiArrowRight className="w-4 h-4" style={{ color: '#10b981' }} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-slate-100 mb-3 relative">
                Today's Execution System
              </h3>
              <p className="text-sm leading-relaxed mb-6 relative" style={{ color: '#4b5563' }}>
                Plan your study tasks every morning. Execute them during the day. Celebrate at night when everything is done. Your daily accountability partner.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-6 relative">
                {['📋 Task Planning', '📊 Progress Bar', '🎉 Confetti', '📅 History'].map((pill, i) => (
                  <span key={i} className="text-xs font-mono px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#10b98115', border: '1px solid #10b98130', color: '#10b981' }}>
                    {pill}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 relative">
                <div className="flex-1 h-px" style={{ backgroundColor: '#10b98120' }} />
                <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                  Open Today's Plan →
                </span>
              </div>
            </Link>

            {/* ── Offline Study Card ── */}
            <Link to="/offline-study"
              className="group relative rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                backgroundColor: '#12101a',
                border: '1px solid #a855f740',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#a855f7'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#a855f740'}
            >
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />

              {/* Top badge */}
              <div className="flex items-center justify-between mb-6 relative">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: '#a855f720', border: '1px solid #a855f750' }}>
                    <FiMoon className="w-6 h-6" style={{ color: '#a855f7' }} />
                  </div>
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest" style={{ color: '#a855f7' }}>Offline Study</p>
                    <p className="text-xs" style={{ color: '#374151' }}>focus · reflect · grow</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                  style={{ backgroundColor: '#a855f720' }}>
                  <FiArrowRight className="w-4 h-4" style={{ color: '#a855f7' }} />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-black text-slate-100 mb-3 relative">
                Offline Study Companion
              </h3>
              <p className="text-sm leading-relaxed mb-6 relative" style={{ color: '#4b5563' }}>
                Studying from books or notes? This is your digital study room. A strict but supportive environment with Pomodoro sessions, reflection check-ins, and instructor-like presence.
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap gap-2 mb-6 relative">
                {['⏱️ Pomodoro', '🧠 Reflection', '👁️ Focus Mode', '📓 Session Log'].map((pill, i) => (
                  <span key={i} className="text-xs font-mono px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#a855f715', border: '1px solid #a855f730', color: '#a855f7' }}>
                    {pill}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 relative">
                <div className="flex-1 h-px" style={{ backgroundColor: '#a855f720' }} />
                <span className="text-sm font-bold" style={{ color: '#a855f7' }}>
                  Begin Study Session →
                </span>
              </div>
            </Link>
          </div>

          {/* Bottom strip */}
          <div className="mt-6 flex items-center justify-center gap-6 px-6 py-4 rounded-2xl"
            style={{ backgroundColor: '#1a1d24', border: '1px solid #2a2d35' }}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#10b981' }} />
              <span className="text-slate-400 text-sm">Plan your day</span>
            </div>
            <div className="w-px h-4" style={{ backgroundColor: '#2a2d35' }} />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#a855f7' }} />
              <span className="text-slate-400 text-sm">Study offline with focus</span>
            </div>
            <div className="w-px h-4" style={{ backgroundColor: '#2a2d35' }} />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#06b6d4' }} />
              <span className="text-slate-400 text-sm">Track your consistency</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Study Flow Section ── */}
      <div className="py-24 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              One simple flow. <span className="text-slate-500">Every single day.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-5 relative">
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-pink-500/20" />
            {studyFlow.map((item, i) => (
              <div key={i} className={`relative bg-slate-900/60 border border-slate-800 ${item.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl ${item.glow} group`}>
                <span className="text-slate-700 font-mono text-xs absolute top-4 right-4">{item.step}</span>
                <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-5 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-slate-100 font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features Grid ── */}
      <div className="py-24 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-cyan-400 text-xs font-mono uppercase tracking-widest mb-3">What's inside</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-100">
              Everything you need. <span className="text-slate-500">Nothing else.</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:bg-slate-900/70">
                <div className="text-3xl mb-4">{f.emoji}</div>
                <h3 className="text-slate-200 font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Personal CTA ── */}
      <div className="py-24 border-t border-slate-800/60">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <p className="text-slate-600 text-xs font-mono uppercase tracking-widest mb-6">ready when you are</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-100 mb-4 leading-tight">
                Stop scrolling.<br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Start learning.
                </span>
              </h2>
              <p className="text-slate-500 text-base mb-10 max-w-md mx-auto">
                Open your first study space today. No setup needed. Just you and the topic you've been putting off.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link to="/courses"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-bold text-base transition-all duration-200 hover:shadow-2xl hover:shadow-cyan-500/30 hover:scale-105">
                  <FiZap className="w-4 h-4" />
                  Open LearnWeb
                </Link>
                <Link to="/plan"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: '#0f1f17', border: '1px solid #10b98150', color: '#10b981' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#10b98150'}>
                  <FiCheckSquare className="w-4 h-4" />
                  Today's Plan
                </Link>
                <Link to="/offline-study"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all duration-200 hover:scale-105"
                  style={{ backgroundColor: '#12101a', border: '1px solid #a855f750', color: '#a855f7' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#a855f7'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#a855f750'}>
                  <FiMoon className="w-4 h-4" />
                  Study Offline
                </Link>
              </div>

              <div className="mt-14 grid grid-cols-3 gap-6 border-t border-slate-800/60 pt-10">
                <div>
                  <p className="text-2xl font-bold text-slate-200">∞</p>
                  <p className="text-slate-600 text-xs mt-1">Study spaces</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-200">0</p>
                  <p className="text-slate-600 text-xs mt-1">Distractions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-200">1</p>
                  <p className="text-slate-600 text-xs mt-1">Focused you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

// ── Protected Layout ──
const ProtectedLayout = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

// ── Main App ──
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/courses" element={<MainLayout><CoursesList /></MainLayout>} />
      <Route path="/courses/:id" element={<MainLayout><CourseDetail /></MainLayout>} />

      <Route element={<ProtectedLayout roles={['student']} />}>
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/courses/:id/lectures" element={<Lectures />} />
        <Route path="/courses/:id/lectures/:lectureId" element={<VideoPlayer />} />
        <Route path="/feed" element={<MainLayout><Feed /></MainLayout>} />
        <Route path="/plan" element={<MainLayout><DailyPlan /></MainLayout>} />
        <Route path="/offline-study" element={<MainLayout><OfflineStudy /></MainLayout>} />
        <Route path="/study-history" element={<MainLayout><StudyHistory /></MainLayout>} />
      </Route>

      <Route element={<ProtectedLayout />}>
        <Route path="/courses/create" element={<MainLayout><CreateCourse /></MainLayout>} />
        <Route path="/courses/:id/manage" element={<MainLayout><ManageCourse /></MainLayout>} />
      </Route>

      <Route path="*" element={
        <MainLayout>
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-slate-200 mb-4">404</h1>
              <p className="text-lg text-slate-500 mb-8">Page not found</p>
              <Link to="/" className="inline-flex items-center px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl transition-all">
                Go back home
              </Link>
            </div>
          </div>
        </MainLayout>
      } />
    </Routes>
  );
}