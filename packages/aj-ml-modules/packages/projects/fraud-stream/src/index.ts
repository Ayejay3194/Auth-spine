/**
 * Real-time Fraud Detection System (Advanced)
 * Streaming anomaly detector (z-score with EWMA mean/var).
 * Plug into payments, login events, booking abuse, etc.
 */
export class EWMADetector {
  private mu = 0;
  private var = 1;
  constructor(private alpha=0.05, private zThresh=4.0) {}

  update(x: number) {
    const d = x - this.mu;
    this.mu = this.mu + this.alpha * d;
    this.var = (1-this.alpha) * (this.var + this.alpha * d*d);
    const z = (x - this.mu) / (Math.sqrt(this.var) || 1);
    return { z, isAnomaly: Math.abs(z) >= this.zThresh };
  }
}
