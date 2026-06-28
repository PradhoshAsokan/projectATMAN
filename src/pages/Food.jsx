import React, { useState } from 'react'
import { useStore } from '../store/useStore'
import WarnBanner from '../components/WarnBanner'
import { motion, AnimatePresence } from 'framer-motion'
import { Apple, Flame, ChevronDown, Check, Sparkles, Utensils, Scale, Loader2 } from 'lucide-react'

// Helper to get formatted dates
const getRollingDays = () => {
  const days = []
  const today = new Date()
  
  for (let i = 0; i < 3; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'long' })
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const dbDateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0]
    days.push({ label, dateStr, dbDateStr })
  }
  return days
}

// Static recipe database
const RECIPES_DB = {
  breakfast: {
    name: "Overnight Oats Core",
    baseCalories: 450,
    baseProtein: 28,
    baseCarbs: 52,
    baseFat: 12,
    days: [
      {
        variation: "Blueberry Almond",
        ingredients: [
          "50g Rolled Oats",
          "150ml Unsweetened Almond Milk",
          "30g Whey Protein Isolate (Vanilla)",
          "50g Fresh Blueberries",
          "10g Sliced Almonds",
          "1 tbsp Chia Seeds"
        ],
        steps: [
          "In a jar or airtight container, combine rolled oats, chia seeds, and protein powder.",
          "Pour in almond milk and stir until thoroughly mixed.",
          "Fold in blueberries and top with sliced almonds.",
          "Seal container and refrigerate overnight (minimum 6 hours) before serving."
        ]
      },
      {
        variation: "Double Chocolate Banana",
        ingredients: [
          "50g Rolled Oats",
          "150ml Unsweetened Coconut Milk",
          "30g Whey Protein Isolate (Chocolate)",
          "1/2 Medium Ripe Banana (sliced)",
          "1 tsp Unsweetened Cocoa Powder",
          "1 tbsp Chia Seeds"
        ],
        steps: [
          "Whisk chocolate protein powder and cocoa powder into the coconut milk.",
          "In your container, stir together oats, chia seeds, and the chocolate milk blend.",
          "Layer the sliced bananas on top.",
          "Cover and refrigerate overnight. Enjoy cold or warm slightly."
        ]
      },
      {
        variation: "Apple Cinnamon Walnut",
        ingredients: [
          "50g Rolled Oats",
          "150ml Unsweetened Almond Milk",
          "30g Whey Protein (Vanilla or Salted Caramel)",
          "1/2 Green Apple (diced)",
          "10g Crushed Walnuts",
          "1/2 tsp Ground Cinnamon",
          "1 tbsp Chia Seeds"
        ],
        steps: [
          "Mix oats, protein powder, chia seeds, and cinnamon together.",
          "Stir in the almond milk, then fold in the diced green apple.",
          "Top with walnuts for a healthy fat crunch.",
          "Seal and store in refrigerator overnight."
        ]
      }
    ]
  },
  lunch: {
    name: "Lean Muscle Fuel",
    baseCalories: 750,
    baseProtein: 62,
    baseCarbs: 65,
    baseFat: 18,
    days: [
      {
        variation: "Grilled Herb Chicken & Avocado Quinoa",
        ingredients: [
          "250g Chicken Breast (skinless)",
          "80g Quinoa (dry weight)",
          "1/2 Medium Avocado",
          "100g Steamed Broccoli Florets",
          "1 tbsp Olive Oil (for grill brush)",
          "Lemon juice, salt, pepper, garlic powder"
        ],
        steps: [
          "Marinate chicken breast with lemon juice, salt, pepper, and garlic powder.",
          "Rinse and boil quinoa in a pot (2:1 water ratio) for 15 minutes.",
          "Grill chicken on medium heat for 6-8 minutes per side until core reaches 75°C.",
          "Slice chicken and serve over quinoa, alongside broccoli and sliced fresh avocado."
        ]
      },
      {
        variation: "Sautéed Lemon Herb Paneer & Sweet Mash",
        ingredients: [
          "200g Low-fat Paneer (cubed)",
          "150g Sweet Potato (peeled & cubed)",
          "100g Asparagus or Green Beans",
          "1 tsp Grass-fed Butter",
          "1.5 tsp Olive oil",
          "Garlic salt, oregano, lemon juice"
        ],
        steps: [
          "Steam sweet potato cubes until soft, then mash with a pinch of salt and butter.",
          "Sauté paneer cubes in olive oil with garlic salt, oregano, and lemon juice until golden.",
          "Toss green beans/asparagus in the pan juices for 2 minutes.",
          "Plate the seared paneer alongside sweet potato mash and sautéed greens."
        ]
      },
      {
        variation: "Crispy Egg & Chicken Fried Rice Medley",
        ingredients: [
          "200g Chicken Breast (cubed)",
          "2 Large Eggs",
          "150g Cauliflower Rice mixed with 50g Brown Rice",
          "1/2 Red Bell Pepper (diced)",
          "50g Green Peas",
          "1.5 tsp Sesame Oil & garlic cloves minced",
          "Soy sauce, spring onions"
        ],
        steps: [
          "Heat sesame oil in a wok. Mince garlic and sauté chicken cubes until cooked (6 minutes).",
          "Push chicken to the side, crack in eggs and scramble until firm.",
          "Add diced bell peppers, peas, cauliflower rice, and brown rice.",
          "Stir fry everything on high heat for 4 minutes. Drizzle soy sauce and top with spring onions."
        ]
      }
    ]
  },
  dinner: {
    name: "Recovery Restoration",
    baseCalories: 800,
    baseProtein: 60,
    baseCarbs: 55,
    baseFat: 24,
    days: [
      {
        variation: "High-Protein Paneer Tikka Masala & Cauli-Rice",
        ingredients: [
          "200g Low-fat Paneer (cubed)",
          "100g Greek Yogurt (marinade base)",
          "250g Cauliflower Rice",
          "1/2 Green Bell Pepper (sliced)",
          "1 Medium Onion & Tomato (finely chopped)",
          "1.5 tsp Garam Masala & Tikka spices",
          "1 tsp Olive Oil"
        ],
        steps: [
          "Marinate paneer cubes and sliced bell peppers in Greek yogurt and spices for 20 minutes.",
          "Sear marinated paneer and peppers in a hot skillet with olive oil until slightly charred.",
          "Add finely chopped onions and tomatoes to the pan with tikka spices, and simmer for 5 minutes.",
          "Steam cauliflower rice and serve the paneer tikka masala hot over the top."
        ]
      },
      {
        variation: "Garlic Ginger Chicken & Sesame Bok Choy",
        ingredients: [
          "250g Chicken Breast (sliced)",
          "200g Bok Choy (halved)",
          "80g Jasmine Rice (dry weight)",
          "1 tbsp Sesame Oil",
          "Fresh ginger julienned, green onions, soy sauce, minced garlic"
        ],
        steps: [
          "Cook jasmine rice according to package directions.",
          "Sauté sliced chicken with sesame oil, fresh ginger, and minced garlic in a pan for 6-8 minutes until golden.",
          "Toss bok choy into the pan, drizzle with soy sauce, cover and steam for 3 minutes.",
          "Serve the ginger chicken and steamed bok choy hot over the jasmine rice."
        ]
      },
      {
        variation: "Spicy Egg & Paneer Scramble Wok",
        ingredients: [
          "3 Large Eggs (whole) + 3 Egg Whites",
          "100g Low-fat Paneer (crumbled)",
          "150g Stir-fry mixed vegetables (cabbage, carrots, mushrooms)",
          "1 tsp Chili oil",
          "Green onions, garlic powder, salt"
        ],
        steps: [
          "In a bowl, whisk eggs, egg whites, and crumbled paneer. Season with garlic powder and salt.",
          "Heat a non-stick wok with chili oil, scramble the egg-paneer mixture until cooked, and set aside.",
          "Toss mixed stir-fry vegetables and sliced green onions in the hot wok for 3 minutes.",
          "Fold the egg-paneer scramble back into the vegetables and serve hot."
        ]
      }
    ]
  }
}

export default function Food() {
  const userMetrics = useStore((state) => state.userMetrics)
  const dailyLogs = useStore((state) => state.dailyLogs)
  const logDailyMetric = useStore((state) => state.logDailyMetric)

  // Expanded meal tracking
  // Format: 'dayIndex-mealKey' (e.g. '0-breakfast')
  const [expandedId, setExpandedId] = useState(null)
  const [loggedMeals, setLoggedMeals] = useState({})

  if (!userMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian text-white relative">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-electric-cyan" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
            Syncing Diet Registry...
          </span>
        </div>
      </div>
    )
  }

  const rollingDays = getRollingDays()

  // Calculate day tenure & current calorie target
  const getCalorieTarget = () => {
    if (!userMetrics.start_date) return 2500
    const start = new Date(userMetrics.start_date)
    const today = new Date()
    const diffTime = Math.abs(today - start)
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return days <= 30 ? 2500 : 2100
  }

  const calorieTarget = getCalorieTarget()
  // Scale factor: if month 2+, target drops from 2500 to 2100 (a 0.84 multiplier on portions and calories)
  const portionScale = calorieTarget / 2500

  // Handle meal logging
  const handleLogMeal = (dbDateStr, mealKey, calories, id) => {
    const currentLog = dailyLogs.find((l) => l.date === dbDateStr)
    const consumed = currentLog ? currentLog.calories_consumed : 0
    
    // Add calories
    logDailyMetric(dbDateStr, { calories_consumed: consumed + calories })
    
    // Mark as logged locally
    setLoggedMeals({ ...loggedMeals, [id]: true })
    setTimeout(() => {
      setLoggedMeals({ ...loggedMeals, [id]: false })
    }, 4000)
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="min-h-screen pb-32 text-gray-300">
      <div className="max-w-3xl mx-auto px-4 pt-6 md:pt-10">
        <WarnBanner />

        {/* Header */}
        <div className="mb-8 text-left">
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-1 rounded-full bg-neon-mint/10 border border-neon-mint/20 text-xs font-semibold text-neon-mint uppercase tracking-wider flex items-center space-x-1 shadow-[0_0_10px_rgba(0,245,160,0.05)]">
              <Scale className="w-3.5 h-3.5" />
              <span>Target: {calorieTarget} kcal / Day</span>
            </span>
          </div>
          <h1 className="font-heading font-black text-3xl md:text-5xl text-white tracking-tight leading-none mb-3 uppercase">
            Nutrition <span className="text-neon-mint neon-text-mint">Registry</span>
          </h1>
          <p className="text-sm text-gray-400 font-light max-w-xl">
            Somatic nutrition planning. Portions and targets automatically adjust based on program tenure. Protein threshold is prioritized at {Math.round(150 * portionScale)}g+.
          </p>
        </div>

        {/* Rolling 3 Days Layout */}
        <div className="space-y-8">
          {rollingDays.map((day, dayIdx) => {
            return (
              <div key={day.dbDateStr} className="space-y-4">
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-2 text-left">
                  <h2 className="font-heading font-bold text-white text-lg flex items-center">
                    <span className="text-electric-cyan font-black mr-2">/</span>
                    {day.label}
                    <span className="text-xs font-normal text-gray-500 ml-3">{day.dateStr}</span>
                  </h2>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    Telemetry Node
                  </span>
                </div>

                {/* Meals under Day */}
                <div className="grid grid-cols-1 gap-3">
                  {['breakfast', 'lunch', 'dinner'].map((mealKey) => {
                    const id = `${dayIdx}-${mealKey}`
                    const isExpanded = expandedId === id
                    const mealType = RECIPES_DB[mealKey]
                    
                    // Retrieve recipe variation based on rolling day index
                    const recipe = mealType.days[dayIdx]
                    
                    // Adjust metrics based on dynamic scaling target (2500 -> 2100)
                    const calories = Math.round(mealType.baseCalories * portionScale)
                    const protein = Math.round(mealType.baseProtein * portionScale)
                    const carbs = Math.round(mealType.baseCarbs * portionScale)
                    const fat = Math.round(mealType.baseFat * portionScale)
                    
                    const isLogged = loggedMeals[id]

                    return (
                      <motion.div
                        key={mealKey}
                        layout="position"
                        className={`rounded-2xl transition-all duration-300 border ${
                          isExpanded
                            ? 'bg-[#12131C] border-neon-mint/30 shadow-[0_4px_20px_rgba(0,255,160,0.03)]'
                            : 'bg-[#12131C] border-white/5 hover:border-white/10'
                        }`}
                      >
                        {/* Summary Header */}
                        <div
                          onClick={() => toggleExpand(id)}
                          className="p-4 flex items-center justify-between cursor-pointer select-none"
                        >
                          <div className="flex items-center space-x-4 text-left">
                            <div className={`p-2.5 rounded-xl ${
                              mealKey === 'breakfast' 
                                ? 'bg-orange-500/10 text-orange-400' 
                                : mealKey === 'lunch'
                                ? 'bg-electric-cyan/10 text-electric-cyan'
                                : 'bg-neon-mint/10 text-neon-mint'
                            }`}>
                              <Utensils className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                                {mealKey}
                              </span>
                              <h4 className="font-heading font-bold text-white text-sm mt-0.5">
                                {recipe.variation} {mealKey === 'breakfast' ? 'Oats' : ''}
                              </h4>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Energy Value</span>
                              <span className="font-heading font-extrabold text-sm text-white">
                                {calories} <span className="text-xs text-gray-500 font-normal">kcal</span>
                              </span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-neon-mint' : ''}`} />
                          </div>
                        </div>

                        {/* Collapsible Recipe Panel */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: 'easeInOut' }}
                              className="overflow-hidden border-t border-white/5"
                            >
                              <div className="p-5 bg-black/10 text-left space-y-5">
                                
                                {/* Macros Row */}
                                <div className="grid grid-cols-4 gap-2">
                                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest block">Calories</span>
                                    <span className="font-heading font-extrabold text-white text-sm block mt-0.5">{calories}</span>
                                  </div>
                                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                                    <span className="text-[8px] font-bold text-neon-mint uppercase tracking-widest block">Protein</span>
                                    <span className="font-heading font-extrabold text-white text-sm block mt-0.5">{protein}g</span>
                                  </div>
                                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                                    <span className="text-[8px] font-bold text-orange-400 uppercase tracking-widest block">Carbs</span>
                                    <span className="font-heading font-extrabold text-white text-sm block mt-0.5">{carbs}g</span>
                                  </div>
                                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl text-center">
                                    <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest block">Fat</span>
                                    <span className="font-heading font-extrabold text-white text-sm block mt-0.5">{fat}g</span>
                                  </div>
                                </div>

                                {/* Ingredients Panel */}
                                <div className="space-y-2">
                                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l-2 border-neon-mint pl-2">
                                    Scaled Ingredients ({Math.round(portionScale * 100)}% portion)
                                  </h5>
                                  <ul className="text-xs text-gray-400 pl-4 list-disc space-y-1">
                                    {recipe.ingredients.map((ing, idx) => {
                                      // Dynamically format weights in ingredient list
                                      let displayIng = ing
                                      if (portionScale !== 1) {
                                        displayIng = ing.replace(/(\d+)(g|ml)/g, (match, val, unit) => {
                                          const scaled = Math.round(parseInt(val) * portionScale)
                                          return `${scaled}${unit}`
                                        })
                                      }
                                      return <li key={idx}>{displayIng}</li>
                                    })}
                                  </ul>
                                </div>

                                {/* Steps Panel */}
                                <div className="space-y-2">
                                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l-2 border-neon-mint pl-2">
                                    Preparation Matrix
                                  </h5>
                                  <ol className="text-xs text-gray-400 pl-4 list-decimal space-y-2">
                                    {recipe.steps.map((step, idx) => (
                                      <li key={idx} className="leading-relaxed">{step}</li>
                                    ))}
                                  </ol>
                                </div>

                                {/* Log Action Button */}
                                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                  <p className="text-[10px] text-gray-500">
                                    Log intake onto today's calorie registers.
                                  </p>
                                  <button
                                    onClick={() => handleLogMeal(day.dbDateStr, mealKey, calories, id)}
                                    disabled={isLogged}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center space-x-1.5 ${
                                      isLogged
                                        ? 'bg-neon-mint/20 text-neon-mint border border-neon-mint/30 shadow-[0_0_10px_rgba(0,255,160,0.15)]'
                                        : 'bg-neon-mint text-obsidian hover:shadow-[0_0_15px_rgba(0,255,160,0.3)]'
                                    }`}
                                  >
                                    {isLogged ? (
                                      <>
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Added to Log!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Flame className="w-3.5 h-3.5" />
                                        <span>Consume & Log ({calories} kcal)</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
