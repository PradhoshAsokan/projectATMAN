import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import WarnBanner from '../components/WarnBanner'
import { motion, AnimatePresence } from 'framer-motion'
import { Dumbbell, CalendarRange, Check, X, ShieldAlert, Sparkles, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

const getTodayStr = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().split('T')[0]
}

const getDayName = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long' })
}

// Workout data library
const WORKOUT_CATALOG = {
  phase1: {
    title: "Tactical Mobility & Core",
    description: "Low-impact bodyweight work to establish tendon strength, joint mobility, and core integrity.",
    schedule: {
      Monday: [
        { name: "Wall Pushups", desc: "Chest and front shoulders. Maintain a straight body line.", defaultSets: 3, defaultReps: 12, target: "Chest/Shoulders" },
        { name: "Air Squats", desc: "Lower body mobility. Keep weight on heels, chest upright.", defaultSets: 3, defaultReps: 10, target: "Quads/Glutes" },
        { name: "Glute Bridges", desc: "Glutes and lower back activation. Squeeze glutes at top.", defaultSets: 2, defaultReps: 12, target: "Glutes/Hamstrings" }
      ],
      Tuesday: [
        { name: "Plank Hold", desc: "Core static strength. Tighten abs, glutes and do not sag.", defaultSets: 3, defaultReps: 30, target: "Core Static (secs)" },
        { name: "Shoulder Taps", desc: "Shoulder stability. Tap opposite shoulder in plank position.", defaultSets: 2, defaultReps: 12, target: "Shoulders/Core" }
      ],
      Wednesday: [
        { name: "Wall Pushups", desc: "Chest and front shoulders. Squeeze shoulder blades.", defaultSets: 3, defaultReps: 12, target: "Chest/Shoulders" },
        { name: "Air Squats", desc: "Lower body mobility. Push knees outward on descent.", defaultSets: 3, defaultReps: 12, target: "Quads/Glutes" },
        { name: "Situps", desc: "Abdominal strength. Exhale on the way up, roll up smoothly.", defaultSets: 2, defaultReps: 10, target: "Abdominals" }
      ],
      Thursday: [
        { name: "Plank Hold", desc: "Core static strength. Tighten abs and breathe steadily.", defaultSets: 3, defaultReps: 40, target: "Core Static (secs)" },
        { name: "Glute Bridges", desc: "Glutes and lower back activation.", defaultSets: 3, defaultReps: 12, target: "Glutes/Hamstrings" }
      ],
      Friday: [
        { name: "Wall Pushups", desc: "Chest and front shoulders.", defaultSets: 3, defaultReps: 15, target: "Chest/Shoulders" },
        { name: "Air Squats", desc: "Lower body mobility.", defaultSets: 3, defaultReps: 15, target: "Quads/Glutes" },
        { name: "Situps", desc: "Abdominal strength.", defaultSets: 3, defaultReps: 12, target: "Abdominals" }
      ],
      Saturday: [
        { name: "Light Mobility Walk", desc: "Active recovery. Walk at an easy pace to clear lactic acid.", defaultSets: 1, defaultReps: 20, target: "Cardio (mins)" }
      ],
      Sunday: [
        { name: "Passive Stretch Protocol", desc: "Rest day. Focus on hamstring, quad, and shoulder stretches.", defaultSets: 1, defaultReps: 15, target: "Flexibility (mins)" }
      ]
    }
  },
  phase2: {
    title: "Hypertrophic Resistance Matrix",
    description: "Unlocking weighted resistance routines. Preserves fat-free mass and raises base metabolic rate.",
    schedule: {
      Monday: [
        { name: "Dumbbell Goblet Squats", desc: "Hold DB vertically at chest. Squat to parallel.", defaultSets: 3, defaultReps: 10, target: "Quads/Glutes", isWeighted: true },
        { name: "Dumbbell Floor Press", desc: "Lying flat on floor. Press dumbbells straight up.", defaultSets: 3, defaultReps: 10, target: "Chest/Triceps", isWeighted: true },
        { name: "Dumbbell Rows", desc: "Bent over row, pulling dumbbell to hip. Focus on lats.", defaultSets: 3, defaultReps: 10, target: "Upper Back/Lats", isWeighted: true }
      ],
      Tuesday: [
        { name: "Standing Dumbbell Shoulder Press", desc: "Press dumbbells vertically. Keep core braced.", defaultSets: 3, defaultReps: 8, target: "Shoulders/Triceps", isWeighted: true },
        { name: "Dumbbell Romanian Deadlifts", desc: "Hinge at hips, slide DBs down shins. Squeeze hamstrings.", defaultSets: 3, defaultReps: 10, target: "Hamstrings/Lower Back", isWeighted: true },
        { name: "Dumbbell Bicep Curls", desc: "Standard standing curls. Squeeze biceps.", defaultSets: 2, defaultReps: 12, target: "Biceps", isWeighted: true }
      ],
      Wednesday: [
        { name: "Dumbbell Goblet Squats", desc: "Drive knees outward, weight in heels.", defaultSets: 3, defaultReps: 12, target: "Quads/Glutes", isWeighted: true },
        { name: "Dumbbell Floor Press", desc: "Keep elbows at 45 degree angle relative to body.", defaultSets: 3, defaultReps: 12, target: "Chest/Triceps", isWeighted: true },
        { name: "Dumbbell Rows", desc: "Pull from elbow. Keep spine neutral.", defaultSets: 3, defaultReps: 12, target: "Upper Back/Lats", isWeighted: true }
      ],
      Thursday: [
        { name: "Dumbbell Shoulder Press", desc: "Exhale on upward press.", defaultSets: 3, defaultReps: 10, target: "Shoulders/Triceps", isWeighted: true },
        { name: "Romanian Deadlifts", desc: "Keep weights close to legs. Flat back.", defaultSets: 3, defaultReps: 12, target: "Hamstrings/Lower Back", isWeighted: true },
        { name: "Dumbbell Hammer Curls", desc: "Neutral grip bicep curls.", defaultSets: 2, defaultReps: 12, target: "Biceps/Forearms", isWeighted: true }
      ],
      Friday: [
        { name: "Dumbbell Goblet Squats", desc: "Control the descent (3 seconds down).", defaultSets: 3, defaultReps: 10, target: "Quads/Glutes", isWeighted: true },
        { name: "Dumbbell Floor Press", desc: "Control weight down, explode up.", defaultSets: 3, defaultReps: 10, target: "Chest/Triceps", isWeighted: true },
        { name: "Dumbbell Rows", desc: "Squeeze shoulder blades at top of row.", defaultSets: 3, defaultReps: 10, target: "Upper Back/Lats", isWeighted: true }
      ],
      Saturday: [
        { name: "LISS Cardio Protocol", desc: "Low Intensity Steady State. Light jogging or incline walking.", defaultSets: 1, defaultReps: 30, target: "Cardio (mins)" }
      ],
      Sunday: [
        { name: "System Recalibration", desc: "Rest day. Do basic dynamic stretches to restore joint range.", defaultSets: 1, defaultReps: 15, target: "Flexibility (mins)" }
      ]
    }
  }
}

export default function Exercise() {
  const userMetrics = useStore((state) => state.userMetrics)
  const workoutsLogged = useStore((state) => state.workoutsLogged)
  const logWorkout = useStore((state) => state.logWorkout)

  const [activeTab, setActiveTab] = useState('day') // 'day' | 'week'
  const [selectedWeekDay, setSelectedWeekDay] = useState(getDayName(getTodayStr()))
  const [expandedIndex, setExpandedIndex] = useState(null)
  
  // Local states for inputs inside expanded card
  const [formSets, setFormSets] = useState('3')
  const [formReps, setFormReps] = useState('10')
  const [formWeight, setFormWeight] = useState('0')

  if (!userMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian text-white relative">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-electric-cyan" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
            Syncing Workouts...
          </span>
        </div>
      </div>
    )
  }

  const todayStr = getTodayStr()
  const todayName = getDayName(todayStr)

  // Calculate days active (timezone-neutral)
  const getTenureDays = () => {
    if (!userMetrics.start_date) return 1
    const [year, month, day] = userMetrics.start_date.split('-').map(Number)
    const start = new Date(year, month - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diffTime = today.getTime() - start.getTime()
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
    return Math.max(days, 1)
  }

  const tenureDays = getTenureDays()
  const currentPhaseKey = tenureDays <= 15 ? 'phase1' : 'phase2'
  const phaseData = WORKOUT_CATALOG[currentPhaseKey]

  // Decide current workouts shown based on view state
  const targetDayName = activeTab === 'day' ? todayName : selectedWeekDay
  const exercisesList = phaseData.schedule[targetDayName] || []

  // Check if a specific exercise was logged today
  const getLoggedStatus = (exerciseName) => {
    return workoutsLogged.find(
      (w) => w.exercise_name === exerciseName && w.date === todayStr
    )
  }

  const handleCardExpand = (idx, exercise) => {
    if (expandedIndex === idx) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(idx)
      setFormSets(String(exercise.defaultSets))
      setFormReps(String(exercise.defaultReps))
      
      // Look up last weight used for this exercise to auto-populate
      const pastLog = workoutsLogged.find((w) => w.exercise_name === exercise.name)
      setFormWeight(pastLog ? String(pastLog.weight_used) : '0')
    }
  }

  const handleLogSubmit = async (exerciseName, status) => {
    await logWorkout({
      date: todayStr,
      exercise_name: exerciseName,
      sets: parseInt(formSets) || 3,
      reps: parseInt(formReps) || 10,
      weight_used: parseFloat(formWeight) || 0,
      status: status // 'completed' | 'skipped'
    })
    setExpandedIndex(null)
  }

  return (
    <div className="min-h-screen pb-32 text-gray-300">
      <div className="max-w-3xl mx-auto px-4 pt-6 md:pt-10">
        <WarnBanner />

        {/* Header */}
        <div className="mb-8 text-left">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-electric-cyan/10 border border-electric-cyan/20 text-xs font-semibold text-electric-cyan uppercase tracking-wider flex items-center space-x-1 shadow-[0_0_10px_rgba(0,242,254,0.05)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tenureDays <= 15 ? 'Mobility Focus (Phase 1)' : 'Resistance Training (Phase 2)'}</span>
            </span>
          </div>
          <h1 className="font-heading font-black text-3xl md:text-5xl text-white tracking-tight leading-none mb-3 uppercase">
            Exercise <span className="text-electric-cyan neon-text-cyan">Protocol</span>
          </h1>
          <p className="text-sm text-gray-400 font-light max-w-xl">
            {phaseData.description} Running under Day {tenureDays} parameters.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-white/5 border border-white/5 p-1 rounded-2xl mb-8 relative">
          <button
            onClick={() => {
              setActiveTab('day')
              setExpandedIndex(null)
            }}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'day'
                ? 'bg-electric-cyan text-obsidian shadow-[0_0_15px_rgba(0,242,254,0.2)] font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>Today's Routine</span>
          </button>
          
          <button
            onClick={() => {
              setActiveTab('week')
              setExpandedIndex(null)
            }}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 ${
              activeTab === 'week'
                ? 'bg-electric-cyan text-obsidian shadow-[0_0_15px_rgba(0,242,254,0.2)] font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Weekly Split</span>
          </button>
        </div>

        {/* Weekly Split Day Selectors */}
        {activeTab === 'week' && (
          <div className="flex overflow-x-auto space-x-2 pb-4 mb-6 scrollbar-thin select-none">
            {Object.keys(phaseData.schedule).map((day) => {
              const isToday = day === todayName
              const isSelected = day === selectedWeekDay
              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedWeekDay(day)
                    setExpandedIndex(null)
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-white/10 text-white border-electric-cyan/40 shadow-[0_0_10px_rgba(0,242,254,0.1)]'
                      : isToday
                      ? 'bg-electric-cyan/5 text-electric-cyan/90 border-electric-cyan/20'
                      : 'bg-white/5 text-gray-400 border-transparent hover:text-white'
                  }`}
                >
                  {day.slice(0, 3)}
                  {isToday && <span className="ml-1 text-[8px] text-electric-cyan font-black">•</span>}
                </button>
              )
            })}
          </div>
        )}

        {/* Exercises List */}
        <div className="space-y-4">
          
          {/* Active view status */}
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-widest px-1">
            <span>{targetDayName} Lineup</span>
            <span className="text-gray-600">
              {exercisesList.length} Movement{exercisesList.length !== 1 ? 's' : ''}
            </span>
          </div>

          {exercisesList.map((exercise, idx) => {
            const logged = getLoggedStatus(exercise.name)
            const isExpanded = expandedIndex === idx
            
            // Allow logging only on the "Today" view, or if in Week view and selecting Today's day name.
            // If viewing another weekday's schedule, logging should either warn or log as past data.
            // Let's allow logging but display a clear target date indicator.
            const loggingTargetDate = todayStr

            return (
              <motion.div
                key={idx}
                layout="position"
                className={`rounded-2xl transition-all duration-300 border ${
                  logged
                    ? logged.status === 'completed'
                      ? 'bg-neon-mint/5 border-neon-mint/20 shadow-[0_4px_20px_rgba(0,245,160,0.02)]'
                      : 'bg-red-500/5 border-red-500/20'
                    : isExpanded
                    ? 'bg-[#12131C] border-electric-cyan/30 shadow-[0_4px_20px_rgba(0,242,254,0.03)]'
                    : 'bg-[#12131C] border-white/5 hover:border-white/10'
                }`}
              >
                {/* Header Section */}
                <div
                  onClick={() => handleCardExpand(idx, exercise)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="text-left space-y-1 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-electric-cyan px-2 py-0.5 bg-electric-cyan/15 rounded-md">
                      {exercise.target}
                    </span>
                    <h3 className="font-heading font-bold text-white text-base mt-1.5 flex items-center">
                      {exercise.name}
                      {logged && (
                        <span className={`ml-2 p-0.5 rounded-full inline-flex items-center justify-center ${
                          logged.status === 'completed' ? 'bg-neon-mint text-obsidian' : 'bg-red-500 text-white'
                        }`}>
                          {logged.status === 'completed' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-light mt-1">
                      {exercise.desc}
                    </p>
                  </div>
                  
                  <div className="shrink-0 flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Target Sets</span>
                      <span className="font-heading font-extrabold text-sm text-white">
                        {exercise.defaultSets} <span className="text-xs text-gray-500 font-light">sets</span> × {exercise.defaultReps}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-electric-cyan' : ''}`} />
                  </div>
                </div>

                {/* Collapsible Panel */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="p-5 bg-black/10 text-left">
                        {logged ? (
                          <div className="bg-white/5 border border-white/5 p-4 rounded-xl flex items-start space-x-3">
                            {logged.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-neon-mint shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <h4 className="font-bold text-white text-xs uppercase tracking-wide">
                                Activity Logged
                              </h4>
                              <p className="text-xs text-gray-400 mt-1">
                                {logged.status === 'completed' 
                                  ? `You completed: ${logged.sets} sets × ${logged.reps} reps ${logged.weight_used > 0 ? `@ ${logged.weight_used} kg` : ''} on today's session.`
                                  : 'Marked as skipped for today.'
                                }
                              </p>
                              <button
                                onClick={() => handleCardExpand(idx, exercise)}
                                className="mt-3 text-[10px] font-bold text-electric-cyan hover:underline uppercase tracking-wider"
                              >
                                Adjust configuration
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <h4 className="font-heading font-bold text-white text-xs uppercase tracking-widest text-gray-400 mb-2">
                              Ingestion Config
                            </h4>
                            <div className="grid grid-cols-3 gap-3">
                              {/* Sets input */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                  Sets
                                </label>
                                <input
                                  type="number"
                                  value={formSets}
                                  onChange={(e) => setFormSets(e.target.value)}
                                  className="w-full text-xs"
                                />
                              </div>

                              {/* Reps input */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                  Reps
                                </label>
                                <input
                                  type="number"
                                  value={formReps}
                                  onChange={(e) => setFormReps(e.target.value)}
                                  className="w-full text-xs"
                                />
                              </div>

                              {/* Weight Used input */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                                  Load (kg)
                                </label>
                                <input
                                  type="number"
                                  disabled={!exercise.isWeighted}
                                  value={formWeight}
                                  onChange={(e) => setFormWeight(e.target.value)}
                                  placeholder={exercise.isWeighted ? "e.g. 10" : "Bodyweight"}
                                  className={`w-full text-xs ${!exercise.isWeighted ? 'opacity-40 cursor-not-allowed bg-black/40' : ''}`}
                                />
                              </div>
                            </div>

                            <div className="flex space-x-3 pt-2">
                              <button
                                onClick={() => handleLogSubmit(exercise.name, 'skipped')}
                                className="flex-1 py-2.5 rounded-xl border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 hover:bg-red-500/5"
                              >
                                <X className="w-4 h-4" />
                                <span>Skip</span>
                              </button>
                              
                              <button
                                onClick={() => handleLogSubmit(exercise.name, 'completed')}
                                className="flex-1 py-2.5 rounded-xl bg-neon-mint text-obsidian text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_15px_rgba(0,245,160,0.3)] transition-all flex items-center justify-center space-x-1.5"
                              >
                                <Check className="w-4 h-4 text-obsidian" />
                                <span>Log Complete</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
