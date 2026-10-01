/**
 * Prediction Engine for TrustPark
 * Transparent, interpretable uncertainty modeling for parking availability.
 */

import { calculateReportFreshness, analyzeZoneConflicts } from './dataQualityEngine.js';

export function calculateAvailabilityProbability(zone, currentDemandMultiplier = 1.0, currentTimestamp = Date.now()) {
  const isGarage = zone.type === "garage";
  const freshness = calculateReportFreshness(zone.lastVerifiedSecondsAgo, isGarage);
  const conflictAnalysis = analyzeZoneConflicts(zone.reportsHistory, currentTimestamp);

  // Latest report value (1.0 for free, 0.0 for occupied/blocked)
  const latestReport = zone.reportsHistory && zone.reportsHistory.length > 0 ? zone.reportsHistory[0] : null;
  let recentReportSignal = zone.baseHistoricalProbability; // Default fallback to historical
  let reporterTrust = 0.5;

  if (latestReport) {
    if (latestReport.event === "free") {
      recentReportSignal = 0.95;
    } else if (latestReport.event === "occupied" || latestReport.event === "blocked") {
      recentReportSignal = 0.05;
    }
    reporterTrust = latestReport.userTrust || 0.7;
  }

  // Model weights (Sum of positive components ~ 1.0, adjusted by age & conflict penalties)
  const w_recent = 0.45;    // Weight of recent user report
  const w_hist = 0.30;      // Weight of historical base occupancy pattern
  const w_trust = 0.25;     // Weight of user reliability factor

  const agePenaltyWeight = 0.35;
  const conflictPenaltyWeight = 0.40;
  const eventDemandPenaltyWeight = 0.20;

  // Base raw score prior to penalties
  const baseSignal = (w_recent * recentReportSignal) + (w_hist * zone.baseHistoricalProbability) + (w_trust * reporterTrust);

  // Penalties
  const agePenalty = (1.0 - freshness) * agePenaltyWeight;
  const conflictPenalty = conflictAnalysis.conflictScore * conflictPenaltyWeight;
  const demandPenalty = (currentDemandMultiplier - 1.0) * eventDemandPenaltyWeight;

  // Raw probability calculation
  let rawProbability = baseSignal - agePenalty - conflictPenalty - demandPenalty;
  
  // Ensure bounds [0.05, 0.98]
  rawProbability = Math.max(0.05, Math.min(0.98, rawProbability));
  const probabilityPercent = Math.round(rawProbability * 100);

  // Overall confidence score calculation
  let confidenceScore = (freshness * 0.4) + (reporterTrust * 0.4) - (conflictAnalysis.conflictScore * 0.3);
  confidenceScore = Math.max(0.1, Math.min(0.99, confidenceScore));

  // Time window predictions (+5m, +10m, +15m) based on turn-over rate & vacancy trend
  const turnoverFactor = zone.type === "garage" ? 0.02 : 0.05; // Street parking turns over faster
  const prob5m = Math.min(95, Math.max(5, Math.round(probabilityPercent + (zone.predictedVacanciesIn10Min * turnoverFactor * 100 * 0.5))));
  const prob10m = Math.min(95, Math.max(5, Math.round(probabilityPercent + (zone.predictedVacanciesIn10Min * turnoverFactor * 100))));
  const prob15m = Math.min(95, Math.max(5, Math.round(probabilityPercent + (zone.predictedVacanciesIn10Min * turnoverFactor * 100 * 1.4))));

  // Detailed transparent math breakdown for hackathon demo & explainability
  const mathBreakdown = {
    formula: "P(available) = w1*S_recent + w2*S_hist + w3*U_trust - w4*T_age - w5*C_conflict - w6*D_demand",
    components: {
      recentSignalScore: (recentReportSignal * w_recent).toFixed(3),
      historicalPatternScore: (zone.baseHistoricalProbability * w_hist).toFixed(3),
      userTrustContribution: (reporterTrust * w_trust).toFixed(3),
      agePenalty: (-agePenalty).toFixed(3),
      conflictPenalty: (-conflictPenalty).toFixed(3),
      demandPenalty: (-demandPenalty).toFixed(3),
    },
    rawProbability: rawProbability.toFixed(3),
    finalPercent: probabilityPercent,
    freshnessScore: freshness.toFixed(2),
    confidenceScore: confidenceScore.toFixed(2),
    conflictStatus: conflictAnalysis.conflictStatus,
    conflictMessage: conflictAnalysis.message
  };

  return {
    probabilityPercent,
    confidenceScore,
    freshness,
    conflictAnalysis,
    timeWindows: {
      now: probabilityPercent,
      in5min: prob5m,
      in10min: prob10m,
      in15min: prob15m
    },
    mathBreakdown
  };
}
