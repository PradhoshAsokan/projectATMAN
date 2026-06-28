import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Dumbbell, Apple, LogOut, Flame, Lock } from 'lucide-react'
import { useStore } from '../store/useStore'
import { motion } from 'framer-motion'

export default function Navigation() {
  const logout = useStore((state) => state.logout)
  const isDemoMode = useStore((state) => state.isDemoMode)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/home', label: 'Home', icon: Home },
    { to: '/exercise', label: 'Workouts', icon: Dumbbell },
    { to: '/food', label: 'Diet', icon: Apple },
    { to: '/security', label: 'Security', icon: Lock },
  ]

  return (
    <>
      {/* Sidebar - Desktop Layout (md and up) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 glass-panel border-r border-white/5 p-6 justify-between z-40">
        <div>
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3 mb-10 px-2">
            <div className="bg-electric-cyan/10 p-2 rounded-lg border border-electric-cyan/30">
              <Flame className="w-6 h-6 text-electric-cyan neon-text-cyan animate-pulse" />
            </div>
            <span className="font-heading font-bold text-lg tracking-wider text-white">
              PROJECT <span className="text-electric-cyan font-light">ATMAN</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-4 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? 'bg-electric-cyan/10 text-electric-cyan border border-electric-cyan/20 neon-border-cyan'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                        isActive ? 'text-electric-cyan drop-shadow-[0_0_5px_rgba(0,242,254,0.5)]' : ''
                      }`}
                    />
                    <span className="font-medium tracking-wide text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-electric-cyan shadow-[0_0_8px_#00F2FE]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-4">
          {isDemoMode && (
            <div className="px-4 py-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-400/80 leading-relaxed">
              Running in <strong className="text-yellow-300 font-semibold">Demo Mode</strong>. Data is saved locally.
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-4 px-4 py-3.5 w-full rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium tracking-wide text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Floating Bottom Nav - Mobile Layout (sm/xs screens) */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 glass-panel-neon rounded-2xl flex items-center justify-around px-4 z-40 border border-electric-cyan/20">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-300 relative ${
                isActive ? 'text-electric-cyan' : 'text-gray-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 mb-0.5 transition-transform ${
                    isActive ? 'scale-110 drop-shadow-[0_0_4px_rgba(0,242,254,0.6)]' : ''
                  }`}
                />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicatorMobile"
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-electric-cyan shadow-[0_0_6px_#00F2FE]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-2 px-3 text-red-400/80 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-medium tracking-wide">Exit</span>
        </button>
      </nav>
    </>
  )
}
