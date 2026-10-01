/**
 * Data-Quality Engine for TrustPark
 * Handles report age decay, conflict detection, user trust weighting, and confidence calibration.
 */

// Half-life in seconds for report freshness decay
const CURB_FRESHNESS_HALFLIFE_SEC = 300;  // 5 minutes
const GARAGE_FRESHNESS_HALFLIFE_SEC = 900; // 15 minutes

export function calculateReportFreshness(lastVerifiedSecondsAgo, isGarage = false) {
  const halfLife = isGarage ? GARAGE_FRESHNESS_HALFLIFE_SEC : CURB_FRESHNESS_HALFLIFE_SEC;
  // Exponential decay formula: F = e^(-lambda * t)
  const lambda = Math.LN2 / halfLife;
  const freshness = Math.exp(-lambda * lastVerifiedSecondsAgo);
  return Math.max(0.01, Math.min(1.0, freshness));
}

/**
 * Detects conflicts between recent user reports.
 * Returns { conflictScore, conflictStatus: "none"|"mild"|"severe", latestReport, contradictoryReport }
 */
export function analyzeZoneConflicts(reportsHistory, currentTimestamp = Date.now()) {
  if (!reportsHistory || reportsHistory.length < 2) {
    return { conflictScore: 0.0, conflictStatus: "none", message: "Consistent single report feed." };
  }

  // Filter reports within the last 15 minutes
  const recentReports = reportsHistory.filter(r => {
    const ageSec = (currentTimestamp - new Date(r.timestamp).getTime()) / 1000;
    return ageSec <= 900;
  });

  if (recentReports.length < 2) {
    return { conflictScore: 0.0, conflictStatus: "none", message: "Only 1 recent report available." };
  }

  const latest = recentReports[0]; // newest
  let conflictWeightSum = 0;
  let contradictCount = 0;
  let totalWeight = 0;

  for (let i = 1; i < recentReports.length; i++) {
    const rep = recentReports[i];
    const weight = rep.userTrust || 0.5;
    totalWeight += weight;

    // Check if event contradicts (e.g. free vs occupied / blocked)
    const isContradictory = 
      (latest.event === "free" && (rep.event === "occupied" || rep.event === "blocked")) ||
      ((latest.event === "occupied" || latest.event === "blocked") && rep.event === "free");

    if (isContradictory) {
      contradictCount++;
      conflictWeightSum += weight * (rep.userTrust || 0.5);
    }
  }

  const conflictScore = totalWeight > 0 ? Math.min(1.0, (conflictWeightSum / totalWeight) * 1.5) : 0;
  
  let conflictStatus = "none";
  let message = "Reports are aligned.";
  if (conflictScore > 0.5) {
    conflictStatus = "severe";
    message = `Severe conflict: ${latest.userName} reported '${latest.event}' but prior report indicated opposite status.`;
  } else if (conflictScore > 0.2) {
    conflictStatus = "mild";
    message = `Mild conflict: Divergent observations reported recently. Verification requested.`;
  }

  return {
    conflictScore,
    conflictStatus,
    message,
    contradictCount,
    latestReport: latest
  };
}

/**
 * Updates a user's trust score based on feedback verification.
 */
export function updateUserTrustScore(currentUserTrust, wasCorrect, locationAccuracyMeters = 10) {
  let delta = wasCorrect ? +0.03 : -0.08; // Penalize wrong reports more strongly than reward true reports
  // Proximity bonus: higher accuracy = slightly higher trust bump
  if (wasCorrect && locationAccuracyMeters <= 10) {
    delta += 0.01;
  }
  const updated = Math.max(0.05, Math.min(0.99, currentUserTrust + delta));
  return parseFloat(updated.toFixed(2));
}

/**
 * Evaluates the overall confidence classification of a parking zone.
 * Calibrates into: High (75-100%), Medium (45-74%), Low (<45%)
 */
export function classifyConfidence(confidenceScore) {
  if (confidenceScore >= 0.75) {
    return { level: "High", badgeClass: "badge-high", color: "#10b981", label: "High Confidence" };
  } else if (confidenceScore >= 0.45) {
    return { level: "Medium", badgeClass: "badge-medium", color: "#f59e0b", label: "Medium Confidence" };
  } else {
    return { level: "Low", badgeClass: "badge-low", color: "#ef4444", label: "Low Confidence" };
  }
}
