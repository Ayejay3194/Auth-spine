export class NDArray {
  private data: Float64Array;
  private shape: number[];
  private strides: number[];
  private dtype: 'float64' | 'int32' | 'bool';

  constructor(data: number[] | Float64Array, shape: number[], dtype: 'float64' | 'int32' | 'bool' = 'float64') {
    this.dtype = dtype;
    this.shape = shape;
    this.data = data instanceof Float64Array ? data : new Float64Array(data);
    this.strides = this.computeStrides(shape);
  }

  private computeStrides(shape: number[]): number[] {
    const strides: number[] = [];
    let stride = 1;
    for (let i = shape.length - 1; i >= 0; i--) {
      strides[i] = stride;
      stride *= shape[i];
    }
    return strides;
  }

  get size(): number {
    return this.data.length;
  }

  get ndim(): number {
    return this.shape.length;
  }

  getShape(): number[] {
    return [...this.shape];
  }

  getData(): Float64Array {
    return this.data;
  }

  getItem(indices: number[]): number {
    let index = 0;
    for (let i = 0; i < indices.length; i++) {
      index += indices[i] * this.strides[i];
    }
    return this.data[index];
  }

  setItem(indices: number[], value: number): void {
    let index = 0;
    for (let i = 0; i < indices.length; i++) {
      index += indices[i] * this.strides[i];
    }
    this.data[index] = value;
  }

  toString(): string {
    return `NDArray(shape=${this.shape.join(',')}, dtype=${this.dtype})`;
  }
}
