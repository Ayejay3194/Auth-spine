import { NDArray } from './core/ndarray';

export function reshape(arr: NDArray, newShape: number[]): NDArray {
  const oldSize = arr.getShape().reduce((a, b) => a * b, 1);
  const newSize = newShape.reduce((a, b) => a * b, 1);

  if (oldSize !== newSize) {
    throw new Error('cannot reshape array of size ' + oldSize + ' into shape ' + newShape.join(','));
  }

  return new NDArray(arr.getData(), newShape);
}

export function transpose(arr: NDArray, _axes?: number[]): NDArray {
  const shape = arr.getShape();
  const data = arr.getData();

  if (shape.length !== 2) {
    throw new Error('transpose only supports 2D arrays currently');
  }

  const m = shape[0];
  const n = shape[1];
  const result = new Float64Array(m * n);

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      result[j * m + i] = data[i * n + j];
    }
  }

  return new NDArray(result, [n, m]);
}

export function flatten(arr: NDArray): NDArray {
  const shape = arr.getShape();
  const size = shape.reduce((a, b) => a * b, 1);
  return new NDArray(arr.getData(), [size]);
}

export function concatenate(arrays: NDArray[], axis: number = 0): NDArray {
  if (arrays.length === 0) {
    throw new Error('need at least one array to concatenate');
  }

  const shape = arrays[0].getShape();
  let totalSize = 0;

  for (const arr of arrays) {
    const arrShape = arr.getShape();
    if (arrShape.length !== shape.length) {
      throw new Error('all arrays must have same number of dimensions');
    }
    totalSize += arr.getData().length;
  }

  const result = new Float64Array(totalSize);
  let offset = 0;

  for (const arr of arrays) {
    const data = arr.getData();
    result.set(data, offset);
    offset += data.length;
  }

  const newShape = [...shape];
  newShape[axis] = arrays.reduce((sum, arr) => sum + arr.getShape()[axis], 0);

  return new NDArray(result, newShape);
}

export function stack(arrays: NDArray[], axis: number = 0): NDArray {
  if (arrays.length === 0) {
    throw new Error('need at least one array to stack');
  }

  const shape = arrays[0].getShape();
  const newShape = [...shape];
  newShape.splice(axis, 0, arrays.length);

  const totalSize = newShape.reduce((a, b) => a * b, 1);
  const result = new Float64Array(totalSize);

  let offset = 0;
  for (const arr of arrays) {
    const data = arr.getData();
    result.set(data, offset);
    offset += data.length;
  }

  return new NDArray(result, newShape);
}
