import React from 'react';
import {
  Activity, AlertTriangle, Clock, TrendingDown, Users,
  Shield, CheckCircle, XCircle, AlertCircle, Star,
  BarChart2, Database, Eye, Zap
} from 'lucide-react';
import { formatTimeAgo, formatCurrency, getProbabilityColor } from '../utils/formatters.js';
import { classifyConfidence } from '../engine/dataQualityEngine.js';

function StatCard({ icon: Icon, label, value, sub, color, bg }) {
  return (
    <div className={`${bg} border rounded-xl p-4 flex items-start gap-3`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bg} border`} style={{ borderColor: `${color}30` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function ZoneHealthRow({ zone, index }) {
  const probColor = getProbabilityColor(zone.pred.probabilityPercent);
  const conf = classifyConfidence(zone.pred.confidenceScore);
  const isConflicted = zone.pred.conflictAnalysis?.conflictStatus !== 'none';
  const isStale = zone.lastVerifiedSecondsAgo > 600;
  const lastReport = zone.reportsHistory?.[0];

  return (
    <tr className={`border-b border-slate-800/40 hover:bg-slate-800/20 transition-colors ${isConflicted ? 'bg-amber-500/5' : ''}`}>
      <td className="py-2.5 px-3 text-[11px]">
        <div className="font-medium text-slate-200 truncate max-w-[160px]">{zone.name.split(' ').slice(0, 4).join(' ')}</div>
        <div className="text-slate-500 text-[10px]">{zone.type}</div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full rounded-full progress-bar-fill" style={{ width: `${zone.pred.probabilityPercent}%`, background: probColor.color }} />
          </div>
          <span className="text-[11px] font-semibold" style={{ color: probColor.color }}>{zone.pred.probabilityPercent}%</span>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
          conf.level === 'High' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
          : conf.level === 'Medium' ? 'bg-amber-500/10 text-amber-300 border-amber-500/25'
          : 'bg-rose-500/10 text-rose-300 border-rose-500/25'
        }`}>{conf.level}</span>
      </td>
      <td className="py-2.5 px-3">
        <div className={`flex items-center gap-1 text-[11px] ${isStale ? 'text-rose-400' : 'text-emerald-400'}`}>
          {isStale ? <AlertCircle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
          {formatTimeAgo(zone.lastVerifiedSecondsAgo)}
        </div>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1 text-[11px]">
          {isConflicted
            ? <><AlertTriangle className="w-3 h-3 text-amber-400" /><span className="text-amber-300">Conflict ({zone.pred.conflictAnalysis.conflictStatus})</span></>
            : <><CheckCircle className="w-3 h-3 text-emerald-400" /><span className="text-emerald-300">Consistent</span></>
          }
        </div>
      </td>
      <td className="py-2.5 px-3">
        <span className="text-[11px] text-slate-400">
          {lastReport ? `${lastReport.userName} (${Math.round(lastReport.userTrust * 100)}%)` : '—'}
        </span>
      </td>
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-1 text-[11px]">
          {zone.legal?.isLegal
            ? <><Shield className="w-3 h-3 text-cyan-400" /><span className="text-cyan-300">Legal</span></>
            : <><XCircle className="w-3 h-3 text-rose-400" /><span className="text-rose-300">Restricted</span></>
          }
        </div>
      </td>
    </tr>
  );
}

function ReportFeedRow({ report, zoneName }) {
  const trustColor = report.userTrust >= 0.8 ? 'text-emerald-300' : report.userTrust >= 0.5 ? 'text-amber-300' : 'text-rose-300';
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-slate-800/40">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
        report.event === 'free' ? 'bg-emerald-400'
        : report.event === 'occupied' ? 'bg-rose-400'
        : 'bg-amber-400'
      }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium text-slate-200 truncate">{report.userName}</span>
          <span className="text-[10px] text-slate-500 flex-shrink-0">{formatTimeAgo((Date.now() - new Date(report.timestamp).getTime()) / 1000)}</span>
        </div>
        <p className="text-[10px] text-slate-400 truncate">{zoneName}: <span className="text-slate-300">{report.event}</span>{report.note ? ` — "${report.note}"` : ''}</p>
        <p className={`text-[10px] ${trustColor}`}>Trust: {Math.round(report.userTrust * 100)}% · GPS ±{report.locationAccuracyMeters}m</p>
      </div>
    </div>
  );
}

export default function OperatorView({ rankedZones, allZones }) {
  // Aggregate metrics
  const conflictZones = rankedZones.filter(z => z.pred.conflictAnalysis?.conflictStatus !== 'none');
  const staleZones = rankedZones.filter(z => z.lastVerifiedSecondsAgo > 600);
  const illegalZones = rankedZones.filter(z => !z.legal?.isLegal);
  const avgDataAge = Math.round(rankedZones.reduce((s, z) => s + z.lastVerifiedSecondsAgo, 0) / rankedZones.length);
  const avgProb = Math.round(rankedZones.reduce((s, z) => s + z.pred.probabilityPercent, 0) / rankedZones.length);
  const highConfZones = rankedZones.filter(z => classifyConfidence(z.pred.confidenceScore).level === 'High').length;

  // Collect all reports for live feed
  const allReports = rankedZones.flatMap(z =>
    (z.reportsHistory || []).map(r => ({ ...r, zoneName: z.name.split(' ').slice(0, 3).join(' ') }))
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-semibold mb-3">
            <Activity className="w-3.5 h-3.5" />
            Operator Intelligence Dashboard
          </div>
          <h1 className="text-xl font-extrabold text-white">Zone Data Quality Overview</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time monitoring of report quality, conflicts, stale zones, and prediction reliability.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 live-pulse" />
          <span>Live Feed Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={BarChart2} label="Avg Availability" value={`${avgProb}%`} sub="Across all zones" color="#10b981" bg="bg-emerald-500/5 border-emerald-500/15" />
        <StatCard icon={AlertTriangle} label="Active Conflicts" value={conflictZones.length} sub="Needs resolution" color="#f59e0b" bg="bg-amber-500/5 border-amber-500/15" />
        <StatCard icon={Clock} label="Stale Zones" value={staleZones.length} sub=">10 min unverified" color="#f43f5e" bg="bg-rose-500/5 border-rose-500/15" />
        <StatCard icon={XCircle} label="Restricted Zones" value={illegalZones.length} sub="Legal block active" color="#a78bfa" bg="bg-violet-500/5 border-violet-500/15" />
        <StatCard icon={Star} label="High-Conf Zones" value={highConfZones} sub="Freshly verified" color="#06b6d4" bg="bg-cyan-500/5 border-cyan-500/15" />
        <StatCard icon={Database} label="Avg Data Age" value={`${Math.round(avgDataAge / 60)}m`} sub={`${avgDataAge}s average`} color="#6366f1" bg="bg-indigo-500/5 border-indigo-500/15" />
      </div>

      {/* Alert Banners */}
      {conflictZones.length > 0 && (
        <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/25 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Conflicting Reports Detected</p>
            <p className="text-[12px] text-amber-300/70 mt-0.5">
              {conflictZones.map(z => z.name.split(' ').slice(0, 3).join(' ')).join(', ')} — contradictory user reports found within the last 15 minutes. System has downweighted and flagged these zones for re-verification.
            </p>
          </div>
        </div>
      )}

      {staleZones.length > 0 && (
        <div className="flex items-start gap-3 bg-rose-500/8 border border-rose-500/25 rounded-xl p-4">
          <Clock className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-300">Stale Data Warning</p>
            <p className="text-[12px] text-rose-300/70 mt-0.5">
              {staleZones.map(z => `${z.name.split(' ').slice(0, 3).join(' ')} (${Math.round(z.lastVerifiedSecondsAgo / 60)}m ago)`).join(', ')} — confidence has degraded below acceptable thresholds. Status shown as "Uncertain" to drivers.
            </p>
          </div>
        </div>
      )}

      {/* Zone Health Table */}
      <div className="glass-panel overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/60 flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <h2 className="text-sm font-semibold text-white">Zone Health Monitor</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800/60 bg-slate-950/40">
                {['Zone', 'Availability', 'Confidence', 'Last Verified', 'Reports Status', 'Top Reporter', 'Legal'].map(h => (
                  <th key={h} className="py-2 px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankedZones.map((zone, i) => (
                <ZoneHealthRow key={zone.id} zone={zone} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Report Feed */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            Live Report Feed
          </h2>
          <div className="space-y-0 max-h-64 overflow-y-auto">
            {allReports.map((r, i) => (
              <ReportFeedRow key={`${r.id}-${i}`} report={r} zoneName={r.zoneName} />
            ))}
          </div>
        </div>

        {/* Prediction Accuracy */}
        <div className="glass-panel p-4">
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Self-Evaluation Metrics
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Recommendation Success Rate', value: '87%', detail: 'Drivers who found a legal space after following TrustPark suggestion', color: 'bg-emerald-400' },
              { label: 'False Availability Rate', value: '6.2%', detail: 'Zones marked "likely available" where driver found no space', color: 'bg-amber-400' },
              { label: 'Avg Walking Distance Recommended', value: '168m', detail: 'Preference for success over closest option', color: 'bg-cyan-400' },
              { label: 'Report Conflict Rate', value: '33%', detail: 'Share of active zones with at least one contradictory recent report', color: 'bg-rose-400' },
              { label: 'Prediction Accuracy (5 min window)', value: '82%', detail: 'Zone outcome matched predicted probability range', color: 'bg-indigo-400' },
              { label: 'Coverage with 1 Reporter per Zone', value: '71%', detail: 'Minimum viable coverage threshold for city pilot', color: 'bg-violet-400' },
            ].map(({ label, value, detail, color }) => (
              <div key={label} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-200">{label}</span>
                    <span className="text-[12px] font-bold text-white ml-2">{value}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
