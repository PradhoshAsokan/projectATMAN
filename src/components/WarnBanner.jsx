import React, { useState } from 'react'
import { AlertCircle, HelpCircle, X, Terminal, CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function WarnBanner() {
  const isDemoMode = useStore((state) => state.isDemoMode)
  const [showDetails, setShowDetails] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (!isDemoMode || dismissed) return null

  return (
    <div className="w-full mb-6 relative">
      <div className="bg-yellow-500/10 border border-yellow-500/25 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading font-semibold text-yellow-400 text-sm">
              Demo Simulation Active
            </h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              No active Supabase keys detected in your environment. All features (login, logging progress, workouts, charts) are fully functional using a simulated local storage database.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-center">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-xs text-yellow-400 transition-colors font-medium border border-yellow-500/10"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>How to connect?</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 bg-[#12131C] border border-white/5 rounded-2xl p-5 shadow-2xl relative animate-in fade-in slide-in-from-top-2 duration-300">
          <h5 className="font-heading font-semibold text-white text-sm flex items-center mb-3">
            <Terminal className="w-4 h-4 text-electric-cyan mr-2" />
            Connecting your Supabase Database
          </h5>
          <ol className="text-xs text-gray-400 space-y-2.5 list-decimal pl-4">
            <li>
              Go to the <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-electric-cyan hover:underline">Supabase Dashboard</a> and create a new project.
            </li>
            <li>
              Execute the SQL DDL statements from the <span className="font-mono text-gray-300">DATABASE_SCHEMA.md</span> file inside your Supabase Project's SQL Editor.
            </li>
            <li>
              Create a local <span className="font-mono text-white bg-white/5 px-1 py-0.5 rounded">.env</span> file in this project root (copy from <span className="font-mono text-gray-300">.env.example</span>).
            </li>
            <li>
              Paste your Supabase Project's <span className="text-white font-medium">URL</span> and <span className="text-white font-medium">Anon Key</span> into the <span className="font-mono text-white bg-white/5 px-1 py-0.5 rounded">.env</span> file:
              <pre className="mt-2 p-2.5 bg-black/40 rounded-lg text-electric-cyan border border-white/5 overflow-x-auto text-[11px] font-mono">
VITE_SUPABASE_URL=https://your-project-id.supabase.co{"\n"}
VITE_SUPABASE_ANON_KEY=your-anon-api-key
              </pre>
            </li>
            <li>
              Restart the Vite development server. The banner will disappear, and the app will sync directly with Supabase!
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
