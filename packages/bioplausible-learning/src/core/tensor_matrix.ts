import { Shape, Tensor, TensorFactory } from "./tensor";

/**
 * MatrixTensor is a tiny CPU backend using number[][] in row-major form.
 * Shapes are always [rows, cols].
 */
export class MatrixTensor implements Tensor {
  shape: Shape;
  data: number[][];

  constructor(data: number[][]) {
    const rows = data.length;
    const cols = rows ? data[0].length : 0;
    for (const r of data) {
      if (r.length !== cols) throw new Error("Ragged matrix not allowed");
    }
    this.data = data;
    this.shape = [rows, cols];
  }

  clone(): MatrixTensor {
    const d = this.data.map(r => r.slice());
    return new MatrixTensor(d);
  }

  add_(t: Tensor): this {
    const b = t as MatrixTensor;
    this._assertSameShape(b);
    for (let i = 0; i < this.shape[0]; i++) {
      for (let j = 0; j < this.shape[1]; j++) {
        this.data[i][j] += b.data[i][j];
      }
    }
    return this;
  }

  sub_(t: Tensor): this {
    const b = t as MatrixTensor;
    this._assertSameShape(b);
    for (let i = 0; i < this.shape[0]; i++) {
      for (let j = 0; j < this.shape[1]; j++) {
        this.data[i][j] -= b.data[i][j];
      }
    }
    return this;
  }

  mulScalar_(s: number): this {
    for (let i = 0; i < this.shape[0]; i++) {
      for (let j = 0; j < this.shape[1]; j++) {
        this.data[i][j] *= s;
      }
    }
    return this;
  }

  matmul(t: Tensor): MatrixTensor {
    const b = t as MatrixTensor;
    const [ar, ac] = this.shape;
    const [br, bc] = b.shape;
    if (ac !== br) throw new Error(`matmul shape mismatch: [${ar},${ac}] @ [${br},${bc}]`);

    const out: number[][] = Array.from({ length: ar }, () => Array.from({ length: bc }, () => 0));
    for (let i = 0; i < ar; i++) {
      for (let k = 0; k < ac; k++) {
        const aik = this.data[i][k];
        for (let j = 0; j < bc; j++) {
          out[i][j] += aik * b.data[k][j];
        }
      }
    }
    return new MatrixTensor(out);
  }

  transpose(): MatrixTensor {
    const [r, c] = this.shape;
    const out: number[][] = Array.from({ length: c }, () => Array.from({ length: r }, () => 0));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) {
        out[j][i] = this.data[i][j];
      }
    }
    return new MatrixTensor(out);
  }

  hadamard(t: Tensor): MatrixTensor {
    const b = t as MatrixTensor;
    this._assertSameShape(b);
    const out = this.clone();
    for (let i = 0; i < this.shape[0]; i++) {
      for (let j = 0; j < this.shape[1]; j++) {
        out.data[i][j] *= b.data[i][j];
      }
    }
    return out;
  }

  map(fn: (x: number) => number): MatrixTensor {
    const out = this.clone();
    for (let i = 0; i < this.shape[0]; i++) {
      for (let j = 0; j < this.shape[1]; j++) {
        out.data[i][j] = fn(out.data[i][j]);
      }
    }
    return out;
  }

  sum(): number {
    let s = 0;
    for (let i = 0; i < this.shape[0]; i++) {
      for (let j = 0; j < this.shape[1]; j++) s += this.data[i][j];
    }
    return s;
  }

  norm2(): number {
    let s = 0;
    for (let i = 0; i < this.shape[0]; i++) {
      for (let j = 0; j < this.shape[1]; j++) {
        const v = this.data[i][j];
        s += v * v;
      }
    }
    return Math.sqrt(s);
  }

  dot(t: Tensor): number {
    const a = this.toFlatArray();
    const b = t.toFlatArray();
    if (a.length !== b.length) throw new Error(`dot length mismatch: ${a.length} vs ${b.length}`);
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  toFlatArray(): number[] {
    const out: number[] = [];
    for (let i = 0; i < this.shape[0]; i++) {
      for (let j = 0; j < this.shape[1]; j++) out.push(this.data[i][j]);
    }
    return out;
  }

  private _assertSameShape(b: MatrixTensor) {
    if (this.shape[0] !== b.shape[0] || this.shape[1] !== b.shape[1]) {
      throw new Error(`shape mismatch: [${this.shape}] vs [${b.shape}]`);
    }
  }
}

/** Seeded RNG: Mulberry32 + Box-Muller for N(0,1). */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng: () => number): number {
  // Box-Muller
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export class MatrixFactory implements TensorFactory {
  zeros(shape: Shape): Tensor {
    const [r, c] = shape;
    return new MatrixTensor(Array.from({ length: r }, () => Array.from({ length: c }, () => 0)));
  }

  randn(shape: Shape, seed = 1): Tensor {
    const [r, c] = shape;
    const rng = mulberry32(seed);
    const out: number[][] = Array.from({ length: r }, () => Array.from({ length: c }, () => 0));
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < c; j++) out[i][j] = randn(rng);
    }
    return new MatrixTensor(out);
  }

  fromArray2D(a: number[][]): Tensor {
    return new MatrixTensor(a.map(r => r.slice()));
  }

  fromFlatArray(vec: number[], shape: Shape): Tensor {
    const [r, c] = shape;
    if (r * c !== vec.length) throw new Error("fromFlatArray size mismatch");
    const out: number[][] = [];
    let k = 0;
    for (let i = 0; i < r; i++) {
      const row: number[] = [];
      for (let j = 0; j < c; j++) row.push(vec[k++]);
      out.push(row);
    }
    return new MatrixTensor(out);
  }

  concatFlatten(tensors: Tensor[]): Tensor {
    const flat: number[] = [];
    for (const t of tensors) flat.push(...t.toFlatArray());
    return this.fromFlatArray(flat, [flat.length, 1]);
  }
}
