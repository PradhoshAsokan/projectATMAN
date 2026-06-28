import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import WarnBanner from '../components/WarnBanner'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, KeyRound, Mail, AlertCircle, Check, Loader2 } from 'lucide-react'

export default function Security() {
  const user = useStore((state) => state.user)
  const updatePassword = useStore((state) => state.updatePassword)
  const resetPassword = useStore((state) => state.resetPassword)

  const [directPassword, setDirectPassword] = useState('')
  const [securityMsg, setSecurityMsg] = useState('')
  const [securityError, setSecurityError] = useState('')
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false)

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

  return (
    <div className="min-h-screen pb-32 text-gray-300 relative">
      <div className="max-w-xl mx-auto px-4 pt-6 md:pt-10">
        <WarnBanner />

        {/* Header */}
        <div className="mb-8 text-left">
          <h1 className="font-heading font-black text-3xl md:text-5xl text-white tracking-tight leading-none mb-3 uppercase">
            Security <span className="text-electric-cyan neon-text-cyan">Console</span>
          </h1>
          <p className="text-sm text-gray-400 font-light">
            Calibrate access secret parameters and request credential dispatch logs.
          </p>
        </div>

        {/* Console Box */}
        <motion.div
          className="glass-panel rounded-3xl p-8 border border-white/5 text-left space-y-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h3 className="font-heading font-bold text-white text-base mb-1 uppercase tracking-wider flex items-center">
              <Lock className="w-5 h-5 text-electric-cyan mr-2" />
              Credentials Management
            </h3>
            <p className="text-xs text-gray-500">
              Modify terminal secrets directly or verify changes through secure email workflows.
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

          <div className="pt-6 border-t border-white/5 text-[11px] text-gray-500 leading-normal">
            <strong>Security Notice:</strong> Requesting email resets will dispatch a token verification redirect to your mailbox. Clicking that link initiates the recovery modal dialogue from any active terminal console.
          </div>
        </motion.div>

      </div>
    </div>
  )
}
