import React, { useEffect, useState, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import { Loader2, KeyRound, Check } from 'lucide-react'

// Components
import Navigation from './components/Navigation'

// Lazy-loaded Pages (loaded asynchronously on-demand)
const Login = lazy(() => import('./pages/Login'))
const Home = lazy(() => import('./pages/Home'))
const Exercise = lazy(() => import('./pages/Exercise'))
const Food = lazy(() => import('./pages/Food'))
const Security = lazy(() => import('./pages/Security'))

// Sleek loading screen for lazy page transitions
const RouteLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center bg-obsidian text-gray-500">
    <div className="flex flex-col items-center space-y-3">
      <Loader2 className="w-6 h-6 animate-spin text-electric-cyan" />
      <span className="text-[9px] uppercase tracking-widest font-bold text-gray-600">
        Loading System Interface...
      </span>
    </div>
  </div>
)

// Route Guard for strict security authentication requirements
function ProtectedRoute({ children }) {
  const user = useStore((state) => state.user)
  
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-obsidian">
      {/* Navigation adapts to desktop/mobile layouts */}
      <Navigation />
      
      {/* Content panel spacing matches navigation overlays (sidebar padding on desktop) */}
      <div className="md:pl-64 transition-all duration-300">
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const initApp = useStore((state) => state.initApp)
  const loading = useStore((state) => state.loading)
  
  // Global password reset states
  const isResettingPassword = useStore((state) => state.isResettingPassword)
  const updatePassword = useStore((state) => state.updatePassword)
  const [modalPassword, setModalPassword] = useState('')
  const [modalConfirmPassword, setModalConfirmPassword] = useState('')
  const [modalError, setModalError] = useState('')
  const [modalSuccess, setModalSuccess] = useState('')

  useEffect(() => {
    initApp()
  }, [initApp])

  const handleModalPasswordReset = async (e) => {
    e.preventDefault()
    setModalError('')
    setModalSuccess('')

    if (!modalPassword || !modalConfirmPassword) {
      setModalError('Please fill in all fields.')
      return
    }

    if (modalPassword !== modalConfirmPassword) {
      setModalError('Passwords do not match.')
      return
    }

    if (modalPassword.length < 6) {
      setModalError('Password must be at least 6 characters.')
      return
    }

    const res = await updatePassword(modalPassword)
    if (res.success) {
      setModalSuccess('Password reset complete. Resuming session...')
      setModalPassword('')
      setModalConfirmPassword('')
      setTimeout(() => {
        useStore.setState({ isResettingPassword: false })
        setModalSuccess('')
      }, 2000)
    } else {
      setModalError(res.error || 'Reset query failed.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian text-white relative">
        {/* Glow rings in background */}
        <div className="absolute w-[200px] h-[200px] bg-electric-cyan/5 rounded-full filter blur-[80px]" />
        
        <div className="flex flex-col items-center space-y-4 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-electric-cyan drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
            Calibrating Secure Telemetry Array...
          </span>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      {/* Global Password Recovery Reset Modal */}
      {isResettingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4">
          <div className="w-full max-w-md bg-[#12131C] border border-electric-cyan/20 p-8 rounded-2xl shadow-2xl relative text-left">
            <h2 className="font-heading font-bold text-xl text-white mb-2 uppercase tracking-wide flex items-center">
              <KeyRound className="w-5 h-5 text-electric-cyan mr-2" />
              Reset Access Secret
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              Establish a new secure access key to resume console telemetry permissions.
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-neon-mint/10 border border-neon-mint/20 text-xs text-neon-mint flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleModalPasswordReset} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  New Password
                </label>
                <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-3 transition-all focus-within:border-electric-cyan">
                  <KeyRound className="text-gray-500 mr-2.5 w-4 h-4 shrink-0" />
                  <input
                    type="password"
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-none p-0 py-2.5 text-xs text-white focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Confirm Password
                </label>
                <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-3 transition-all focus-within:border-electric-cyan">
                  <KeyRound className="text-gray-500 mr-2.5 w-4 h-4 shrink-0" />
                  <input
                    type="password"
                    value={modalConfirmPassword}
                    onChange={(e) => setModalConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-none p-0 py-2.5 text-xs text-white focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => useStore.setState({ isResettingPassword: false })}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-electric-cyan text-obsidian font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all cursor-pointer"
                >
                  Write Secret Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspense fallback intercepts route loads while chunks download */}
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          
          {/* Public auth route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exercise"
            element={
              <ProtectedRoute>
                <Exercise />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food"
            element={
              <ProtectedRoute>
                <Food />
              </ProtectedRoute>
            }
          />
          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <Security />
              </ProtectedRoute>
            }
          />
          
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
