import React, { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import ProgressRing from '../components/ProgressRing'
import WarnBanner from '../components/WarnBanner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import {
  Flame,
  TrendingDown,
  Footprints,
  Droplet,
  Plus,
  Trophy,
  Calendar,
  Sparkles,
  Activity,
  Loader2,
  Check
} from 'lucide-react'

// Helper to get local date string YYYY-MM-DD
const getTodayStr = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().split('T')[0]
}

export default function Home() {
  const userMetrics = useStore((state) => state.userMetrics)
  const dailyLogs = useStore((state) => state.dailyLogs)
  const logDailyMetric = useStore((state) => state.logDailyMetric)

  const [chartDays, setChartDays] = useState(14)
  const [successMsg, setSuccessMsg] = useState('')

  // Local states for telemetry logging inputs
  const [logInput, setLogInput] = useState({
    steps: '',
    weight: '',
    calories: ''
  })

  // Loading guard for userMetrics configuration checks
  if (!userMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian text-white relative">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-electric-cyan" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
            Syncing Biometrics...
          </span>
        </div>
      </div>
    )
  }

  const todayStr = getTodayStr()
  const todayLog = dailyLogs.find((l) => l.date === todayStr) || {
    weight: null,
    steps: 0,
    calories_consumed: 0,
    water_intake_liters: 0
  }

  // Calculate day tenure & current calorie target (timezone-neutral)
  const getTenureStats = () => {
    if (!userMetrics.start_date) return { days: 1, phase: 1, calorieTarget: 2500 }
    
    const [year, month, day] = userMetrics.start_date.split('-').map(Number)
    const start = new Date(year, month - 1, day)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const diffTime = today.getTime() - start.getTime()
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    const activeDays = Math.max(days, 1)
    const phase = activeDays <= 15 ? 1 : 2
    const calorieTarget = activeDays <= 30 ? 2500 : 2100
    
    return { days: activeDays, phase, calorieTarget }
  }

  const { days: tenureDays, phase: currentPhase, calorieTarget } = getTenureStats()

  // Get last recorded weight for baseline
  const getLatestWeight = () => {
    if (todayLog.weight) return todayLog.weight
    for (let i = dailyLogs.length - 1; i >= 0; i--) {
      if (dailyLogs[i].weight) return dailyLogs[i].weight
    }
    return userMetrics.starting_weight
  }

  const currentWeight = getLatestWeight()
  const caloriesLeft = Math.max(calorieTarget - todayLog.calories_consumed, 0)
  const totalWeightLoss = parseFloat((userMetrics.starting_weight - currentWeight).toFixed(1))
  const totalWeightLossGoal = parseFloat((userMetrics.starting_weight - userMetrics.goal_weight).toFixed(1))
  const weightProgressPct = Math.min(Math.max((totalWeightLoss / totalWeightLossGoal) * 100, 0), 100)

  // BMI calculations
  const heightInMeters = userMetrics.height ? userMetrics.height / 100 : 0
  const bmi = heightInMeters > 0 && currentWeight > 0 
    ? parseFloat((currentWeight / (heightInMeters * heightInMeters)).toFixed(1)) 
    : 0

  const getBmiDetails = (val) => {
    if (val <= 0) return { category: 'N/A', color: 'text-gray-500', bg: 'bg-white/5', border: 'border-white/5' }
    if (val < 18.5) return { category: 'Underweight', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' }
    if (val < 25.0) return { category: 'Optimal', color: 'text-neon-mint', bg: 'bg-neon-mint/10', border: 'border-neon-mint/20' }
    if (val < 30.0) return { category: 'Overweight', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' }
    return { category: 'Obese', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
  }

  const bmiDetails = getBmiDetails(bmi)

  // Log water intake
  const handleWaterUpdate = (amount) => {
    const nextWater = Math.max(parseFloat((todayLog.water_intake_liters + amount).toFixed(1)), 0)
    logDailyMetric(todayStr, { water_intake_liters: nextWater })
  }

  // Handle telemetry ingestion
  const handleQuickLog = (e, field) => {
    e.preventDefault()
    let value = logInput[field]
    if (!value) return

    if (field === 'steps') {
      logDailyMetric(todayStr, { steps: parseInt(value) })
      setSuccessMsg(`Steps logged: +${value} steps.`)
    } else if (field === 'weight') {
      logDailyMetric(todayStr, { weight: parseFloat(value) })
      setSuccessMsg(`Weight logged: ${value} kg.`)
    } else if (field === 'calories') {
      logDailyMetric(todayStr, { calories_consumed: parseInt(value) })
      setSuccessMsg(`Calorie intake logged: +${value} kcal.`)
    }

    setLogInput({ ...logInput, [field]: '' })
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  // Memoize filtered chart data
  const chartData = useMemo(() => {
    const sorted = [...dailyLogs].sort((a, b) => new Date(a.date) - new Date(b.date))
    const sliced = sorted.slice(-chartDays)

    return sliced.map((log) => {
      const d = new Date(log.date)
      const formattedDate = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      })
      return {
        ...log,
        formattedDate,
        weight: log.weight ? parseFloat(log.weight) : null,
        calories: log.calories_consumed || 0
      }
    })
  }, [dailyLogs, chartDays])

  // Custom tooltips matching the dark glassmorphic cyber theme
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="glass-panel-neon border border-electric-cyan/20 p-4 rounded-xl text-left text-xs space-y-2">
          <p className="font-bold text-white uppercase tracking-wider mb-1">{data.formattedDate}</p>
          {payload.map((item, idx) => {
            const isWeight = item.dataKey === 'weight'
            return (
              <div key={idx} className="flex items-center justify-between space-x-6">
                <span className="text-gray-400 capitalize">{item.name}:</span>
                <span className={`font-bold ${isWeight ? 'text-electric-cyan' : 'text-neon-mint'}`}>
                  {item.value ? item.value.toLocaleString() : 'N/A'} {isWeight ? 'kg' : 'kcal'}
                </span>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen pb-32 text-gray-300 relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-electric-cyan/5 rounded-full filter blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-neon-mint/3 rounded-full filter blur-[80px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 pt-6 md:pt-10">
        <WarnBanner />

        {/* Hero Section */}
        <div className="mb-10 text-left">
          <div className="flex items-center space-x-2.5 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-xs font-semibold text-electric-cyan uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_10px_rgba(0,242,254,0.1)]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {tenureDays}</span>
            </span>
            <span className="px-2.5 py-1 rounded-full bg-neon-mint/10 border border-neon-mint/20 text-xs font-semibold text-neon-mint uppercase tracking-wider flex items-center space-x-1.5 shadow-[0_0_10px_rgba(0,245,160,0.1)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Workout Phase {currentPhase}</span>
            </span>
          </div>
          <h1 className="font-heading font-black text-3xl md:text-5xl text-white tracking-tight leading-none mb-3">
            PROJECT <span className="text-electric-cyan drop-shadow-[0_0_10px_rgba(0,242,254,0.2)]">ATMAN</span>
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-xl font-light">
            Unified telemetry console for biometric aggregation, energy tracking, mass indexing, and graphical analysis.
          </p>
        </div>

        {/* Diagnostic Status Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          
          {/* Steps Progress Ring */}
          <motion.div
            className="glass-panel-neon rounded-2xl p-5 flex flex-col items-center justify-center border border-white/5"
            whileHover={{ y: -3 }}
          >
            <h3 className="font-heading font-bold text-white text-xs self-start mb-4 uppercase tracking-wider flex items-center">
              <Footprints className="w-3.5 h-3.5 text-electric-cyan mr-1.5" />
              Movement Index
            </h3>
            <ProgressRing value={todayLog.steps} max={8000} size={150} strokeWidth={10} />
          </motion.div>

          {/* Calories Left Panel */}
          <motion.div
            className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-white/5 relative overflow-hidden"
            whileHover={{ y: -3 }}
          >
            <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-neon-mint/5 rounded-full filter blur-2xl pointer-events-none" />
            <div>
              <h3 className="font-heading font-bold text-white text-xs mb-3 uppercase tracking-wider flex items-center">
                <Flame className="w-3.5 h-3.5 text-neon-mint mr-1.5" />
                Intake Engine
              </h3>
              <div className="text-left space-y-0.5">
                <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block">Remaining</span>
                <span className="font-heading font-extrabold text-3xl text-white block neon-text-mint">
                  {caloriesLeft.toLocaleString()}{' '}
                  <span className="text-sm font-light text-gray-500 uppercase tracking-widest">kcal</span>
                </span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-neon-mint to-electric-cyan h-full rounded-full"
                  style={{ width: `${Math.min((todayLog.calories_consumed / calorieTarget) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 font-semibold tracking-wider uppercase">
                <span>In: {todayLog.calories_consumed.toLocaleString()}</span>
                <span>Max: {calorieTarget.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Weight Milestones (Mission Tracker) */}
          <motion.div
            className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-white/5 relative overflow-hidden"
            whileHover={{ y: -3 }}
          >
            <div>
              <h3 className="font-heading font-bold text-white text-xs mb-3 uppercase tracking-wider flex items-center">
                <Trophy className="w-3.5 h-3.5 text-yellow-500 mr-1.5" />
                Weight Milestone
              </h3>
              <div className="grid grid-cols-2 gap-2 text-left">
                <div>
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block">Latest</span>
                  <span className="font-heading font-extrabold text-lg text-white">
                    {currentWeight || 'N/A'} <span className="text-[10px] text-gray-400 font-light">kg</span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block">Target</span>
                  <span className="font-heading font-extrabold text-lg text-white">
                    {userMetrics.goal_weight} <span className="text-[10px] text-gray-400 font-light">kg</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div>
                <div className="flex justify-between text-[9px] text-gray-500 mb-1 font-semibold">
                  <span className="text-yellow-500 font-bold uppercase tracking-wider flex items-center">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    Lost {totalWeightLoss} kg
                  </span>
                  <span>Goal: -{totalWeightLossGoal} kg</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-yellow-500 h-full rounded-full"
                    style={{ width: `${weightProgressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* BMI Diagnostic Display */}
          <motion.div
            className={`glass-panel rounded-2xl p-5 flex flex-col justify-between border relative overflow-hidden transition-all duration-300 ${bmiDetails.border}`}
            whileHover={{ y: -3 }}
          >
            <div>
              <h3 className="font-heading font-bold text-white text-xs mb-3 uppercase tracking-wider flex items-center">
                <Activity className="w-3.5 h-3.5 text-electric-cyan mr-1.5" />
                Somatic BMI Index
              </h3>
              <div className="text-left space-y-0.5">
                <span className="text-gray-500 text-[9px] font-bold uppercase tracking-wider block">Body Mass Index</span>
                <span className="font-heading font-extrabold text-3xl text-white block">
                  {bmi > 0 ? bmi : '0.0'}{' '}
                  <span className="text-xs font-light text-gray-400">Index</span>
                </span>
              </div>
            </div>
            <div className={`mt-4 px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${bmiDetails.bg} ${bmiDetails.border}`}>
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Classification</span>
              <span className={`font-bold ${bmiDetails.color}`}>{bmiDetails.category}</span>
            </div>
          </motion.div>

        </div>

        {/* Alert Feedback for Logging Operations */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-3 rounded-xl bg-neon-mint/10 border border-neon-mint/20 text-xs text-neon-mint text-left flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Telemetry Ingestion Panel (Full-Width Row) */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <motion.div
            className="glass-panel rounded-2xl p-6 border border-white/5 text-left"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-4">
              <h3 className="font-heading font-bold text-white text-base mb-1 uppercase tracking-wider flex items-center">
                <Activity className="w-4.5 h-4.5 text-electric-cyan mr-2" />
                Ingestion Core
              </h3>
              <p className="text-xs text-gray-500">
                Overwrite steps, body mass, and calorie levels into today's active registers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <form onSubmit={(e) => handleQuickLog(e, 'steps')} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Steps Logged</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="e.g. 8000"
                    value={logInput.steps}
                    onChange={(e) => setLogInput({ ...logInput, steps: e.target.value })}
                    className="w-full text-xs py-2.5 px-3"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-electric-cyan/15 border border-electric-cyan/20 rounded-xl text-electric-cyan font-bold text-xs uppercase cursor-pointer">
                    Log
                  </button>
                </div>
              </form>

              <form onSubmit={(e) => handleQuickLog(e, 'weight')} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Body Weight (kg)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 78.5"
                    value={logInput.weight}
                    onChange={(e) => setLogInput({ ...logInput, weight: e.target.value })}
                    className="w-full text-xs py-2.5 px-3"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-yellow-500/15 border border-yellow-500/20 rounded-xl text-yellow-400 font-bold text-xs uppercase cursor-pointer">
                    Log
                  </button>
                </div>
              </form>

              <form onSubmit={(e) => handleQuickLog(e, 'calories')} className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Calorie Intake (kcal)</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="e.g. 650"
                    value={logInput.calories}
                    onChange={(e) => setLogInput({ ...logInput, calories: e.target.value })}
                    className="w-full text-xs py-2.5 px-3"
                  />
                  <button type="submit" className="px-4 py-2.5 bg-neon-mint/15 border border-neon-mint/20 rounded-xl text-neon-mint font-bold text-xs uppercase cursor-pointer">
                    Log
                  </button>
                </div>
              </form>
            </div>
            
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">H2O Hydration Tracking</span>
              <div className="flex space-x-1.5 items-center">
                <button onClick={() => handleWaterUpdate(-0.25)} className="px-2.5 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:bg-white/10">-0.25L</button>
                <span className="text-sm text-white font-black px-3">{todayLog.water_intake_liters.toFixed(2)} L</span>
                <button onClick={() => handleWaterUpdate(0.25)} className="px-2.5 py-1.5 bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 rounded-lg text-xs font-bold hover:bg-cyan-500/25">+0.25L</button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dual Axis Analytical Graph */}
        <motion.div
          className="glass-panel rounded-2xl p-5 md:p-6 border border-white/5 text-left"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-heading font-bold text-white text-base uppercase tracking-wider flex items-center">
                <Activity className="w-4.5 h-4.5 text-electric-cyan mr-1.5" />
                Telemetry Graph (Mass vs Intake)
              </h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Biometric curves plotted over daily intake grids.
              </p>
            </div>
            
            <div className="flex bg-white/5 border border-white/5 p-0.5 rounded-lg shrink-0 self-start sm:self-center">
              {[7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => setChartDays(days)}
                  className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    chartDays === days
                      ? 'bg-electric-cyan text-obsidian shadow-[0_0_10px_rgba(0,242,254,0.15)] font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-72">
            {chartData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl">
                <Activity className="w-8 h-8 text-gray-600 animate-pulse mb-1" />
                <p className="text-xs text-gray-500 uppercase tracking-widest">No telemetry records found</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: -5, left: -5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F5A0" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#00F5A0" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid stroke="rgba(255, 255, 255, 0.03)" vertical={false} />
                  
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#4B5563"
                    fontSize={9}
                    fontFamily="Inter"
                    dy={8}
                    tickLine={false}
                  />
                  
                  {/* Left Axis - Weight */}
                  <YAxis
                    yAxisId="left"
                    stroke="#00F2FE"
                    fontSize={9}
                    fontFamily="Inter"
                    dx={-8}
                    tickLine={false}
                    axisLine={false}
                    domain={['dataMin - 1.5', 'dataMax + 1.5']}
                  />
                  
                  {/* Right Axis - Calories */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    stroke="#00F5A0"
                    fontSize={9}
                    fontFamily="Inter"
                    dx={8}
                    tickLine={false}
                    axisLine={false}
                  />
                  
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.01)' }} />
                  
                  <Legend
                    verticalAlign="top"
                    height={30}
                    iconType="circle"
                    formatter={(value) => (
                      <span className="text-[10px] font-semibold text-gray-400 capitalize tracking-wider mr-4">
                        {value === 'weight' ? 'Body Mass (kg)' : 'Calorie Intake (kcal)'}
                      </span>
                    )}
                  />
                  
                  <Bar
                    yAxisId="right"
                    dataKey="calories"
                    name="calories"
                    fill="url(#colorCalories)"
                    stroke="#00F5A0"
                    strokeWidth={1}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    name="weight"
                    stroke="#00F2FE"
                    strokeWidth={2}
                    dot={{ fill: '#00F2FE', stroke: '#090A0F', strokeWidth: 1.5, r: 3.5 }}
                    activeDot={{ fill: '#00F2FE', stroke: '#00F2FE', strokeWidth: 1, r: 5 }}
                    connectNulls={true}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
