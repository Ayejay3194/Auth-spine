import { NDArray } from './core/ndarray';

export function zeros(shape: number[]): NDArray {
  const size = shape.reduce((a, b) => a * b, 1);
  return new NDArray(new Float64Array(size), shape);
}

export function ones(shape: number[]): NDArray {
  const size = shape.reduce((a, b) => a * b, 1);
  const data = new Float64Array(size);
  data.fill(1);
  return new NDArray(data, shape);
}

export function full(shape: number[], fillValue: number): NDArray {
  const size = shape.reduce((a, b) => a * b, 1);
  const data = new Float64Array(size);
  data.fill(fillValue);
  return new NDArray(data, shape);
}

export function arange(start: number, stop?: number, step: number = 1): NDArray {
  if (stop === undefined) {
    stop = start;
    start = 0;
  }

  const size = Math.ceil((stop - start) / step);
  const data = new Float64Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = start + i * step;
  }
  return new NDArray(data, [size]);
}

export function linspace(start: number, stop: number, num: number = 50): NDArray {
  const data = new Float64Array(num);
  if (num === 1) {
    data[0] = stop;
  } else {
    const step = (stop - start) / (num - 1);
    for (let i = 0; i < num; i++) {
      data[i] = start + i * step;
    }
  }
  return new NDArray(data, [num]);
}

export function eye(n: number, m?: number, k: number = 0): NDArray {
  const cols = m || n;
  const size = n * cols;
  const data = new Float64Array(size);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < cols; j++) {
      if (i - j === k) {
        data[i * cols + j] = 1;
      }
    }
  }
  return new NDArray(data, [n, cols]);
}
