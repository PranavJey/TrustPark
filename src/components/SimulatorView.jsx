import React, { useState, useEffect, useRef } from 'react';
import {
  Sliders, Play, Pause, RotateCcw, Zap, AlertTriangle,
  TrendingDown, TrendingUp, Activity, Clock, Users, CheckCircle
} from 'lucide-react';
import { getProbabilityColor } from '../utils/formatters.js';

const SCENARIOS = [
  {
    id: 'event_spike',
    label: '🎭 Concert Event Spike',
    description: 'A major event starts nearby. Demand surges 1.6x. Stale reports degrade. One high-trust zone stays reliable.',
    demandMultiplier: 1.6,
    steps: [
      { t: 0, msg: 'Normal evening conditions. All zones reporting regularly.', zoneUpdates: {} },
      { t: 3, msg: 'Event announced nearby. Demand starts rising...', zoneUpdates: {} },
      { t: 6, msg: '⚡ Zone 102 (Polk St) suddenly goes OCCUPIED — confirmed by trusted reporter Elena.', zoneUpdates: { 'zone-102': { event: 'occupied', userTrust: 0.88 } } },
      { t: 9, msg: '⚠ Zone 104 (Larkin St) stale — last verified 18+ min ago. Confidence drops.', zoneUpdates: { 'zone-104': { staleness: true } } },
      { t: 12, msg: '🟢 Zone 105 (Commercial Lot) still 95% confirmed by trusted Alex — best backup.', zoneUpdates: {} },
      { t: 15, msg: 'System auto-promotes Zone 105 as top recommendation. Zone 102 falls to rank #5.', zoneUpdates: {} },
    ]
  },
  {
    id: 'spam_attack',
    label: '🤖 Spam Report Attack',
    description: 'Low-trust user submits false "free" reports on occupied zones. System detects conflicts and down-weights them.',
    demandMultiplier: 1.0,
    steps: [
      { t: 0, msg: 'Normal morning conditions. All zones at baseline.', zoneUpdates: {} },
      { t: 3, msg: '🤖 SpamBot_3000 submits "free" on Zone 102 (known occupied).', zoneUpdates: { 'zone-102': { spamReport: true } } },
      { t: 6, msg: '⚠ System detects conflict — SpamBot trust score is 0.22. Report weight reduced 78%.', zoneUpdates: {} },
      { t: 9, msg: '🔍 Zone 102 status changes to UNCERTAIN (not instantly to "free"). Third report awaited.', zoneUpdates: {} },
      { t: 12, msg: '✅ Elena confirms occupied. Conflict resolved. SpamBot trust drops further to 0.18.', zoneUpdates: {} },
      { t: 15, msg: 'System integrity maintained. No driver was misled by the false report.', zoneUpdates: {} },
    ]
  },
  {
    id: 'stale_data',
    label: '⏱ Report Age Decay',
    description: 'No new reports come in for 20 minutes. Watch how confidence decays in real-time and "available" becomes "uncertain".',
    demandMultiplier: 1.0,
    steps: [
      { t: 0, msg: 'All zones freshly reported. High confidence across the board.', zoneUpdates: {} },
      { t: 3, msg: '3 minutes pass — curb segments start losing freshness. Garage holds longer.', zoneUpdates: {} },
      { t: 6, msg: '7 minutes — Zone 104 (low-trust reporter) now classified as MEDIUM confidence.', zoneUpdates: {} },
      { t: 9, msg: '12 minutes — Zone 102 transitions to LOW confidence. Status shown as "Uncertain".', zoneUpdates: {} },
      { t: 12, msg: '18 minutes — System displays "Status unknown; last confirmed 18 min ago." NOT "Available."', zoneUpdates: {} },
      { t: 15, msg: '✅ Garage (zone-103) still MEDIUM — automated feed has 15min half-life vs 5min for curb.', zoneUpdates: {} },
    ]
  },
];

function SimLog({ logs }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-950/80 rounded-lg border border-slate-800/80 h-40 overflow-y-auto p-3 font-mono text-[11px]">
      {logs.length === 0 && (
        <p className="text-slate-600">Press ▶ Play to start scenario simulation...</p>
      )}
      {logs.map((log, i) => (
        <div key={i} className={`mb-1 flex items-start gap-2 ${i === logs.length - 1 ? 'text-cyan-300' : 'text-slate-400'}`}>
          <span className="text-slate-600 flex-shrink-0">[{log.time}s]</span>
          <span>{log.msg}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function ZoneSimBar({ zone, highlight }) {
  const probColor = getProbabilityColor(zone.pred.probabilityPercent);
  return (
    <div className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${highlight ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-900/50 border border-slate-800/50'}`}>
      <div className="w-28 truncate text-[11px] text-slate-300 flex-shrink-0">{zone.name.split(' ').slice(0, 3).join(' ')}</div>
      <div className="flex-1">
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full progress-bar-fill"
            style={{ width: `${zone.pred.probabilityPercent}%`, background: probColor.color, boxShadow: `0 0 8px ${probColor.color}60` }}
          />
        </div>
      </div>
      <span className="text-[12px] font-bold w-10 text-right flex-shrink-0" style={{ color: probColor.color }}>
        {zone.pred.probabilityPercent}%
      </span>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${zone.pred.conflictAnalysis?.conflictStatus !== 'none' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
    </div>
  );
}

export default function SimulatorView({ rankedZones, onDemandChange }) {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    avgProbability: 0, conflictCount: 0, staleCount: 0, successRate: 0
  });
  const intervalRef = useRef(null);

  const computeMetrics = (zones) => {
    const avg = Math.round(zones.reduce((s, z) => s + z.pred.probabilityPercent, 0) / zones.length);
    const conflicts = zones.filter(z => z.pred.conflictAnalysis?.conflictStatus !== 'none').length;
    const stale = zones.filter(z => z.lastVerifiedSecondsAgo > 600).length;
    setMetrics({ avgProbability: avg, conflictCount: conflicts, staleCount: stale, successRate: Math.round(avg * 0.95) });
  };

  useEffect(() => {
    computeMetrics(rankedZones);
  }, [rankedZones]);

  const handlePlay = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    setCurrentStep(0);
    setLogs([]);
    onDemandChange(activeScenario.demandMultiplier);

    let step = 0;
    const runStep = () => {
      if (step >= activeScenario.steps.length) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        return;
      }
      const s = activeScenario.steps[step];
      setLogs(prev => [...prev, { time: s.t, msg: s.msg }]);
      setCurrentStep(step);
      step++;
    };
    runStep();
    intervalRef.current = setInterval(runStep, 2500);
  };

  const handleReset = () => {
    clearInterval(intervalRef.current);
    setIsPlaying(false);
    setCurrentStep(0);
    setLogs([]);
    onDemandChange(1.0);
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-xs font-semibold mb-3">
            <Sliders className="w-3.5 h-3.5" />
            Simulated Data Feed
          </div>
          <h1 className="text-xl font-extrabold text-white mb-1">Live Prediction Simulator</h1>
          <p className="text-sm text-slate-400 max-w-lg">
            Run pre-built scenarios to see how TrustPark handles stale data, conflicting reports, and demand spikes — compared to a naive binary "Available/Occupied" system.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlay}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
            }`}
          >
            {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-slate-400 border border-slate-700/50 hover:text-white hover:border-slate-600 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="grid sm:grid-cols-3 gap-3">
        {SCENARIOS.map(sc => (
          <button
            key={sc.id}
            onClick={() => { handleReset(); setActiveScenario(sc); }}
            className={`text-left p-3 rounded-xl border transition-all ${
              activeScenario.id === sc.id
                ? 'bg-cyan-500/10 border-cyan-500/30 text-white'
                : 'bg-slate-900/50 border-slate-800/60 text-slate-400 hover:border-slate-700'
            }`}
          >
            <p className="text-sm font-semibold mb-1">{sc.label}</p>
            <p className="text-[11px] leading-relaxed">{sc.description}</p>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
          <span>Scenario progress</span>
          <span>Step {currentStep + 1} of {activeScenario.steps.length}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full progress-bar-fill"
            style={{ width: `${((currentStep) / (activeScenario.steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Simulation Log */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> Simulation Event Log
          </p>
          <SimLog logs={logs} />
        </div>

        {/* Live Metrics */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> System Metrics
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Avg Availability', value: `${metrics.avgProbability}%`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/5 border-emerald-500/15' },
              { label: 'Active Conflicts', value: metrics.conflictCount, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/5 border-amber-500/15' },
              { label: 'Stale Zones', value: metrics.staleCount, icon: Clock, color: 'text-rose-400', bg: 'bg-rose-500/5 border-rose-500/15' },
              { label: 'Predicted Success', value: `${metrics.successRate}%`, icon: CheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/5 border-cyan-500/15' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className={`${bg} border rounded-xl p-3 flex items-center gap-3`}>
                <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                <div>
                  <p className="text-[10px] text-slate-500">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Zone Probability Bars */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BarChart className="w-3.5 h-3.5 text-indigo-400" /> Real-Time Zone Availability
        </p>
        <div className="space-y-1.5">
          {rankedZones.map((z, i) => (
            <ZoneSimBar key={z.id} zone={z} highlight={i === 0} />
          ))}
        </div>
      </div>

      {/* vs Binary System Note */}
      <div className="glass-panel p-4 border border-indigo-500/20">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="text-[12px] text-slate-400">
            <span className="font-semibold text-slate-200">What a naive system would do:</span>
            {' '}Show "Available" for all zones with a ✅ green dot — even the stale, conflicted, or restricted ones. TrustPark shows
            {' '}<span className="text-cyan-300 font-semibold">exactly how confident it is</span> and degrades gracefully when data quality drops.
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import fix
function BarChart({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  );
}
