import { NDArray } from '../core/ndarray';

export namespace random {
  export function seed(s: number): void {
    // Simple seeded random number generator
    globalThis._randomSeed = s;
  }

  function seededRandom(): number {
    if (!globalThis._randomSeed) {
      globalThis._randomSeed = Math.random() * 2147483647;
    }
    globalThis._randomSeed = (globalThis._randomSeed * 9301 + 49297) % 233280;
    return globalThis._randomSeed / 233280;
  }

  export function rand(...shape: number[]): NDArray {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float64Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = seededRandom();
    }
    return new NDArray(data, shape);
  }

  export function randn(...shape: number[]): NDArray {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float64Array(size);

    for (let i = 0; i < size; i += 2) {
      const u1 = seededRandom();
      const u2 = seededRandom();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      data[i] = z0;
      if (i + 1 < size) {
        data[i + 1] = z1;
      }
    }

    return new NDArray(data, shape);
  }

  export function randint(low: number, high: number, ...shape: number[]): NDArray {
    const size = shape.reduce((a, b) => a * b, 1);
    const data = new Float64Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(seededRandom() * (high - low)) + low;
    }
    return new NDArray(data, shape);
  }

  export function choice(a: NDArray, size?: number): NDArray {
    const aData = a.getData();
    const n = size || aData.length;
    const data = new Float64Array(n);
    for (let i = 0; i < n; i++) {
      data[i] = aData[Math.floor(seededRandom() * aData.length)];
    }
    return new NDArray(data, [n]);
  }
}

declare global {
  var _randomSeed: number | undefined;
}
