export namespace validation {
  export function validateArray(arr: number[], name: string = 'array'): void {
    if (!arr || arr.length === 0) {
      throw new Error(`${name} cannot be empty`);
    }
    for (let i = 0; i < arr.length; i++) {
      if (!Number.isFinite(arr[i])) {
        throw new Error(`${name} contains invalid value at index ${i}: ${arr[i]}`);
      }
    }
  }

  export function validateMatrix(matrix: number[][], name: string = 'matrix'): void {
    if (!matrix || matrix.length === 0) {
      throw new Error(`${name} cannot be empty`);
    }
    const cols = matrix[0].length;
    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i].length !== cols) {
        throw new Error(`${name} has inconsistent row lengths at row ${i}`);
      }
      for (let j = 0; j < matrix[i].length; j++) {
        if (!Number.isFinite(matrix[i][j])) {
          throw new Error(`${name} contains invalid value at [${i}, ${j}]: ${matrix[i][j]}`);
        }
      }
    }
  }

  export function validateDimensions(X: number[][], y: number[], name: string = 'data'): void {
    if (X.length !== y.length) {
      throw new Error(`${name}: X and y have different lengths (${X.length} vs ${y.length})`);
    }
  }

  export function validateShape(shape: number[], expectedDims?: number): void {
    if (!shape || shape.length === 0) {
      throw new Error('Shape cannot be empty');
    }
    if (expectedDims && shape.length !== expectedDims) {
      throw new Error(`Expected ${expectedDims}D array, got ${shape.length}D`);
    }
    for (let i = 0; i < shape.length; i++) {
      if (shape[i] <= 0) {
        throw new Error(`Shape dimension ${i} must be positive, got ${shape[i]}`);
      }
    }
  }

  export function validateSplit(testSize: number): void {
    if (testSize <= 0 || testSize >= 1) {
      throw new Error(`testSize must be between 0 and 1, got ${testSize}`);
    }
  }

  export function validateKValue(k: number, n: number, name: string = 'k'): void {
    if (k <= 0 || k > n) {
      throw new Error(`${name} must be between 1 and ${n}, got ${k}`);
    }
  }

  export function hasNaN(arr: number[]): boolean {
    return arr.some(v => !Number.isFinite(v));
  }

  export function hasNaNMatrix(matrix: number[][]): boolean {
    return matrix.some(row => row.some(v => !Number.isFinite(v)));
  }

  export function sanitizeArray(arr: number[], fillValue: number = 0): number[] {
    return arr.map(v => (Number.isFinite(v) ? v : fillValue));
  }

  export function sanitizeMatrix(matrix: number[][], fillValue: number = 0): number[][] {
    return matrix.map(row => row.map(v => (Number.isFinite(v) ? v : fillValue)));
  }
}
