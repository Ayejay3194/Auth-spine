import { Axes } from './axes';
import { Colormap, colormaps } from './advanced';

export class Heatmap {
  private data: number[][];
  private colormap: Colormap;
  private vmin: number;
  private vmax: number;
  private cbar_label: string = '';

  constructor(data: number[][], colormap: string = 'viridis') {
    this.data = data;
    this.colormap = colormaps[colormap] || colormaps.viridis;

    let min = Infinity;
    let max = -Infinity;

    for (const row of data) {
      for (const val of row) {
        min = Math.min(min, val);
        max = Math.max(max, val);
      }
    }

    this.vmin = min;
    this.vmax = max;
  }

    setVmin(vmin: number): this {
    this.vmin = vmin;
    return this;
  }

  setVmax(vmax: number): this {
    this.vmax = vmax;
    return this;
  }

  setColorbar(label: string): this {
    this.cbar_label = label;
    return this;
  }

  getColormap(): Colormap {
    return this.colormap;
  }

  getData(): number[][] {
    return this.data;
  }

  getVmin(): number {
    return this.vmin;
  }

  getVmax(): number {
    return this.vmax;
  }

  getColorbarLabel(): string {
    return this.cbar_label;
  }

  getColor(value: number): string {
    const normalized = (value - this.vmin) / (this.vmax - this.vmin);
    const clamped = Math.max(0, Math.min(1, normalized));
    return this.colormap.getColor(clamped);
  }
}

export function imshow(ax: Axes, data: number[][], colormap: string = 'viridis'): Heatmap {
  const heatmap = new Heatmap(data, colormap);

  const rows = data.length;
  const cols = data[0].length;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const color = heatmap.getColor(data[i][j]);
      const x = [j, j + 1, j + 1, j];
      const y = [i, i, i + 1, i + 1];
    }
  }

  return heatmap;
}

export function contour(ax: Axes, X: number[][], Y: number[][], Z: number[][], levels?: number[]): void {
  const rows = Z.length;
  const cols = Z[0].length;

  if (!levels) {
    let min = Infinity;
    let max = -Infinity;
    for (const row of Z) {
      for (const val of row) {
        min = Math.min(min, val);
        max = Math.max(max, val);
      }
    }
    levels = [];
    for (let i = 0; i < 10; i++) {
      levels.push(min + ((max - min) / 10) * i);
    }
  }

  for (const level of levels) {
    const contourPoints: Array<[number, number]> = [];

    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const z1 = Z[i][j];
        const z2 = Z[i][j + 1];
        const z3 = Z[i + 1][j + 1];
        const z4 = Z[i + 1][j];

        if ((z1 <= level && level <= z2) || (z2 <= level && level <= z1)) {
          const t = (level - z1) / (z2 - z1);
          contourPoints.push([X[i][j] + t * (X[i][j + 1] - X[i][j]), Y[i][j]]);
        }
      }
    }
  }
}

export function contourf(ax: Axes, X: number[][], Y: number[][], Z: number[][], levels?: number[]): void {
  if (!levels) {
    let min = Infinity;
    let max = -Infinity;
    for (const row of Z) {
      for (const val of row) {
        min = Math.min(min, val);
        max = Math.max(max, val);
      }
    }
    levels = [];
    for (let i = 0; i < 10; i++) {
      levels.push(min + ((max - min) / 10) * i);
    }
  }

  const rows = Z.length;
  const cols = Z[0].length;

  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < cols - 1; j++) {
      const z_avg = (Z[i][j] + Z[i][j + 1] + Z[i + 1][j + 1] + Z[i + 1][j]) / 4;

      let levelIdx = 0;
      for (let k = 0; k < levels.length - 1; k++) {
        if (z_avg >= levels[k] && z_avg < levels[k + 1]) {
          levelIdx = k;
          break;
        }
      }
    }
  }
}
