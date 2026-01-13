import { Figure } from './figure';
import { Axes } from './axes';

export function subplots(nrows: number = 1, ncols: number = 1, figsize?: [number, number]): [Figure, Axes[]] {
  const width = figsize ? figsize[0] : 10;
  const height = figsize ? figsize[1] : 6;

  const fig = new Figure(width, height);
  const axes: Axes[] = [];

  for (let i = 0; i < nrows; i++) {
    for (let j = 0; j < ncols; j++) {
      const ax = fig.addSubplot(nrows, ncols, i * ncols + j + 1);
      axes.push(ax);
    }
  }

  return [fig, axes];
}

export function subplot(rows: number, cols: number, index: number): Axes {
  const fig = new Figure();
  return fig.addSubplot(rows, cols, index);
}
