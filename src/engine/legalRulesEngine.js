/**
 * Legal Rules Engine for TrustPark
 * Verifies curb regulations, time limits, permits, operating hours, and vehicle suitability.
 */

export function evaluateLegalSuitability(zone, userRequest = {}) {
  const {
    desiredDurationMinutes = 60,
    hasResidentPermit = false,
    needsAccessible = false,
    isEV = false,
    vehicleType = "sedan",
    arrivalTime = new Date()
  } = userRequest;

  const currentHour = arrivalTime.getHours();
  const currentDay = arrivalTime.getDay(); // 0 = Sun, 6 = Sat

  let isLegal = true;
  let statusLabel = "Fully Legal";
  let maxLegalMinutes = zone.maxDurationHours * 60;
  let warningMessage = null;
  const activeRuleDetails = [];

  // 1. Accessibility requirement check
  if (needsAccessible && zone.accessibleSpaces === 0 && zone.type === "curb_segment") {
    activeRuleDetails.push({
      rule: "No Dedicated Accessible Stall",
      status: "info",
      message: "Standard curb space without ramp/accessible mark."
    });
  }

  // 2. EV Charging check
  if (isEV && !zone.evCharging) {
    activeRuleDetails.push({
      rule: "No EV Charging",
      status: "info",
      message: "Standard parking spot; no level 2/3 EV charger."
    });
  }

  // 3. Evaluate zone restrictions
  for (const restriction of zone.restrictions || []) {
    if (restriction.type === "commercial_only" && restriction.active) {
      if (vehicleType !== "commercial_truck" && currentHour >= 7 && currentHour < 16) {
        isLegal = false;
        statusLabel = "Commercial Loading Only";
        warningMessage = "Restricted to commercial loading vehicles between 07:00 and 16:00.";
        maxLegalMinutes = 0;
        activeRuleDetails.push({
          rule: restriction.label,
          status: "violation",
          message: warningMessage
        });
      }
    }

    if (restriction.type === "permit_required" && restriction.active) {
      if (!hasResidentPermit && currentHour >= 18) {
        isLegal = false;
        statusLabel = "Resident Permit Required";
        warningMessage = "Residential Permit Area J required after 18:00.";
        maxLegalMinutes = 0;
        activeRuleDetails.push({
          rule: restriction.label,
          status: "violation",
          message: warningMessage
        });
      }
    }

    if (restriction.type === "street_sweep" && restriction.active) {
      // Check if Tuesday 2 AM - 5 AM
      if (currentDay === 2 && currentHour >= 2 && currentHour < 5) {
        isLegal = false;
        statusLabel = "Tow Away: Street Sweeping";
        warningMessage = "No parking during street sweeping hours (Tue 02:00-05:00).";
        maxLegalMinutes = 0;
        activeRuleDetails.push({
          rule: restriction.label,
          status: "violation",
          message: warningMessage
        });
      }
    }

    if (restriction.type === "time_limit" && restriction.active) {
      const maxAllowedMinutes = zone.maxDurationHours * 60;
      if (desiredDurationMinutes > maxAllowedMinutes) {
        statusLabel = `Max ${zone.maxDurationHours}h Limit`;
        warningMessage = `Your planned stay (${desiredDurationMinutes}m) exceeds the posted ${zone.maxDurationHours}-hour limit (${maxAllowedMinutes}m max).`;
        maxLegalMinutes = maxAllowedMinutes;
        activeRuleDetails.push({
          rule: restriction.label,
          status: "warning",
          message: warningMessage
        });
      }
    }
  }

  // Summary badge text
  if (isLegal && !warningMessage) {
    statusLabel = `Legal for ${zone.maxDurationHours >= 12 ? 'Unlimited' : zone.maxDurationHours + ' hrs'}`;
  }

  return {
    isLegal,
    statusLabel,
    maxLegalMinutes,
    warningMessage,
    rulesCount: (zone.restrictions || []).length,
    activeRuleDetails
  };
}
