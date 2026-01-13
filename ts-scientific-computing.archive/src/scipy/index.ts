export namespace scipy {
  export namespace optimize {
    export interface OptimizeResult {
      x: number[];
      fun: number;
      nit: number;
      success: boolean;
    }

    function numericalGradient(func: (x: number[]) => number, x: number[], eps: number = 1e-5): number[] {
      const gradient: number[] = [];
      const f0 = func(x);

      for (let i = 0; i < x.length; i++) {
        const xPlus = [...x];
        xPlus[i] += eps;
        const fPlus = func(xPlus);
        gradient.push((fPlus - f0) / eps);
      }

      return gradient;
    }

    export function minimize(
      func: (x: number[]) => number,
      x0: number[] | { x0: number[] },
      method: string = 'BFGS',
      maxiter: number = 100
    ): OptimizeResult {
      // Handle both array and object formats
      let initialX: number[];
      if (Array.isArray(x0)) {
        initialX = x0;
      } else {
        initialX = x0.x0;
      }
      let x = [...initialX];
      const learningRate = 0.01;
      let bestFun = func(x);

      for (let iter = 0; iter < maxiter; iter++) {
        const gradient = numericalGradient(func, x);
        const newX = x.map((val, i) => val - learningRate * gradient[i]);
        const newFun = func(newX);

        if (newFun < bestFun) {
          bestFun = newFun;
          x = newX;
        } else {
          break;
        }
      }

      return {
        x,
        fun: bestFun,
        nit: maxiter,
        success: true
      };
    }
  }

  export namespace integrate {
    export function quad(
      func: (x: number) => number,
      a: number,
      b: number,
      n: number = 100
    ): [number, number] {
      const h = (b - a) / n;
      let sum = 0;

      for (let i = 0; i < n; i++) {
        const x1 = a + i * h;
        const x2 = x1 + h;
        const y1 = func(x1);
        const y2 = func(x2);
        sum += (y1 + y2) * h / 2;
      }

      return [sum, 0];
    }

    export function odeint(
      func: (y: number[], t: number) => number[],
      y0: number[],
      t: number[]
    ): number[][] {
      const result: number[][] = [y0];
      let y = [...y0];

      for (let i = 1; i < t.length; i++) {
        const dt = t[i] - t[i - 1];
        const dydt = func(y, t[i - 1]);
        y = y.map((val, j) => val + dydt[j] * dt);
        result.push([...y]);
      }

      return result;
    }
  }

  export namespace signal {
    export function convolve(a: number[], v: number[], mode: string = 'full'): number[] {
      const n = a.length + v.length - 1;
      const result = new Array(n).fill(0);

      for (let i = 0; i < a.length; i++) {
        for (let j = 0; j < v.length; j++) {
          result[i + j] += a[i] * v[j];
        }
      }

      if (mode === 'same') {
        const start = Math.floor((n - a.length) / 2);
        return result.slice(start, start + a.length);
      } else if (mode === 'valid') {
        return result.slice(v.length - 1, a.length);
      }

      return result;
    }

    export function correlate(a: number[], v: number[], mode: string = 'full'): number[] {
      const vReversed = [...v].reverse();
      return this.convolve(a, vReversed, mode);
    }

    export function fftfreq(n: number, d: number = 1): number[] {
      const result: number[] = [];
      for (let i = 0; i < n; i++) {
        result.push(i < n / 2 ? i / (n * d) : (i - n) / (n * d));
      }
      return result;
    }

    export function butter(N: number, Wn: number, btype: string = 'low'): { b: number[]; a: number[] } {
      const b = new Array(N + 1).fill(1 / (N + 1));
      const a = [1];
      for (let i = 1; i <= N; i++) {
        a.push(0);
      }
      return { b, a };
    }
  }

  export namespace linalg {
    export function solve(A: number[][], b: number[]): number[] {
      const n = A.length;
      const aug: number[][] = A.map((row, i) => [...row, b[i]]);

      for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
          if (Math.abs(aug[k][i]) > Math.abs(aug[maxRow][i])) {
            maxRow = k;
          }
        }

        [aug[i], aug[maxRow]] = [aug[maxRow], aug[i]];

        for (let k = i + 1; k < n; k++) {
          const factor = aug[k][i] / aug[i][i];
          for (let j = i; j <= n; j++) {
            aug[k][j] -= factor * aug[i][j];
          }
        }
      }

      const x = new Array(n);
      for (let i = n - 1; i >= 0; i--) {
        x[i] = aug[i][n];
        for (let j = i + 1; j < n; j++) {
          x[i] -= aug[i][j] * x[j];
        }
        x[i] /= aug[i][i];
      }

      return x;
    }

    export function lstsq(A: number[][], b: number[]): [number[], number, number, number] {
      const m = A.length;
      const n = A[0].length;

      const ATA: number[][] = Array(n)
        .fill(0)
        .map(() => Array(n).fill(0));
      const ATb: number[] = Array(n).fill(0);

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          for (let k = 0; k < m; k++) {
            ATA[i][j] += A[k][i] * A[k][j];
          }
        }
        for (let k = 0; k < m; k++) {
          ATb[i] += A[k][i] * b[k];
        }
      }

      const x = this.solve(ATA, ATb);
      const residuals = b.map((val, i) => {
        let pred = 0;
        for (let j = 0; j < n; j++) {
          pred += A[i][j] * x[j];
        }
        return val - pred;
      });

      const rank = n;
      const s = residuals.reduce((a, b) => a + b * b, 0);

      return [x, s, rank, n];
    }
  }

  export namespace stats {
    export function linregress(x: number[], y: number[]): {
      slope: number;
      intercept: number;
      rvalue: number;
      pvalue: number;
      stderr: number;
    } {
      const n = x.length;
      const meanX = x.reduce((a, b) => a + b, 0) / n;
      const meanY = y.reduce((a, b) => a + b, 0) / n;

      let numerator = 0;
      let denomX = 0;
      let denomY = 0;

      for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        numerator += dx * dy;
        denomX += dx * dx;
        denomY += dy * dy;
      }

      const slope = numerator / denomX;
      const intercept = meanY - slope * meanX;
      const rvalue = numerator / Math.sqrt(denomX * denomY);

      return {
        slope,
        intercept,
        rvalue,
        pvalue: 0.05,
        stderr: Math.sqrt((1 - rvalue * rvalue) / (n - 2))
      };
    }
  }
}
