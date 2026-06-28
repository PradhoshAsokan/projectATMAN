import React from 'react'
import { motion } from 'framer-motion'

export default function ProgressRing({
  value = 0,
  max = 8000,
  size = 220,
  strokeWidth = 14,
  color = '#00F2FE',
  trailColor = 'rgba(255, 255, 255, 0.05)',
  glow = true
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const percentage = Math.min(value / max, 1)
  const strokeDashoffset = circumference - percentage * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={trailColor}
          strokeWidth={strokeWidth}
        />
        {/* Glow Shadow Filter */}
        {glow && (
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        {/* Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          filter={glow ? 'url(#neon-glow)' : undefined}
          style={{
            transition: 'stroke 0.3s ease',
          }}
        />
      </svg>
      {/* Centered Content Slot */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-heading font-extrabold text-3xl text-white tracking-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
          {value.toLocaleString()}
        </span>
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mt-0.5">
          Steps Logged
        </span>
        <span className="text-xs text-gray-400 mt-1.5 font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
          Goal: {max.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
