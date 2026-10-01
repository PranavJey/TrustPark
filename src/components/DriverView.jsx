import React, { useState, useCallback } from 'react';
import {
  MapPin, Navigation2, Clock, Shield, AlertTriangle,
  ChevronRight, CheckCircle, XCircle, AlertCircle,
  ThumbsUp, ThumbsDown, Star, Zap, BarChart2,
  Car, Building2, ArrowRight, Info
} from 'lucide-react';
import { DESTINATIONS } from '../mockData/destinations.js';
import { formatDistance, formatTimeAgo, formatCurrency, getProbabilityColor, getConfidenceBadgeProps } from '../utils/formatters.js';
import { classifyConfidence } from '../engine/dataQualityEngine.js';

function ProbabilityRing({ percent }) {
  const color = getProbabilityColor(percent);
  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <circle
          cx="32" cy="32" r="28"
          fill="none"
          stroke={color.color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color.color}80)`, transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none" style={{ color: color.color }}>{percent}%</span>
        <span className="text-[9px] text-slate-400 font-medium">avail.</span>
      </div>
    </div>
  );
}

function ZoneCard({ zone, rank, onSelect, onReport, isSelected }) {
  const probColor = getProbabilityColor(zone.pred.probabilityPercent);
  const confBadge = getConfidenceBadgeProps(classifyConfidence(zone.pred.confidenceScore).level);
  const hasConflict = zone.pred.conflictAnalysis?.conflictStatus === 'severe';
  const isStale = zone.lastVerifiedSecondsAgo > 600;

  const tierColors = {
    'Best Option': 'from-emerald-500/10 to-transparent border-emerald-500/30',
    'Good Alternative': 'from-blue-500/10 to-transparent border-blue-500/25',
    'Low Confidence': 'from-amber-500/10 to-transparent border-amber-500/25',
    'High Failure Risk': 'from-rose-500/10 to-transparent border-rose-500/25',
    'Not Recommended': 'from-slate-500/10 to-transparent border-slate-600/30',
    'Standard': 'from-slate-800/40 to-transparent border-slate-700/30',
  };

  return (
    <div
      className={`glass-card relative cursor-pointer p-4 bg-gradient-to-r ${tierColors[zone.recommendationTier] || tierColors['Standard']} ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(zone)}
    >
      {/* Rank Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {rank === 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            ★ Best Pick
          </span>
        )}
        <span className="text-[10px] font-semibold text-slate-400">#{rank + 1}</span>
      </div>

      <div className="flex gap-3 items-start">
        {/* Probability Ring */}
        <ProbabilityRing percent={zone.pred.probabilityPercent} />

        {/* Zone Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1 pr-16">
            <div>
              <p className="text-sm font-semibold text-slate-100 leading-tight line-clamp-1">{zone.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{zone.address}</p>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {/* Freshness */}
            <div className={`flex items-center gap-1 text-[11px] ${isStale ? 'text-amber-400' : 'text-emerald-400'}`}>
              <Clock className="w-3 h-3" />
              <span>Verified {formatTimeAgo(zone.lastVerifiedSecondsAgo)}</span>
              {isStale && <AlertCircle className="w-3 h-3" />}
            </div>

            {/* Distance */}
            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <Navigation2 className="w-3 h-3" />
              <span>{formatDistance(zone.distanceMeters)} · {zone.walkTimeMinutes}min walk</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-1 text-[11px] text-slate-300">
              <span className="text-slate-500">$</span>
              <span>{formatCurrency(zone.pricePerHour)}</span>
            </div>

            {/* Max duration */}
            <div className="flex items-center gap-1 text-[11px] text-cyan-300">
              <Shield className="w-3 h-3" />
              <span>{zone.legal?.statusLabel}</span>
            </div>
          </div>

          {/* Conflict / Stale warnings */}
          {hasConflict && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              <span>Conflicting reports — system requesting verification</span>
            </div>
          )}

          {!zone.legal?.isLegal && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-md px-2 py-1">
              <XCircle className="w-3 h-3 flex-shrink-0" />
              <span>{zone.legal?.warningMessage}</span>
            </div>
          )}

          {/* Bottom Row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${confBadge.class}`}>
              {confBadge.label}
            </span>
            <div className="flex items-center gap-2">
              <button
                className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors flex items-center gap-1"
                onClick={(e) => { e.stopPropagation(); onReport(zone, 'free'); }}
              >
                <ThumbsUp className="w-3 h-3" /> Free
              </button>
              <button
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                onClick={(e) => { e.stopPropagation(); onReport(zone, 'occupied'); }}
              >
                <ThumbsDown className="w-3 h-3" /> Full
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoneDetailPanel({ zone, onClose, onFeedback, fallbacks }) {
  const [feedbackGiven, setFeedbackGiven] = useState(null);
  if (!zone) return null;

  const mb = zone.pred.mathBreakdown;
  const confColor = getProbabilityColor(zone.pred.probabilityPercent);

  const handleFeedback = (type) => {
    setFeedbackGiven(type);
    onFeedback(zone.id, type);
  };

  return (
    <div className="glass-panel p-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-white leading-tight">{zone.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{zone.address}</p>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors ml-2 flex-shrink-0">
          <XCircle className="w-5 h-5" />
        </button>
      </div>

      {/* Primary Probability Display */}
      <div className="rounded-xl p-4 mb-4" style={{ background: `${confColor.bg}`, border: `1px solid ${confColor.border}40` }}>
        <div className="flex items-center gap-4">
          <ProbabilityRing percent={zone.pred.probabilityPercent} />
          <div>
            <p className="text-2xl font-extrabold" style={{ color: confColor.color }}>
              {zone.pred.probabilityPercent}% likely available
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Verified {formatTimeAgo(zone.lastVerifiedSecondsAgo)} · {formatDistance(zone.distanceMeters)} walk
            </p>
            <p className="text-xs mt-1" style={{ color: confColor.color }}>
              {zone.legal?.statusLabel} · {formatCurrency(zone.pricePerHour)}
            </p>
          </div>
        </div>
      </div>

      {/* Time Window Predictions */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" /> Availability Forecast
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Now', val: zone.pred.timeWindows.now },
            { label: '+5 min', val: zone.pred.timeWindows.in5min },
            { label: '+10 min', val: zone.pred.timeWindows.in10min },
            { label: '+15 min', val: zone.pred.timeWindows.in15min },
          ].map(({ label, val }) => {
            const c = getProbabilityColor(val);
            return (
              <div key={label} className="flex flex-col items-center gap-1 bg-slate-950/50 rounded-lg py-2 px-1 border border-slate-800/80">
                <span className="text-[10px] text-slate-400">{label}</span>
                <span className="text-base font-bold" style={{ color: c.color }}>{val}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explainable AI Breakdown */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" /> How This Score Was Calculated
        </p>
        <div className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 space-y-2">
          <p className="text-[10px] font-mono text-indigo-300 break-all">{mb.formula}</p>
          <div className="space-y-1.5 mt-2">
            {[
              { label: 'Recent Report Signal', val: mb.components.recentSignalScore, positive: true },
              { label: 'Historical Pattern', val: mb.components.historicalPatternScore, positive: true },
              { label: 'Reporter Trust', val: mb.components.userTrustContribution, positive: true },
              { label: 'Report Age Penalty', val: mb.components.agePenalty, positive: false },
              { label: 'Conflict Penalty', val: mb.components.conflictPenalty, positive: false },
              { label: 'Demand Penalty', val: mb.components.demandPenalty, positive: false },
            ].map(({ label, val, positive }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{label}</span>
                <span className={`text-[11px] font-mono font-semibold ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {positive ? '+' : ''}{val}
                </span>
              </div>
            ))}
            <div className="border-t border-slate-700/50 pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-200 font-semibold">Final Score</span>
              <span className="text-[11px] font-mono font-bold" style={{ color: confColor.color }}>= {mb.rawProbability} → {mb.finalPercent}%</span>
            </div>
          </div>
          {mb.conflictStatus !== 'none' && (
            <div className="mt-2 text-[10px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1">
              ⚠ {mb.conflictMessage}
            </div>
          )}
        </div>
      </div>

      {/* Active Rules */}
      {zone.legal?.activeRuleDetails?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Active Rules & Restrictions
          </p>
          <div className="space-y-1.5">
            {zone.legal.activeRuleDetails.map((r, i) => (
              <div key={i} className={`flex items-start gap-2 text-[11px] rounded-md px-2.5 py-1.5 border ${
                r.status === 'violation' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                : r.status === 'warning' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                : 'bg-slate-800/50 text-slate-300 border-slate-700/30'
              }`}>
                {r.status === 'violation' ? <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                : r.status === 'warning' ? <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                : <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="font-semibold">{r.rule}</p>
                  <p className="opacity-80">{r.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Car className="w-3.5 h-3.5" /> Recent Reports
        </p>
        <div className="space-y-1.5">
          {zone.reportsHistory.map((r) => (
            <div key={r.id} className="flex items-start gap-2 text-[11px] bg-slate-950/40 rounded-md px-2.5 py-2 border border-slate-800/50">
              <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                r.event === 'free' ? 'bg-emerald-400' : r.event === 'occupied' ? 'bg-rose-400' : 'bg-amber-400'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200 truncate">{r.userName}</span>
                  <span className="text-slate-500 flex-shrink-0">{formatTimeAgo((Date.now() - new Date(r.timestamp).getTime()) / 1000)}</span>
                </div>
                <p className="text-slate-400">{r.note || r.event}</p>
                <p className="text-slate-500">Trust score: {Math.round(r.userTrust * 100)}% · GPS ±{r.locationAccuracyMeters}m</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fallback Recommendations */}
      {fallbacks?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-400" /> Auto Fallback Options
          </p>
          <div className="space-y-1.5">
            {fallbacks.map((f, i) => (
              <div key={f.zoneId} className="flex items-center gap-2 text-[11px] bg-indigo-500/5 border border-indigo-500/15 rounded-md px-2.5 py-1.5">
                <span className="font-bold text-indigo-300">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{f.name}</p>
                  <p className="text-slate-400">{f.probabilityPercent}% avail · {formatDistance(f.distanceMeters)} · verified {formatTimeAgo(f.lastVerifiedSecondsAgo)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* One-tap Feedback */}
      <div className="border-t border-slate-700/50 pt-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Did you find a legal space?</p>
        {feedbackGiven ? (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle className="w-4 h-4" />
            <span>Thanks! Your feedback improves predictions for everyone.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: '✓ Yes, found it!', type: 'found', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' },
              { label: '✗ Space was taken', type: 'not_found', color: 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20' },
              { label: '⚠ Restriction wrong', type: 'rule_wrong', color: 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' },
              { label: '⊘ Space blocked', type: 'blocked', color: 'bg-slate-700/50 border-slate-600/40 text-slate-300 hover:bg-slate-700/70' },
            ].map(({ label, type, color }) => (
              <button
                key={type}
                onClick={() => handleFeedback(type)}
                className={`${color} border rounded-lg py-2 px-3 text-[11px] font-semibold transition-all`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DriverView({ rankedZones, demandMultiplier, onReport, onFeedback }) {
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectZone = useCallback((zone) => {
    setSelectedZone(prev => prev?.id === zone.id ? null : zone);
  }, []);

  const filteredDestinations = DESTINATIONS.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fallbacks = selectedZone
    ? rankedZones.filter(z => z.id !== selectedZone.id && z.legal?.isLegal && z.pred.probabilityPercent >= 45).slice(0, 3).map(z => ({
        zoneId: z.id, name: z.name, address: z.address,
        probabilityPercent: z.pred.probabilityPercent,
        lastVerifiedSecondsAgo: z.lastVerifiedSecondsAgo,
        distanceMeters: z.distanceMeters,
        walkTimeMinutes: z.walkTimeMinutes,
      }))
    : [];

  return (
    <div className="h-full flex flex-col" style={{ maxHeight: 'calc(100vh - 64px)' }}>
      {/* Search Bar */}
      <div className="p-4 pb-2 bg-slate-950/40 border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Navigation2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            <input
              type="text"
              id="destination-search"
              placeholder="Search destination or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
            />
          </div>

          {/* Destination Chips */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {filteredDestinations.map(dest => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(prev => prev?.id === dest.id ? null : dest)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                  selectedDestination?.id === dest.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-800/50 text-slate-400 border-slate-700/40 hover:border-slate-600/60'
                }`}
              >
                <MapPin className="w-3 h-3" />
                {dest.name.split(' ').slice(0, 3).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-0">

          {/* Left: Zone List */}
          <div className={`${selectedZone ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[420px] xl:w-[480px] flex-shrink-0 border-r border-slate-800/50`}>
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {rankedZones.length} Parking Zones Nearby
                </h2>
                <p className="text-[11px] text-slate-400">
                  Sorted by Expected Parking Success · Demand {demandMultiplier}x
                </p>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse" />
                Live
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {rankedZones.map((zone, i) => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  rank={i}
                  onSelect={handleSelectZone}
                  onReport={onReport}
                  isSelected={selectedZone?.id === zone.id}
                />
              ))}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className={`${selectedZone ? 'flex' : 'hidden lg:flex'} flex-col flex-1 overflow-hidden`}>
            {selectedZone ? (
              <div className="h-full overflow-y-auto p-4">
                <ZoneDetailPanel
                  zone={selectedZone}
                  onClose={() => setSelectedZone(null)}
                  onFeedback={onFeedback}
                  fallbacks={fallbacks}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-50">
                <Building2 className="w-16 h-16 text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-500 mb-2">Select a Parking Zone</h3>
                <p className="text-sm text-slate-600 max-w-xs">
                  Click any zone from the list to see probability breakdown, active rules, report history, and fallback options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
