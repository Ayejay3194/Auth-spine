export type Shape = number[];

export interface Tensor {
  shape: Shape;

  clone(): Tensor;

  // in-place
  add_(t: Tensor): this;
  sub_(t: Tensor): this;
  mulScalar_(s: number): this;

  // linear algebra
  matmul(t: Tensor): Tensor;   // (a x b) @ (b x c)
  transpose(): Tensor;

  // elementwise
  hadamard(t: Tensor): Tensor;
  map(fn: (x: number) => number): Tensor;

  // reductions / utilities
  sum(): number;
  norm2(): number;
  dot(t: Tensor): number; // flattened dot
  toFlatArray(): number[]; // helper for audits/debug
}

export interface TensorFactory {
  zeros(shape: Shape): Tensor;
  randn(shape: Shape, seed?: number): Tensor;
  fromArray2D(a: number[][]): Tensor;
  fromFlatArray(vec: number[], shape: Shape): Tensor;
  concatFlatten(tensors: Tensor[]): Tensor; // returns column vector
}
