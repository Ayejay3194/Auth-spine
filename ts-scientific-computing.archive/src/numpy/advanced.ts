import { NDArray } from './core/ndarray';

export function clip(arr: NDArray, min: number, max: number): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.max(min, Math.min(max, data[i]));
  }
  return new NDArray(result, arr.getShape());
}

export function absolute(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.abs(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function sqrt(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.sqrt(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function power(arr: NDArray, exponent: number): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.pow(data[i], exponent);
  }
  return new NDArray(result, arr.getShape());
}

export function exp(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.exp(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function log(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.log(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function log10(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.log10(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function sin(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.sin(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function cos(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.cos(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function tan(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.tan(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function round(arr: NDArray, decimals: number = 0): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  const factor = Math.pow(10, decimals);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.round(data[i] * factor) / factor;
  }
  return new NDArray(result, arr.getShape());
}

export function floor(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.floor(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function ceil(arr: NDArray): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = Math.ceil(data[i]);
  }
  return new NDArray(result, arr.getShape());
}

export function unique(arr: NDArray): NDArray {
  const data = arr.getData();
  const uniqueSet = new Set(data);
  const result = new Float64Array(Array.from(uniqueSet).sort((a, b) => a - b));
  return new NDArray(result, [result.length]);
}

export function sort(arr: NDArray, axis?: number): NDArray {
  const data = new Float64Array(arr.getData());
  const shape = arr.getShape();

  if (axis === undefined || shape.length === 1) {
    data.sort((a, b) => a - b);
    return new NDArray(data, shape);
  }

  throw new Error('Axis-based sort not yet implemented');
}

export function argsort(arr: NDArray): NDArray {
  const data = arr.getData();
  const indices = Array.from({ length: data.length }, (_, i) => i);
  indices.sort((a, b) => data[a] - data[b]);
  return new NDArray(new Float64Array(indices), [indices.length]);
}

export function where(condition: boolean[], x: number[], y: number[]): NDArray {
  const result = new Float64Array(condition.length);
  for (let i = 0; i < condition.length; i++) {
    result[i] = condition[i] ? x[i] : y[i];
  }
  return new NDArray(result, [condition.length]);
}

export function percentile(arr: NDArray, q: number): number {
  const data = Array.from(arr.getData()).sort((a, b) => a - b);
  const index = (q / 100) * (data.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;

  if (lower === upper) {
    return data[lower];
  }
  return data[lower] * (1 - weight) + data[upper] * weight;
}

export function quantile(arr: NDArray, q: number): number {
  return percentile(arr, q * 100);
}

export function cov(X: NDArray): NDArray {
  const data = X.getData();
  const shape = X.getShape();
  const n = shape[0];
  const m = shape[1];

  const means = new Array(m);
  for (let j = 0; j < m; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += data[i * m + j];
    }
    means[j] = sum / n;
  }

  const cov_matrix = new Float64Array(m * m);
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < m; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += (data[k * m + i] - means[i]) * (data[k * m + j] - means[j]);
      }
      cov_matrix[i * m + j] = sum / (n - 1);
    }
  }

  return new NDArray(cov_matrix, [m, m]);
}

export function corrcoef(X: NDArray): NDArray {
  const cov_matrix = cov(X);
  const cov_data = cov_matrix.getData();
  const shape = cov_matrix.getShape();
  const n = shape[0];

  const corr = new Float64Array(n * n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const std_i = Math.sqrt(cov_data[i * n + i]);
      const std_j = Math.sqrt(cov_data[j * n + j]);
      corr[i * n + j] = cov_data[i * n + j] / (std_i * std_j);
    }
  }

  return new NDArray(corr, shape);
}

export function histogram(arr: NDArray, bins: number = 10): { counts: number[]; edges: number[] } {
  const data = arr.getData();
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / bins;

  const counts = new Array(bins).fill(0);
  const edges = Array.from({ length: bins + 1 }, (_, i) => min + i * binWidth);

  for (const value of data) {
    const binIndex = Math.floor((value - min) / binWidth);
    if (binIndex < bins) {
      counts[binIndex]++;
    }
  }

  return { counts, edges };
}

export function digitize(arr: NDArray, bins: number[]): NDArray {
  const data = arr.getData();
  const result = new Float64Array(data.length);

  for (let i = 0; i < data.length; i++) {
    let binIndex = 0;
    for (let j = 0; j < bins.length; j++) {
      if (data[i] >= bins[j]) {
        binIndex = j + 1;
      }
    }
    result[i] = binIndex;
  }

  return new NDArray(result, arr.getShape());
}
