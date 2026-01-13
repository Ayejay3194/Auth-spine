export namespace glmatrix {
  export class Vec2 {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
      this.x = x;
      this.y = y;
    }

    add(v: Vec2): Vec2 {
      return new Vec2(this.x + v.x, this.y + v.y);
    }

    subtract(v: Vec2): Vec2 {
      return new Vec2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar: number): Vec2 {
      return new Vec2(this.x * scalar, this.y * scalar);
    }

    dot(v: Vec2): number {
      return this.x * v.x + this.y * v.y;
    }

    length(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vec2 {
      const len = this.length();
      return new Vec2(this.x / len, this.y / len);
    }

    toArray(): [number, number] {
      return [this.x, this.y];
    }
  }

  export class Vec3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }

    add(v: Vec3): Vec3 {
      return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    subtract(v: Vec3): Vec3 {
      return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    multiply(scalar: number): Vec3 {
      return new Vec3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    dot(v: Vec3): number {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vec3): Vec3 {
      return new Vec3(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x
      );
    }

    length(): number {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(): Vec3 {
      const len = this.length();
      return new Vec3(this.x / len, this.y / len, this.z / len);
    }

    toArray(): [number, number, number] {
      return [this.x, this.y, this.z];
    }
  }

  export class Vec4 {
    x: number;
    y: number;
    z: number;
    w: number;

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }

    add(v: Vec4): Vec4 {
      return new Vec4(this.x + v.x, this.y + v.y, this.z + v.z, this.w + v.w);
    }

    subtract(v: Vec4): Vec4 {
      return new Vec4(this.x - v.x, this.y - v.y, this.z - v.z, this.w - v.w);
    }

    multiply(scalar: number): Vec4 {
      return new Vec4(this.x * scalar, this.y * scalar, this.z * scalar, this.w * scalar);
    }

    dot(v: Vec4): number {
      return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }

    toArray(): [number, number, number, number] {
      return [this.x, this.y, this.z, this.w];
    }
  }

  export class Mat2 {
    data: Float32Array;

    constructor(data?: Float32Array) {
      this.data = data || new Float32Array([1, 0, 0, 1]);
    }

    static identity(): Mat2 {
      return new Mat2(new Float32Array([1, 0, 0, 1]));
    }

    multiply(m: Mat2): Mat2 {
      const a = this.data;
      const b = m.data;
      const result = new Float32Array(4);

      result[0] = a[0] * b[0] + a[2] * b[1];
      result[1] = a[1] * b[0] + a[3] * b[1];
      result[2] = a[0] * b[2] + a[2] * b[3];
      result[3] = a[1] * b[2] + a[3] * b[3];

      return new Mat2(result);
    }

    transpose(): Mat2 {
      const a = this.data;
      return new Mat2(new Float32Array([a[0], a[2], a[1], a[3]]));
    }

    invert(): Mat2 {
      const a = this.data;
      const det = a[0] * a[3] - a[1] * a[2];

      if (det === 0) throw new Error('Matrix is singular');

      return new Mat2(new Float32Array([a[3] / det, -a[1] / det, -a[2] / det, a[0] / det]));
    }
  }

  export class Mat3 {
    data: Float32Array;

    constructor(data?: Float32Array) {
      this.data = data || new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    static identity(): Mat3 {
      return new Mat3(new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));
    }

    multiply(m: Mat3): Mat3 {
      const a = this.data;
      const b = m.data;
      const result = new Float32Array(9);

      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          result[i * 3 + j] = 0;
          for (let k = 0; k < 3; k++) {
            result[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j];
          }
        }
      }

      return new Mat3(result);
    }

    transpose(): Mat3 {
      const a = this.data;
      return new Mat3(
        new Float32Array([a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]])
      );
    }
  }

  export class Mat4 {
    data: Float32Array;

    constructor(data?: Float32Array) {
      this.data =
        data ||
        new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }

    static identity(): Mat4 {
      return new Mat4(new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));
    }

    static perspective(fovy: number, aspect: number, near: number, far: number): Mat4 {
      const f = 1 / Math.tan(fovy / 2);
      const nf = 1 / (near - far);

      const result = new Float32Array(16);
      result[0] = f / aspect;
      result[5] = f;
      result[10] = (far + near) * nf;
      result[11] = -1;
      result[14] = 2 * far * near * nf;

      return new Mat4(result);
    }

    multiply(m: Mat4): Mat4 {
      const a = this.data;
      const b = m.data;
      const result = new Float32Array(16);

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          result[i * 4 + j] = 0;
          for (let k = 0; k < 4; k++) {
            result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
          }
        }
      }

      return new Mat4(result);
    }

    transpose(): Mat4 {
      const a = this.data;
      return new Mat4(
        new Float32Array([
          a[0], a[4], a[8], a[12],
          a[1], a[5], a[9], a[13],
          a[2], a[6], a[10], a[14],
          a[3], a[7], a[11], a[15]
        ])
      );
    }

    translate(v: Vec3): Mat4 {
      const result = new Float32Array(this.data);
      result[12] = v.x;
      result[13] = v.y;
      result[14] = v.z;
      return new Mat4(result);
    }

    scale(v: Vec3): Mat4 {
      const result = new Float32Array(this.data);
      result[0] *= v.x;
      result[5] *= v.y;
      result[10] *= v.z;
      return new Mat4(result);
    }
  }

  export function vec2(x: number = 0, y: number = 0): Vec2 {
    return new Vec2(x, y);
  }

  export function vec3(x?: number, y?: number, z?: number): Vec3 {
    return new Vec3(x || 0, y || 0, z || 0);
  }

  export namespace vec3 {
    export function create(): Float32Array {
      return new Float32Array([0, 0, 0]);
    }
  }

  export function vec4(x: number = 0, y: number = 0, z: number = 0, w: number = 1): Vec4 {
    return new Vec4(x, y, z, w);
  }

  export function mat2(): Mat2 {
    return Mat2.identity();
  }

  export function mat3(): Mat3 {
    return Mat3.identity();
  }

  export function mat4(): Mat4 {
    return Mat4.identity();
  }
}
