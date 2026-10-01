import React, { useState } from 'react';
import { Code, Copy, CheckCircle, ChevronDown, ChevronRight, Zap, Shield, Activity } from 'lucide-react';

const endpoints = [
  {
    method: 'GET',
    path: '/parking/nearby',
    desc: 'Returns ranked parking zones near a given coordinate, with probability scores, freshness, legal status, and recommendation tier.',
    params: '?lat=37.7749&lng=-122.4194&radius=400&vehicleType=sedan&desiredDuration=60',
    responseExample: `{
  "zones": [
    {
      "id": "zone-101",
      "name": "McAllister St Curb - North Segment 101",
      "type": "curb_segment",
      "center": [37.7758, -122.4188],
      "availabilityProbability": 82,
      "confidenceScore": 0.87,
      "confidenceLevel": "High",
      "lastVerifiedSecondsAgo": 45,
      "legal": { "isLegal": true, "statusLabel": "Legal for 2 hrs", "maxLegalMinutes": 120 },
      "pricePerHour": 2.75,
      "distanceMeters": 110,
      "walkTimeMinutes": 1.5,
      "recommendationTier": "Best Option",
      "timeWindows": { "now": 82, "in5min": 84, "in10min": 87, "in15min": 90 },
      "conflictStatus": "none"
    }
  ],
  "generatedAt": "2026-10-01T12:15:00+05:30",
  "demandMultiplier": 1.0
}`,
  },
  {
    method: 'GET',
    path: '/parking/{id}',
    desc: 'Full detail for a single parking zone, including all recent reports, confidence breakdown, active restrictions, and fallback candidates.',
    params: '/parking/zone-101',
    responseExample: `{
  "id": "zone-101",
  "name": "McAllister St Curb - North Segment 101",
  "availabilityProbability": 82,
  "mathBreakdown": {
    "formula": "P(available) = w1*S_recent + w2*S_hist + w3*U_trust - w4*T_age - w5*C_conflict",
    "recentSignal": 0.427,
    "historicalPattern": 0.255,
    "trustContribution": 0.235,
    "agePenalty": -0.063,
    "conflictPenalty": -0.012
  },
  "reportsHistory": [
    {
      "event": "free", "userName": "Alex Rivera", "userTrust": 0.94,
      "timestamp": "2026-10-01T12:15:00+05:30", "locationAccuracyMeters": 8,
      "note": "2 parallel spots open near corner"
    }
  ],
  "legalRules": [
    { "type": "metered", "label": "Pay at station or app", "active": true },
    { "type": "time_limit", "label": "2 Hour Limit 8am-6pm", "active": true }
  ],
  "fallbackOptions": ["zone-105", "zone-103"]
}`,
  },
  {
    method: 'POST',
    path: '/parking/{id}/report',
    desc: 'Submit a user-generated availability report. The system applies trust weighting, conflict detection, and confidence recalculation automatically.',
    params: null,
    requestBody: `{
  "parking_zone_id": "zone-102",
  "event": "occupied",
  "timestamp": "2026-10-01T12:15:00+05:30",
  "device_session_id": "anonymous-session-abc",
  "location_accuracy_m": 18,
  "note": "Delivery truck double parked"
}`,
    responseExample: `{
  "status": "accepted",
  "zoneId": "zone-102",
  "conflictDetected": true,
  "conflictStatus": "severe",
  "conflictMessage": "Contradicts a recent report. Status set to UNCERTAIN. Requesting verification.",
  "newProbability": 35,
  "confidenceScore": 0.42,
  "userTrustScore": 0.88
}`,
  },
  {
    method: 'GET',
    path: '/parking/{id}/prediction',
    desc: 'Returns multi-window availability forecast (+5m, +10m, +15m) with full explainability breakdown.',
    params: '/parking/zone-101/prediction',
    responseExample: `{
  "zoneId": "zone-101",
  "timeWindows": {
    "now": 82,
    "in5min": 84,
    "in10min": 87,
    "in15min": 90
  },
  "predictedVacanciesIn10Min": 3,
  "model": "weighted_scoring_formula",
  "inputs": {
    "recentReportSignal": 0.95,
    "historicalBaseProbability": 0.85,
    "reporterTrust": 0.94,
    "freshnessScore": 0.98,
    "conflictScore": 0.05,
    "demandMultiplier": 1.0
  }
}`,
  },
  {
    method: 'GET',
    path: '/parking/{id}/rules',
    desc: 'Returns all active and inactive parking rules for a zone, evaluated at the current timestamp with legal suitability for the requesting user.',
    params: '/parking/zone-104/rules?desiredDuration=90&hasPermit=false',
    responseExample: `{
  "zoneId": "zone-104",
  "evaluatedAt": "2026-10-01T12:15:00+05:30",
  "isLegal": false,
  "statusLabel": "Resident Permit Required",
  "maxLegalMinutes": 0,
  "warningMessage": "Permit Area J required after 18:00",
  "rules": [
    { "type": "permit_required", "label": "Permit Area J Required after 18:00", "active": true, "status": "violation" },
    { "type": "time_limit", "label": "2h limit for non-permit holders", "active": true, "status": "warning" }
  ]
}`,
  },
  {
    method: 'POST',
    path: '/parking/{id}/feedback',
    desc: 'Submit one-tap driver feedback after parking attempt. Updates user trust score, zone confidence, and model training data.',
    params: null,
    requestBody: `{
  "zoneId": "zone-101",
  "feedbackType": "found",
  "sessionId": "anonymous-session-abc",
  "timestamp": "2026-10-01T12:22:00+05:30"
}`,
    responseExample: `{
  "status": "accepted",
  "message": "Feedback recorded. User trust increased to 0.95. Zone confidence updated.",
  "userTrustDelta": +0.03,
  "zoneConfidenceDelta": +0.02
}`,
  },
  {
    method: 'GET',
    path: '/admin/data-quality',
    desc: 'Operator-only: Returns full data quality diagnostics — stale zones, conflict summaries, user reliability scores, and prediction accuracy metrics.',
    params: '?includeUserScores=true&staleness_threshold_s=600',
    responseExample: `{
  "summary": {
    "totalZones": 6,
    "conflictZones": 2,
    "staleZones": 1,
    "highConfidenceZones": 3,
    "avgDataAgeSeconds": 420,
    "avgAvailabilityPercent": 68
  },
  "conflictDetails": [
    { "zoneId": "zone-102", "conflictStatus": "severe", "reportersInvolved": 2 },
    { "zoneId": "zone-106", "conflictStatus": "severe", "note": "Restriction mismatch" }
  ],
  "staleDetails": [
    { "zoneId": "zone-104", "lastVerifiedSecondsAgo": 1400, "lastReporter": "user-gamma-12" }
  ],
  "selfEvaluationMetrics": {
    "recommendationSuccessRate": 0.87,
    "falseAvailabilityRate": 0.062,
    "avgRecommendedWalkDistance": 168
  }
}`,
  },
];

const methodColors = {
  GET: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  POST: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  PUT: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  DELETE: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function EndpointCard({ ep }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass-card overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${methodColors[ep.method]}`}>{ep.method}</span>
        <code className="text-sm font-mono text-cyan-300 flex-1">{ep.path}</code>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>

      {expanded && (
        <div className="border-t border-slate-800/60 px-4 py-3 space-y-3">
          <p className="text-[12px] text-slate-300 leading-relaxed">{ep.desc}</p>

          {ep.params && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Example Request</p>
              <div className="bg-slate-950/70 rounded-lg px-3 py-2 font-mono text-[11px] text-indigo-300 border border-slate-800/50">
                <span className="text-slate-500">{ep.method} </span>{ep.params}
              </div>
            </div>
          )}

          {ep.requestBody && (
            <div>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Request Body</p>
              <pre className="bg-slate-950/70 rounded-lg px-3 py-2.5 font-mono text-[11px] text-amber-300 border border-slate-800/50 overflow-x-auto whitespace-pre-wrap">{ep.requestBody}</pre>
            </div>
          )}

          {ep.responseExample && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Example Response</p>
                <button
                  onClick={() => handleCopy(ep.responseExample)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {copied ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-950/70 rounded-lg px-3 py-2.5 font-mono text-[11px] text-emerald-300 border border-slate-800/50 overflow-x-auto whitespace-pre-wrap">{ep.responseExample}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApiDocsView() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-300 text-xs font-semibold mb-4">
          <Code className="w-3.5 h-3.5" />
          REST API Reference · v1.0
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-2">TrustPark API</h1>
        <p className="text-sm text-slate-400 max-w-xl">
          A confidence-aware parking API. Every response includes probability scores, data freshness, legal status, and explainability breakdown — not just binary availability.
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="glass-panel p-4 border border-indigo-500/20">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          System Architecture
        </h2>
        <pre className="text-[11px] font-mono text-slate-300 leading-relaxed">{`Web/Mobile Client
       ↓
   API Gateway (Rate Limiting · JWT Auth)
       ↓
 Parking Service ─────── Rules Service
       ↓                      ↓
Data-Quality Engine ─ Prediction Engine
       ↓
 PostgreSQL + PostGIS (Zones, Reports, Rules)
       ↓
Analytics + Operator Dashboard`}</pre>
      </div>

      {/* Trust Model Principles */}
      <div className="glass-panel p-4 border border-cyan-500/15">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Data Trust Principles
        </h2>
        <div className="grid sm:grid-cols-3 gap-3 text-[11px] text-slate-400">
          {[
            { title: 'Freshness Decay', body: 'Curb reports half-life: 5min. Garage/API feeds: 15min. Exponential decay, not binary expiry.' },
            { title: 'Conflict Resolution', body: 'Contradictory reports trigger "Uncertain" state. Weight by reporter trust, not recency alone.' },
            { title: 'Reporter Trust Scores', body: 'Scores range 0.05–0.99, updated per feedback. Low-trust reports weighted down; never silenced.' },
          ].map(({ title, body }) => (
            <div key={title} className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/50">
              <p className="font-semibold text-slate-200 mb-1">{title}</p>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Formula */}
      <div className="glass-panel p-4 border border-amber-500/15">
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Scoring Formula (Interpretable Model)
        </h2>
        <div className="bg-slate-950/60 rounded-lg p-3 font-mono text-[12px] text-indigo-300 border border-slate-800/50 mb-3">
          P(available) = w₁·S_recent + w₂·S_hist + w₃·U_trust − w₄·T_age − w₅·C_conflict − w₆·D_demand
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          {[
            { sym: 'w₁ = 0.45', label: 'Recent report weight' },
            { sym: 'w₂ = 0.30', label: 'Historical pattern weight' },
            { sym: 'w₃ = 0.25', label: 'Reporter trust weight' },
            { sym: 'w₄ = 0.35', label: 'Age penalty weight' },
            { sym: 'w₅ = 0.40', label: 'Conflict penalty weight' },
            { sym: 'w₆ = 0.20', label: 'Demand event penalty' },
          ].map(({ sym, label }) => (
            <div key={sym} className="bg-slate-900/50 rounded px-2.5 py-1.5 border border-slate-800/50">
              <span className="text-amber-300 font-mono">{sym}</span>
              <span className="text-slate-500 ml-2">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-2">Calibrated into: High (75–100%) · Medium (45–74%) · Low (&lt;45%)</p>
      </div>

      {/* Endpoints */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Code className="w-4 h-4 text-slate-400" />
          API Endpoints
        </h2>
        <div className="space-y-2">
          {endpoints.map(ep => <EndpointCard key={ep.path} ep={ep} />)}
        </div>
      </div>

      {/* Report Event Types */}
      <div className="glass-panel p-4">
        <h2 className="text-sm font-semibold text-white mb-3">Report Event Types</h2>
        <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
          {[
            { event: '"free"', desc: 'Space observed empty and legally available' },
            { event: '"occupied"', desc: 'Space has a vehicle in it' },
            { event: '"blocked"', desc: 'Space physically obstructed (truck, barrier)' },
            { event: '"left"', desc: 'Vehicle just departed — space opening up' },
            { event: '"rule_changed"', desc: 'Observed restriction differs from database' },
            { event: '"unknown"', desc: "Couldn't determine status (use sparingly)" },
          ].map(({ event, desc }) => (
            <div key={event} className="flex items-start gap-2 bg-slate-900/40 rounded px-2.5 py-2 border border-slate-800/40">
              <code className="text-amber-300 font-mono flex-shrink-0">{event}</code>
              <span className="text-slate-400">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
