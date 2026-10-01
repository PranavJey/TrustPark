import React from 'react';
import { 
  ShieldCheck, 
  Navigation, 
  Sliders, 
  Activity, 
  Layers, 
  Code, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  demandMultiplier, 
  setDemandMultiplier,
  activeConflictCount 
}) {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('driver')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  TrustPark
                </h1>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase tracking-wider">
                  Software-Only
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Uncertainty-Aware Parking Discovery & Prediction
              </p>
            </div>
          </div>

          {/* Conflict indicator alert pill on mobile */}
          {activeConflictCount > 0 && (
            <div className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{activeConflictCount} Conflict</span>
            </div>
          )}
        </div>

        {/* View Tabs */}
        <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveView('driver')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'driver'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Driver Search</span>
          </button>

          <button
            onClick={() => setActiveView('comparison')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'comparison'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="flex items-center gap-1">
              Side-by-Side <Sparkles className="w-3 h-3 text-amber-300" />
            </span>
          </button>

          <button
            onClick={() => setActiveView('simulator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'simulator'
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Live Simulator</span>
          </button>

          <button
            onClick={() => setActiveView('operator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'operator'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Operator Dashboard</span>
          </button>

          <button
            onClick={() => setActiveView('apiDocs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              activeView === 'apiDocs'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>API Docs</span>
          </button>
        </nav>

        {/* Global Controls & Status Pill */}
        <div className="hidden lg:flex items-center gap-3">
          {activeConflictCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{activeConflictCount} Active Conflict</span>
            </div>
          )}

          {/* Traffic / Event multiplier switcher */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Demand:</span>
            <select
              value={demandMultiplier}
              onChange={(e) => setDemandMultiplier(parseFloat(e.target.value))}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="1.0" className="bg-slate-900 text-slate-200">1.0x (Normal Demand)</option>
              <option value="1.3" className="bg-slate-900 text-amber-300">1.3x (Rush Hour)</option>
              <option value="1.6" className="bg-slate-900 text-rose-300">1.6x (Concert Event Spike)</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
}
