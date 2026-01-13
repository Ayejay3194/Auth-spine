import { NDArray } from './core/ndarray';

export function add(a: NDArray, b: NDArray): NDArray {
  const aData = a.getData();
  const bData = b.getData();
  const result = new Float64Array(aData.length);

  for (let i = 0; i < aData.length; i++) {
    result[i] = aData[i] + bData[i];
  }

  return new NDArray(result, a.getShape());
}

export function subtract(a: NDArray, b: NDArray): NDArray {
  const aData = a.getData();
  const bData = b.getData();
  const result = new Float64Array(aData.length);

  for (let i = 0; i < aData.length; i++) {
    result[i] = aData[i] - bData[i];
  }

  return new NDArray(result, a.getShape());
}

export function multiply(a: NDArray, b: NDArray): NDArray {
  const aData = a.getData();
  const bData = b.getData();
  const result = new Float64Array(aData.length);

  for (let i = 0; i < aData.length; i++) {
    result[i] = aData[i] * bData[i];
  }

  return new NDArray(result, a.getShape());
}

export function divide(a: NDArray, b: NDArray): NDArray {
  const aData = a.getData();
  const bData = b.getData();
  const result = new Float64Array(aData.length);

  for (let i = 0; i < aData.length; i++) {
    result[i] = aData[i] / bData[i];
  }

  return new NDArray(result, a.getShape());
}

export function dot(a: NDArray, b: NDArray): NDArray {
  const aShape = a.getShape();
  const bShape = b.getShape();

  if (aShape.length !== 2 || bShape.length !== 2) {
    throw new Error('dot product requires 2D arrays');
  }

  if (aShape[1] !== bShape[0]) {
    throw new Error('incompatible dimensions for dot product');
  }

  const m = aShape[0];
  const n = aShape[1];
  const p = bShape[1];
  const result = new Float64Array(m * p);

  const aData = a.getData();
  const bData = b.getData();

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < p; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += aData[i * n + k] * bData[k * p + j];
      }
      result[i * p + j] = sum;
    }
  }

  return new NDArray(result, [m, p]);
}

export function matmul(a: NDArray, b: NDArray): NDArray {
  return dot(a, b);
}
