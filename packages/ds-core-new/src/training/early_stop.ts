export interface EarlyStopOptions {
  patience: number;   // epochs without improvement
  minDelta?: number;  // minimal change to qualify as improvement
}

export class EarlyStopper {
  private best = Infinity;
  private badCount = 0;

  constructor(private opts: EarlyStopOptions) {}

  update(current: number): { stop: boolean; improved: boolean } {
    const minDelta = this.opts.minDelta ?? 0;
    const improved = current < this.best - minDelta;

    if (improved) {
      this.best = current;
      this.badCount = 0;
      return { stop: false, improved: true };
    }

    this.badCount++;
    if (this.badCount >= this.opts.patience) return { stop: true, improved: false };
    return { stop: false, improved: false };
  }

  bestValue(): number {
    return this.best;
  }
}
