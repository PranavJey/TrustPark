import React from 'react';
import {
  Layers, CheckCircle, XCircle, AlertCircle, Clock, Navigation2,
  Shield, Zap, ArrowRight, Star
} from 'lucide-react';
import { formatDistance, formatTimeAgo, getProbabilityColor } from '../utils/formatters.js';

const conventionalData = [
  { label: 'Status', conventional: '🟢 Available', trustpark: null },
  { label: 'Timestamp', conventional: 'No timestamp', trustpark: null },
  { label: 'Explanation', conventional: 'No rule explanation', trustpark: null },
  { label: 'Sort Order', conventional: 'Nearest result first', trustpark: null },
  { label: 'Fallback', conventional: 'No fallback option', trustpark: null },
  { label: 'Conflict Handling', conventional: 'Shows latest report only', trustpark: null },
];

function ComparisonRow({ zone, isFirst }) {
  const probColor = getProbabilityColor(zone.pred.probabilityPercent);

  return (
    <div className={`grid grid-cols-2 gap-0 border border-slate-800/60 rounded-xl overflow-hidden ${isFirst ? 'ring-2 ring-cyan-500/30' : ''}`}>
      {/* Conventional App Side */}
      <div className="bg-slate-900/80 p-4 border-r border-slate-700/40">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conventional App</span>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-white">Available</span>
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-rose-500" />
            No timestamp shown
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-rose-500" />
            No restriction info
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-rose-500" />
            Sorted by distance only
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-rose-500" />
            No fallback if space taken
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <XCircle className="w-3 h-3 text-rose-500" />
            Trusts most recent report
          </div>
        </div>
        <div className="mt-3 text-[10px] text-slate-600 italic border-t border-slate-800 pt-2">
          Nearest: {formatDistance(zone.distanceMeters - 30)} away
        </div>
      </div>

      {/* TrustPark Side */}
      <div className="p-4" style={{ background: `${probColor.bg}` }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">TrustPark</span>
          {isFirst && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold" style={{ color: probColor.color }}>
              {zone.pred.probabilityPercent}%
            </span>
            <span className="text-sm font-semibold text-white">likely available</span>
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            Verified {formatTimeAgo(zone.lastVerifiedSecondsAgo)}
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-cyan-400" />
            {zone.legal?.statusLabel}
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-400" />
            Ranked by parking success (not distance)
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3 text-indigo-400" />
            Auto-fallback if space disappears
          </div>
          <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
            {zone.pred.conflictAnalysis?.conflictStatus !== 'none'
              ? <><AlertCircle className="w-3 h-3 text-amber-400" /> Conflict detected — weighted resolution</>
              : <><CheckCircle className="w-3 h-3 text-emerald-400" /> Reports consistent</>
            }
          </div>
        </div>
        <div className="mt-3 text-[10px] border-t pt-2" style={{ color: `${probColor.color}99`, borderColor: `${probColor.border}30` }}>
          Walk: {zone.walkTimeMinutes} min · Confidence: {zone.pred.mathBreakdown.confidenceScore}
        </div>
      </div>
    </div>
  );
}

export default function ComparisonView({ rankedZones }) {
  const top4 = rankedZones.slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-4">
          <Layers className="w-3.5 h-3.5" />
          Side-by-Side Demo: Conventional vs TrustPark
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">
          The Same Information, Honestly Presented
        </h1>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          A conventional app shows "Available." TrustPark shows <em>what that actually means</em> — with probability, freshness, legal status, and a fallback plan.
        </p>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 gap-0 px-0.5">
        <div className="text-center py-2 rounded-l-lg bg-slate-800/40 border border-r-0 border-slate-700/40">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conventional Parking App</p>
          <p className="text-[10px] text-slate-600 mt-0.5">Binary state · No freshness · Distance-sorted</p>
        </div>
        <div className="text-center py-2 rounded-r-lg bg-cyan-500/5 border border-l-0 border-cyan-500/25">
          <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">TrustPark</p>
          <p className="text-[10px] text-cyan-500/60 mt-0.5">Probability · Verified · Rules-aware · Fallback</p>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-4">
        {top4.map((zone, i) => (
          <ComparisonRow key={zone.id} zone={zone} isFirst={i === 0} />
        ))}
      </div>

      {/* Why This Matters box */}
      <div className="glass-panel p-5 mt-6 border border-indigo-500/20">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Why This Matters: The Core Problem With Binary "Available"
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-[11px] text-slate-400">
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">Stale Reports</p>
            <p>An "Available" status from 8 minutes ago may no longer reflect reality. TrustPark decays confidence exponentially as reports age.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">Malicious / Wrong Reports</p>
            <p>A low-trust user or bot can flip status instantly. TrustPark weights reporters by historical accuracy and flags contradictions.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-200">Legal Surprises</p>
            <p>A space may appear empty but have active loading restrictions, permit requirements, or a sweeping schedule. TrustPark checks all rules before recommending.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
