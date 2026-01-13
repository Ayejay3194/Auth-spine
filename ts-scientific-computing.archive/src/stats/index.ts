export namespace stats {
  export class norm {
    constructor(mu: number = 0, sigma: number = 1) {
      this.mu = mu;
      this.sigma = sigma;
    }

    private mu: number;
    private sigma: number;

    pdf(x: number): number {
      return norm.pdf(x, this.mu, this.sigma);
    }

    cdf(x: number): number {
      return norm.cdf(x, this.mu, this.sigma);
    }

    ppf(p: number): number {
      return norm.ppf(p, this.mu, this.sigma);
    }

    static pdf(x: number, mu: number = 0, sigma: number = 1): number {
      const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
      return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
    }

    static cdf(x: number, mu: number = 0, sigma: number = 1): number {
      const z = (x - mu) / sigma;
      return 0.5 * (1 + this.erf(z / Math.sqrt(2)));
    }

    static ppf(p: number, mu: number = 0, sigma: number = 1): number {
      const t = Math.sqrt(-2 * Math.log(1 - p));
      const c0 = 2.515517;
      const c1 = 0.802853;
      const c2 = 0.010328;
      const d1 = 1.432788;
      const d2 = 0.189269;
      const d3 = 0.001308;

      const numerator = c0 + c1 * t + c2 * t * t;
      const denominator = 1 + d1 * t + d2 * t * t + d3 * t * t * t;
      const z = t - numerator / denominator;

      return mu + sigma * z;
    }

    private static erf(x: number): number {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;

      const sign = x < 0 ? -1 : 1;
      x = Math.abs(x);

      const t = 1 / (1 + p * x);
      const y = 1 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);

      return sign * y;
    }
  }

  export class uniform {
    static pdf(x: number, a: number = 0, b: number = 1): number {
      if (x < a || x > b) return 0;
      return 1 / (b - a);
    }

    static cdf(x: number, a: number = 0, b: number = 1): number {
      if (x < a) return 0;
      if (x > b) return 1;
      return (x - a) / (b - a);
    }

    static ppf(p: number, a: number = 0, b: number = 1): number {
      return a + p * (b - a);
    }
  }

  export class exponential {
    static pdf(x: number, lambda: number = 1): number {
      if (x < 0) return 0;
      return lambda * Math.exp(-lambda * x);
    }

    static cdf(x: number, lambda: number = 1): number {
      if (x < 0) return 0;
      return 1 - Math.exp(-lambda * x);
    }

    static ppf(p: number, lambda: number = 1): number {
      return -Math.log(1 - p) / lambda;
    }
  }

  export function ttest_ind(a: number[], b: number[]): { statistic: number; pvalue: number } {
    const n1 = a.length;
    const n2 = b.length;

    const mean1 = a.reduce((s, x) => s + x, 0) / n1;
    const mean2 = b.reduce((s, x) => s + x, 0) / n2;

    const var1 = a.reduce((s, x) => s + Math.pow(x - mean1, 2), 0) / (n1 - 1);
    const var2 = b.reduce((s, x) => s + Math.pow(x - mean2, 2), 0) / (n2 - 1);

    const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2);
    const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

    const t = (mean1 - mean2) / se;
    const df = n1 + n2 - 2;

    const pvalue = 2 * (1 - tCDF(Math.abs(t), df));

    return { statistic: t, pvalue };
  }

  export function pearsonr(x: number[], y: number[]): { correlation: number; pvalue: number } {
    const n = x.length;
    const meanX = x.reduce((s, v) => s + v, 0) / n;
    const meanY = y.reduce((s, v) => s + v, 0) / n;

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

    const r = numerator / Math.sqrt(denomX * denomY);
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const pvalue = 2 * (1 - tCDF(Math.abs(t), n - 2));

    return { correlation: r, pvalue };
  }

  export function chi2_test(observed: number[], expected: number[]): { statistic: number; pvalue: number } {
    let chi2 = 0;
    for (let i = 0; i < observed.length; i++) {
      chi2 += Math.pow(observed[i] - expected[i], 2) / expected[i];
    }

    const df = observed.length - 1;
    const pvalue = 1 - chi2CDF(chi2, df);

    return { statistic: chi2, pvalue };
  }

}

function tCDF(t: number, df: number): number {
  const x = df / (df + t * t);
  return incompleteBeta(x, df / 2, 0.5);
}

function chi2CDF(x: number, k: number): number {
  return incompleteGamma(k / 2, x / 2);
}

function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const front = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - logBeta(a, b));
  return front / a;
}

function incompleteGamma(a: number, x: number): number {
  if (x < 0 || a <= 0) return 0;
  if (x === 0) return 0;

  let sum = 1 / a;
  let term = 1 / a;

  for (let i = 1; i < 100; i++) {
    term *= x / (a + i);
    sum += term;
    if (Math.abs(term) < 1e-10) break;
  }

  return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
}

function logBeta(a: number, b: number): number {
  return logGamma(a) + logGamma(b) - logGamma(a + b);
}

function logGamma(x: number): number {
  const g = 7;
  const coef = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  if (x < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - logGamma(1 - x);
  }

  x -= 1;
  let a = coef[0];
  for (let i = 1; i < coef.length; i++) {
    a += coef[i] / (x + i);
  }

  const t = x + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
