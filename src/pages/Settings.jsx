import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import WarnBanner from '../components/WarnBanner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  KeyRound,
  Mail,
  AlertCircle,
  Check,
  Loader2,
  User,
  Scale,
  Ruler,
  Trophy,
  Calendar,
  Settings as SettingsIcon
} from 'lucide-react'

export default function Settings() {
  const user = useStore((state) => state.user)
  const userMetrics = useStore((state) => state.userMetrics)
  const saveMetrics = useStore((state) => state.saveMetrics)
  const updatePassword = useStore((state) => state.updatePassword)
  const resetPassword = useStore((state) => state.resetPassword)

  // Local state for biometric form
  const [profileInput, setProfileInput] = useState({
    starting_weight: '',
    height: '',
    goal_weight: '',
    start_date: ''
  })

  // Local states for credentials form
  const [directPassword, setDirectPassword] = useState('')
  const [securityMsg, setSecurityMsg] = useState('')
  const [securityError, setSecurityError] = useState('')
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

  // Sync profile fields with store metrics
  useEffect(() => {
    if (userMetrics) {
      setProfileInput({
        starting_weight: String(userMetrics.starting_weight || ''),
        height: String(userMetrics.height || ''),
        goal_weight: String(userMetrics.goal_weight || ''),
        start_date: userMetrics.start_date || ''
      })
    }
  }, [userMetrics])

  // Save profile metrics
  const handleProfileSave = async (e) => {
    e.preventDefault()
    setProfileMsg('')
    const payload = {
      starting_weight: parseFloat(profileInput.starting_weight) || 0,
      height: parseFloat(profileInput.height) || 0,
      goal_weight: parseFloat(profileInput.goal_weight) || 0,
      start_date: profileInput.start_date
    }
    await saveMetrics(payload)
    setProfileMsg('Metrics configuration updated successfully.')
    setTimeout(() => setProfileMsg(''), 3000)
  }

  // Handle direct password updates
  const handleDirectPasswordSave = async (e) => {
    e.preventDefault()
    setSecurityError('')
    setSecurityMsg('')

    if (!directPassword) {
      setSecurityError('Please enter a new password.')
      return
    }

    if (directPassword.length < 6) {
      setSecurityError('Password must be at least 6 characters.')
      return
    }

    const res = await updatePassword(directPassword)
    if (res.success) {
      setSecurityMsg('Access key updated successfully.')
      setDirectPassword('')
      setTimeout(() => setSecurityMsg(''), 3000)
    } else {
      setSecurityError(res.error || 'Failed to update password.')
    }
  }

  // Dispatch recovery verification email
  const handleTriggerResetEmail = async () => {
    setSecurityError('')
    setSecurityMsg('')
    setIsSendingResetEmail(true)

    if (!user || !user.email) {
      setSecurityError('Active user credentials not found.')
      setIsSendingResetEmail(false)
      return
    }

    const res = await resetPassword(user.email)
    setIsSendingResetEmail(false)
    if (res.success) {
      setSecurityMsg('A secure validation link has been sent to your email.')
      setTimeout(() => setSecurityMsg(''), 5000)
    } else {
      setSecurityError(res.error || 'Failed to send recovery email.')
    }
  }

  if (!userMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian text-white relative">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-electric-cyan" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
            Syncing System Parameters...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-32 text-gray-300 relative">
      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-electric-cyan/5 rounded-full filter blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-mint/3 rounded-full filter blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-10">
        <WarnBanner />

        {/* Header */}
        <div className="mb-8 text-left">
          <h1 className="font-heading font-black text-3xl md:text-5xl text-white tracking-tight leading-none mb-3 uppercase flex items-center">
            <SettingsIcon className="w-8 h-8 md:w-12 md:h-12 text-electric-cyan mr-3 animate-spin-slow" />
            Settings <span className="text-electric-cyan neon-text-cyan ml-2.5">Console</span>
          </h1>
          <p className="text-sm text-gray-400 font-light">
            Initialize biometric thresholds, calibrate program schedules, and configure console access secrets.
          </p>
        </div>

        {/* Split grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Panel 1: Biometric Calibration */}
          <motion.div
            className="glass-panel rounded-3xl p-8 border border-white/5 text-left space-y-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h3 className="font-heading font-bold text-white text-base mb-1 uppercase tracking-wider flex items-center">
                <User className="w-5 h-5 text-electric-cyan mr-2" />
                Biometric Calibration
              </h3>
              <p className="text-xs text-gray-500">
                Setup initial metrics to automatically scale nutritional portions, targets, and exercise programs.
              </p>
            </div>

            <AnimatePresence>
              {profileMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-neon-mint/10 border border-neon-mint/20 text-xs text-neon-mint rounded-xl flex items-start space-x-2"
                >
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{profileMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
                    <Scale className="w-3.5 h-3.5 text-gray-500 mr-1" />
                    Start
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 102.5"
                    value={profileInput.starting_weight}
                    onChange={(e) => setProfileInput({ ...profileInput, starting_weight: e.target.value })}
                    className="w-full text-xs py-2.5"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
                    <Ruler className="w-3.5 h-3.5 text-gray-500 mr-1" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 178"
                    value={profileInput.height}
                    onChange={(e) => setProfileInput({ ...profileInput, height: e.target.value })}
                    className="w-full text-xs py-2.5"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
                    <Trophy className="w-3.5 h-3.5 text-gray-500 mr-1" />
                    Goal
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 64.5"
                    value={profileInput.goal_weight}
                    onChange={(e) => setProfileInput({ ...profileInput, goal_weight: e.target.value })}
                    className="w-full text-xs py-2.5"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
                  Program Start Date
                </label>
                <input
                  type="date"
                  value={profileInput.start_date}
                  onChange={(e) => setProfileInput({ ...profileInput, start_date: e.target.value })}
                  className="w-full text-xs py-2.5"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-white/5 border border-white/8 hover:bg-white/10 hover:border-white/15 text-white font-bold text-xs rounded-xl tracking-wider uppercase transition-all duration-300 cursor-pointer"
              >
                Write Baselines
              </button>
            </form>
          </motion.div>

          {/* Panel 2: Credentials Security */}
          <motion.div
            className="glass-panel rounded-3xl p-8 border border-white/5 text-left space-y-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div>
              <h3 className="font-heading font-bold text-white text-base mb-1 uppercase tracking-wider flex items-center">
                <Lock className="w-5 h-5 text-electric-cyan mr-2" />
                Access Security
              </h3>
              <p className="text-xs text-gray-500">
                Modify terminal secrets directly or trigger secure validation key requests to your email box.
              </p>
            </div>

            <AnimatePresence>
              {securityError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 text-xs text-red-300 rounded-xl flex items-start space-x-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{securityError}</span>
                </motion.div>
              )}

              {securityMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-neon-mint/10 border border-neon-mint/20 text-xs text-neon-mint rounded-xl flex items-start space-x-2"
                >
                  <Check className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{securityMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleDirectPasswordSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center">
                  <KeyRound className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
                  New Access Password
                </label>
                <input
                  type="password"
                  value={directPassword}
                  onChange={(e) => setDirectPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTriggerResetEmail}
                  disabled={isSendingResetEmail}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-xs font-bold uppercase tracking-wider text-gray-300 border border-transparent rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isSendingResetEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Email Verify Update</span>
                    </>
                  )}
                </button>
                
                <button
                  type="submit"
                  className="flex-1 py-3 bg-electric-cyan text-obsidian font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all rounded-xl cursor-pointer"
                >
                  Update Access Key
                </button>
              </div>
            </form>
          </motion.div>

        </div>

      </div>
    </div>
  )
}
