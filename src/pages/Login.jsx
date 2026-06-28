import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Flame, ShieldAlert, KeyRound, Mail, Loader2, Info, ArrowLeft, CheckCircle, MailOpen } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Views: 'login' | 'reset'
  const [authView, setAuthView] = useState('login')
  
  // Feedback banners
  const [localError, setLocalError] = useState(null)
  const [feedbackMsg, setFeedbackMsg] = useState(null)
  const [showDemoRecoveryBanner, setShowDemoRecoveryBanner] = useState(false)

  const login = useStore((state) => state.login)
  const resetPassword = useStore((state) => state.resetPassword)
  const setIsResettingPassword = useStore((state) => state.setIsResettingPassword)
  const loading = useStore((state) => state.loading)
  const storeError = useStore((state) => state.error)
  const isDemoMode = useStore((state) => state.isDemoMode)
  const user = useStore((state) => state.user)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/home')
    }
  }, [user, navigate])

  // Reset inputs
  const switchView = (view) => {
    setAuthView(view)
    setLocalError(null)
    setFeedbackMsg(null)
    setShowDemoRecoveryBanner(false)
    setPassword('')
  }

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!email || !password) {
      setLocalError('Please fill in all fields.')
      return
    }

    const res = await login(email, password)
    if (res.success) {
      navigate('/home')
    } else {
      setLocalError(res.error || 'Authentication failed.')
    }
  }

  // Handle Password Reset dispatch
  const handleResetSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    setFeedbackMsg(null)

    if (!email) {
      setLocalError('Please provide your identity email.')
      return
    }

    const res = await resetPassword(email)
    if (res.success) {
      if (isDemoMode) {
        setShowDemoRecoveryBanner(true)
        setFeedbackMsg('Simulated password reset link generated. Trigger click below to open console.')
      } else {
        setFeedbackMsg('Password reset link has been dispatched to your email address.')
      }
    } else {
      setLocalError(res.error || 'Recovery lookup failed.')
    }
  }

  // Demo Simulation Actions
  const triggerDemoRecovery = () => {
    setIsResettingPassword(true)
    // Set active mock user session to allow updating password
    useStore.setState({ 
      user: { id: 'mock-user-uuid', email: email.trim().toLowerCase() } 
    })
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4 py-12 relative overflow-hidden select-none">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-electric-cyan/5 rounded-full filter blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-mint/5 rounded-full filter blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md z-10">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-electric-cyan/10 p-3.5 rounded-2xl border border-electric-cyan/25 shadow-[0_0_20px_rgba(0,242,254,0.1)] mb-4">
            <Flame className="w-8 h-8 text-electric-cyan neon-text-cyan" />
          </div>
          <h1 className="font-heading font-black text-2xl tracking-widest text-white m-0 uppercase">
            PROJECT <span className="text-electric-cyan font-light">ATMAN</span>
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Biometric Control Interface</p>
        </div>

        {/* Login Card */}
        <div className="glass-panel-neon rounded-2xl p-8 border border-white/5 relative">
          
          {/* Header text changes based on view */}
          {authView === 'login' && (
            <>
              <h2 className="font-heading font-bold text-xl text-white mb-2 text-left">Access Console</h2>
              <p className="text-xs text-gray-400 mb-6 text-left">Provide authentication keys to initiate session.</p>
            </>
          )}

          {authView === 'reset' && (
            <>
              <div className="flex items-center space-x-2 mb-2 text-left">
                <ArrowLeft onClick={() => switchView('login')} className="w-4 h-4 text-gray-400 hover:text-white cursor-pointer" />
                <h2 className="font-heading font-bold text-xl text-white">Recovery Console</h2>
              </div>
              <p className="text-xs text-gray-400 mb-6 text-left">Trigger secure credentials recovery links.</p>
            </>
          )}

          {/* Feedback messages */}
          {(localError || storeError) && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="text-xs text-red-300 leading-normal text-left">
                {localError || storeError}
              </span>
            </div>
          )}

          {feedbackMsg && (
            <div className="mb-5 p-4 rounded-xl bg-neon-mint/10 border border-neon-mint/25 flex items-start space-x-2.5">
              <CheckCircle className="w-4 h-4 text-neon-mint shrink-0 mt-0.5" />
              <span className="text-xs text-neon-mint leading-normal text-left">
                {feedbackMsg}
              </span>
            </div>
          )}

          {/* Demo Recovery Banner Simulation */}
          {showDemoRecoveryBanner && (
            <div className="mb-5 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/25 space-y-3 text-left">
              <div className="flex items-start space-x-2">
                <MailOpen className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-yellow-400">Simulated Password Recovery</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Click to simulate recovery link redirect, initiating the password reset console.</p>
                </div>
              </div>
              <button
                onClick={triggerDemoRecovery}
                className="w-full py-1.5 bg-yellow-500 text-obsidian text-[10px] font-bold uppercase rounded-lg hover:bg-yellow-400"
              >
                Click Simulated Recovery Link
              </button>
            </div>
          )}

          {/* Forms */}
          {authView === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block text-left">
                  Identity Mailbox
                </label>
                {/* Input Group Wrapper: Solves the overlapping bug completely */}
                <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-3.5 transition-all focus-within:border-electric-cyan focus-within:shadow-[0_0_10px_rgba(0,242,254,0.15)]">
                  <Mail className="text-gray-500 mr-3 w-4 h-4 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-transparent border-none p-0 py-3.5 text-sm text-white focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block text-left">
                    Access Secret
                  </label>
                  <button
                    type="button"
                    onClick={() => switchView('reset')}
                    className="text-[10px] text-gray-500 hover:text-electric-cyan font-bold uppercase tracking-wider transition-colors"
                  >
                    Forgot Access Key?
                  </button>
                </div>
                {/* Input Group Wrapper */}
                <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-3.5 transition-all focus-within:border-electric-cyan focus-within:shadow-[0_0_10px_rgba(0,242,254,0.15)]">
                  <KeyRound className="text-gray-500 mr-3 w-4 h-4 shrink-0" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-none p-0 py-3.5 text-sm text-white focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-electric-cyan to-neon-mint text-obsidian font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer select-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-obsidian" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <span>Access Console</span>
                )}
              </button>
            </form>
          )}

          {authView === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block text-left">
                  Registered Email Address
                </label>
                <div className="flex items-center bg-white/5 border border-white/8 rounded-xl px-3.5 transition-all focus-within:border-electric-cyan focus-within:shadow-[0_0_10px_rgba(0,242,254,0.15)]">
                  <Mail className="text-gray-500 mr-3 w-4 h-4 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full bg-transparent border-none p-0 py-3.5 text-sm text-white focus:outline-none focus:ring-0 focus:border-none focus:shadow-none"
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-gradient-to-r from-electric-cyan to-neon-mint text-obsidian font-bold text-sm rounded-xl hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer select-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-obsidian" />
                    <span>Dispatched Link...</span>
                  </>
                ) : (
                  <span>Dispatch Recovery Link</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-xs text-gray-400 hover:text-white font-semibold transition-colors"
                >
                  Return to Access Console
                </button>
              </div>
            </form>
          )}

          {/* Configuration Hint Banner */}
          <div className="mt-6 pt-5 border-t border-white/5 text-left">
            <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-electric-cyan shrink-0 mt-0.5 drop-shadow-[0_0_3px_rgba(0,242,254,0.4)]" />
              <div>
                <p className="text-[11px] font-semibold text-white uppercase tracking-wider">
                  {isDemoMode ? 'Simulation Mode Active' : 'Supabase Active Mode'}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  {isDemoMode 
                    ? 'The login console is locked to the local biometric cache. Log in using default credentials atman@fitness.com / password123 (editable in store config).' 
                    : 'A secure database connection is active. Log in with the personal email account created inside your Supabase project dashboard.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
