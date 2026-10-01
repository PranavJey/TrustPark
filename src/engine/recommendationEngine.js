/**
 * Recommendation Engine for TrustPark
 * Ranks choices by Expected Parking Success (Probability x Legal Validity x Distance Penalty).
 */

import { calculateAvailabilityProbability } from './predictionEngine.js';
import { evaluateLegalSuitability } from './legalRulesEngine.js';

export function rankParkingZones(zones, userRequest = {}, currentDemandMultiplier = 1.0) {
  const scoredZones = zones.map(zone => {
    const pred = calculateAvailabilityProbability(zone, currentDemandMultiplier);
    const legal = evaluateLegalSuitability(zone, userRequest);

    // Distance decay: 100m -> 1.0, 300m -> 0.7, 600m -> 0.4
    const distanceMeters = zone.distanceMeters || 150;
    const distanceScore = Math.max(0.1, 1.0 - (distanceMeters / 800));

    // Price penalty: higher price slightly lowers preference for budget travelers
    const pricePenalty = (zone.pricePerHour || 2.0) * 0.03;

    // Legal suitability multiplier (1.0 if legal, 0.05 if illegal violation)
    const legalMultiplier = legal.isLegal ? 1.0 : 0.05;

    // Expected Parking Success Index (0 to 100)
    const rawSuccessScore = (
      (pred.probabilityPercent * 0.55) +
      (distanceScore * 100 * 0.25) +
      (pred.confidenceScore * 100 * 0.20) -
      (pricePenalty * 10)
    ) * legalMultiplier;

    const successScore = Math.max(1, Math.min(99, Math.round(rawSuccessScore)));

    // Recommendation badge classification
    let recommendationTier = "Standard";
    let recommendationReason = "";

    if (!legal.isLegal) {
      recommendationTier = "Not Recommended";
      recommendationReason = legal.warningMessage || "Illegal parking restriction active.";
    } else if (successScore >= 80) {
      recommendationTier = "Best Option";
      recommendationReason = "High availability, verified recently, and close walk.";
    } else if (successScore >= 60) {
      recommendationTier = "Good Alternative";
      recommendationReason = "Reliable option with moderate walk or price balance.";
    } else if (successScore >= 40) {
      recommendationTier = "Low Confidence";
      recommendationReason = "Data is older or reports diverge; risk of occupancy.";
    } else {
      recommendationTier = "High Failure Risk";
      recommendationReason = "High probability of finding zero vacant stalls upon arrival.";
    }

    return {
      ...zone,
      pred,
      legal,
      successScore,
      recommendationTier,
      recommendationReason
    };
  });

  // Sort by expected success score descending
  scoredZones.sort((a, b) => b.successScore - a.successScore);

  return scoredZones;
}

/**
 * Gets dynamic fallback options if the selected primary zone fails or degrades.
 */
export function getFallbackRecommendations(primaryZoneId, rankedZones, maxFallbacks = 3) {
  const alternatives = rankedZones.filter(z => z.id !== primaryZoneId && z.legal.isLegal && z.pred.probabilityPercent >= 45);
  
  return alternatives.slice(0, maxFallbacks).map(alt => ({
    zoneId: alt.id,
    name: alt.name,
    address: alt.address,
    probabilityPercent: alt.pred.probabilityPercent,
    lastVerifiedSecondsAgo: alt.lastVerifiedSecondsAgo,
    distanceMeters: alt.distanceMeters,
    walkTimeMinutes: alt.walkTimeMinutes,
    predictedVacanciesIn10Min: alt.predictedVacanciesIn10Min,
    reason: `Backup choice: ${alt.pred.probabilityPercent}% available, verified ${alt.lastVerifiedSecondsAgo}s ago, ${alt.distanceMeters}m walk.`
  }));
}
