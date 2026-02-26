/**
 * Forecasting interface for:
 * - demand (bookings)
 * - churn risk
 * - return visits / rebooking
 * - inventory / staffing needs
 *
 * You can start with simple baselines (EWMA) and later swap to exported models.
 */

export interface SeriesPoint {
  t: number;   // unix seconds
  y: number;
}

export interface EwmaConfig {
  alpha: number; // 0..1
}

export function ewma(points: SeriesPoint[], cfg: EwmaConfig): number {
  let s = 0;
  let init = false;
  for (const p of points) {
    if (!init) { s = p.y; init = true; }
    else s = cfg.alpha * p.y + (1 - cfg.alpha) * s;
  }
  return s;
}
