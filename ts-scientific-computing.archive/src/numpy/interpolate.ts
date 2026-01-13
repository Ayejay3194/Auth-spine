export namespace interpolate {
  export class interp1d {
    private x: number[];
    private y: number[];
    private kind: string;

    constructor(x: number[], y: number[], kind: string = 'linear') {
      this.x = x;
      this.y = y;
      this.kind = kind;
    }

    evaluate(x_new: number[]): number[] {
      if (this.kind === 'linear') {
        return this.linearInterpolate(x_new);
      } else if (this.kind === 'nearest') {
        return this.nearestInterpolate(x_new);
      }
      return this.linearInterpolate(x_new);
    }

    private linearInterpolate(x_new: number[]): number[] {
      const result: number[] = [];

      for (const x_val of x_new) {
        if (x_val <= this.x[0]) {
          result.push(this.y[0]);
          continue;
        }
        if (x_val >= this.x[this.x.length - 1]) {
          result.push(this.y[this.y.length - 1]);
          continue;
        }

        let i = 0;
        while (i < this.x.length - 1 && this.x[i + 1] < x_val) {
          i++;
        }

        const x0 = this.x[i];
        const x1 = this.x[i + 1];
        const y0 = this.y[i];
        const y1 = this.y[i + 1];

        const t = (x_val - x0) / (x1 - x0);
        result.push(y0 + t * (y1 - y0));
      }

      return result;
    }

    private nearestInterpolate(x_new: number[]): number[] {
      const result: number[] = [];

      for (const x_val of x_new) {
        let nearestIdx = 0;
        let minDist = Math.abs(this.x[0] - x_val);

        for (let i = 1; i < this.x.length; i++) {
          const dist = Math.abs(this.x[i] - x_val);
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = i;
          }
        }

        result.push(this.y[nearestIdx]);
      }

      return result;
    }
  }

  export function interp(x: number[], xp: number[], fp: number[]): number[] {
    const f = new interp1d(xp, fp, 'linear');
    return f.evaluate(x);
  }
}
