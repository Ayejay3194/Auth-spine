import { NDArray } from '../core/ndarray';

export namespace linalg {
  export function eig(A: NDArray): { eigenvalues: number[]; eigenvectors: NDArray } {
    const shape = A.getShape();
    if (shape.length !== 2 || shape[0] !== shape[1]) {
      throw new Error('Matrix must be square');
    }

    const n = shape[0];
    const data = new Float64Array(A.getData());
    const eigenvalues: number[] = [];
    const eigenvectors: number[][] = [];

    for (let i = 0; i < n; i++) {
      eigenvectors.push(new Array(n).fill(0));
      eigenvectors[i][i] = 1;
    }

    for (let iter = 0; iter < 100; iter++) {
      let maxVal = 0;
      let p = 0;
      let q = 0;

      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          if (Math.abs(data[i * n + j]) > maxVal) {
            maxVal = Math.abs(data[i * n + j]);
            p = i;
            q = j;
          }
        }
      }

      if (maxVal < 1e-10) break;

      const app = data[p * n + p];
      const aqq = data[q * n + q];
      const apq = data[p * n + q];

      let theta = 0.5 * Math.atan2(2 * apq, aqq - app);
      const c = Math.cos(theta);
      const s = Math.sin(theta);

      for (let i = 0; i < n; i++) {
        if (i !== p && i !== q) {
          const aip = data[i * n + p];
          const aiq = data[i * n + q];
          data[i * n + p] = c * aip - s * aiq;
          data[p * n + i] = data[i * n + p];
          data[i * n + q] = s * aip + c * aiq;
          data[q * n + i] = data[i * n + q];
        }
      }

      data[p * n + p] = c * c * app - 2 * s * c * apq + s * s * aqq;
      data[q * n + q] = s * s * app + 2 * s * c * apq + c * c * aqq;
      data[p * n + q] = 0;
      data[q * n + p] = 0;

      for (let i = 0; i < n; i++) {
        const vip = eigenvectors[i][p];
        const viq = eigenvectors[i][q];
        eigenvectors[i][p] = c * vip - s * viq;
        eigenvectors[i][q] = s * vip + c * viq;
      }
    }

    for (let i = 0; i < n; i++) {
      eigenvalues.push(data[i * n + i]);
    }

    const eigenvectorsFlat = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        eigenvectorsFlat[i * n + j] = eigenvectors[i][j];
      }
    }

    return {
      eigenvalues,
      eigenvectors: new NDArray(eigenvectorsFlat, [n, n])
    };
  }

  export function svd(A: NDArray): {
    U: NDArray;
    S: number[];
    Vt: NDArray;
  } {
    const shape = A.getShape();
    if (shape.length !== 2) {
      throw new Error('SVD requires 2D matrix');
    }

    const m = shape[0];
    const n = shape[1];
    const data = new Float64Array(A.getData());

    const ATA = new Float64Array(n * n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < m; k++) {
          sum += data[k * n + i] * data[k * n + j];
        }
        ATA[i * n + j] = sum;
      }
    }

    const ATAArray = new NDArray(ATA, [n, n]);
    const { eigenvalues, eigenvectors } = eig(ATAArray);

    const S = eigenvalues.map(v => Math.sqrt(Math.max(0, v)));
    const Vt = eigenvectors.getData();

    const U = new Float64Array(m * n);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += data[i * n + k] * Vt[k * n + j];
        }
        U[i * n + j] = S[j] > 1e-10 ? sum / S[j] : 0;
      }
    }

    return {
      U: new NDArray(U, [m, n]),
      S,
      Vt: new NDArray(Vt, [n, n])
    };
  }

  export function norm(A: NDArray, ord: string = 'fro'): number {
    const data = A.getData();

    if (ord === 'fro') {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];
      }
      return Math.sqrt(sum);
    } else if (ord === '1') {
      let maxSum = 0;
      const shape = A.getShape();
      if (shape.length === 2) {
        for (let j = 0; j < shape[1]; j++) {
          let sum = 0;
          for (let i = 0; i < shape[0]; i++) {
            sum += Math.abs(data[i * shape[1] + j]);
          }
          maxSum = Math.max(maxSum, sum);
        }
      }
      return maxSum;
    } else if (ord === '2') {
      const { S } = svd(A);
      return S[0];
    }

    return 0;
  }

  export function qr(A: NDArray): { Q: NDArray; R: NDArray } {
    const shape = A.getShape();
    if (shape.length !== 2) {
      throw new Error('QR decomposition requires 2D matrix');
    }

    const m = shape[0];
    const n = shape[1];
    const data = new Float64Array(A.getData());

    const Q = new Float64Array(m * n);
    const R = new Float64Array(n * n);

    for (let j = 0; j < n; j++) {
      let norm = 0;
      for (let i = 0; i < m; i++) {
        norm += data[i * n + j] * data[i * n + j];
      }
      norm = Math.sqrt(norm);

      R[j * n + j] = norm;

      for (let i = 0; i < m; i++) {
        Q[i * n + j] = data[i * n + j] / norm;
      }

      for (let k = j + 1; k < n; k++) {
        let dot = 0;
        for (let i = 0; i < m; i++) {
          dot += Q[i * n + j] * data[i * n + k];
        }

        R[j * n + k] = dot;

        for (let i = 0; i < m; i++) {
          data[i * n + k] -= dot * Q[i * n + j];
        }
      }
    }

    return {
      Q: new NDArray(Q, [m, n]),
      R: new NDArray(R, [n, n])
    };
  }
}
