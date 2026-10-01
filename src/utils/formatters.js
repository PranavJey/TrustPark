/**
 * Formatter Utilities for TrustPark
 */

export function formatDistance(meters) {
  if (!meters && meters !== 0) return "100 m";
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatTimeAgo(secondsAgo) {
  if (secondsAgo < 15) return "Just now";
  if (secondsAgo < 60) return `${Math.round(secondsAgo)} sec ago`;
  const minutes = Math.floor(secondsAgo / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
}

export function formatCurrency(price) {
  if (!price || price === 0) return "Free";
  return `$${price.toFixed(2)}/hr`;
}

export function getProbabilityColor(probabilityPercent) {
  if (probabilityPercent >= 75) return { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", border: "#059669", textClass: "text-emerald-400" };
  if (probabilityPercent >= 45) return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", border: "#d97706", textClass: "text-amber-400" };
  return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", border: "#dc2626", textClass: "text-rose-400" };
}

export function getConfidenceBadgeProps(confidenceLevel) {
  switch (confidenceLevel?.toLowerCase()) {
    case 'high':
      return { label: 'High Confidence', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
    case 'medium':
      return { label: 'Medium Confidence', class: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    case 'low':
      return { label: 'Low Confidence', class: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
    default:
      return { label: 'Uncertain', class: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }
}
