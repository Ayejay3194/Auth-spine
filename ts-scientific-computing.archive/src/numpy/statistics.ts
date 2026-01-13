import { NDArray } from './core/ndarray';

export function sum(arr: NDArray, axis?: number): number | NDArray {
  const data = arr.getData();
  const shape = arr.getShape();

  if (axis === undefined) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum;
  }

  if (axis < 0 || axis >= shape.length) {
    throw new Error('axis out of bounds');
  }

  const newShape = shape.filter((_, i) => i !== axis);
  const resultSize = newShape.reduce((a, b) => a * b, 1);
  const result = new Float64Array(resultSize);

  const axisSize = shape[axis];
  const stride = shape.slice(axis + 1).reduce((a, b) => a * b, 1);

  for (let i = 0; i < data.length; i++) {
    const resultIndex = Math.floor(i / (axisSize * stride)) * stride + (i % stride);
    result[resultIndex] += data[i];
  }

  return new NDArray(result, newShape);
}

export function mean(arr: NDArray, axis?: number): number | NDArray {
  const data = arr.getData();
  const shape = arr.getShape();

  if (axis === undefined) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / data.length;
  }

  const sumResult = sum(arr, axis);
  if (typeof sumResult === 'number') {
    return sumResult / shape[axis];
  }

  const resultData = sumResult.getData();
  const divisor = shape[axis];
  for (let i = 0; i < resultData.length; i++) {
    resultData[i] /= divisor;
  }

  return sumResult;
}

export function std(arr: NDArray, axis?: number): number | NDArray {
  const data = arr.getData();
  const meanVal = mean(arr, axis);

  if (axis === undefined) {
    let sumSquares = 0;
    const meanNum = meanVal as number;
    for (let i = 0; i < data.length; i++) {
      sumSquares += Math.pow(data[i] - meanNum, 2);
    }
    return Math.sqrt(sumSquares / data.length);
  }

  throw new Error('axis-based std not yet implemented');
}

export function variance(arr: NDArray, axis?: number): number | NDArray {
  const data = arr.getData();
  const meanVal = mean(arr, axis);

  if (axis === undefined) {
    let sumSquares = 0;
    const meanNum = meanVal as number;
    for (let i = 0; i < data.length; i++) {
      sumSquares += Math.pow(data[i] - meanNum, 2);
    }
    return sumSquares / data.length;
  }

  throw new Error('axis-based variance not yet implemented');
}

export function min(arr: NDArray): number {
  const data = arr.getData();
  let minVal = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i] < minVal) {
      minVal = data[i];
    }
  }
  return minVal;
}

export function max(arr: NDArray): number {
  const data = arr.getData();
  let maxVal = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i] > maxVal) {
      maxVal = data[i];
    }
  }
  return maxVal;
}
