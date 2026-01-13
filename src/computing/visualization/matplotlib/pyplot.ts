import { Figure } from './figure';
import { Axes } from './axes';

let currentFigure: Figure | null = null;
let currentAxes: Axes | null = null;

export namespace pyplot {
  export function figure(width?: number, height?: number, dpi?: number): Figure {
    currentFigure = new Figure(width, height, dpi);
    return currentFigure;
  }

  export function subplot(rows: number, cols: number, index: number): Axes {
    if (!currentFigure) {
      currentFigure = new Figure();
    }
    currentAxes = currentFigure.addSubplot(rows, cols, index);
    return currentAxes;
  }

  export function plot(x: number[], y: number[], label?: string, color?: string): void {
    if (!currentAxes) {
      if (!currentFigure) {
        currentFigure = new Figure();
      }
      currentAxes = currentFigure.addSubplot(1, 1, 1);
    }
    currentAxes.plot(x, y, label, color);
  }

  export function scatter(x: number[], y: number[], label?: string, color?: string): void {
    if (!currentAxes) {
      if (!currentFigure) {
        currentFigure = new Figure();
      }
      currentAxes = currentFigure.addSubplot(1, 1, 1);
    }
    currentAxes.scatter(x, y, label, color);
  }

  export function bar(x: number[], height: number[], label?: string, color?: string): void {
    if (!currentAxes) {
      if (!currentFigure) {
        currentFigure = new Figure();
      }
      currentAxes = currentFigure.addSubplot(1, 1, 1);
    }
    currentAxes.bar(x, height, label, color);
  }

  export function hist(data: number[], bins?: number, label?: string, color?: string): void {
    if (!currentAxes) {
      if (!currentFigure) {
        currentFigure = new Figure();
      }
      currentAxes = currentFigure.addSubplot(1, 1, 1);
    }
    currentAxes.hist(data, bins, label, color);
  }

  export function xlabel(label: string): void {
    if (currentAxes) {
      currentAxes.setXLabel(label);
    }
  }

  export function ylabel(label: string): void {
    if (currentAxes) {
      currentAxes.setYLabel(label);
    }
  }

  export function title(title: string): void {
    if (currentAxes) {
      currentAxes.setTitle(title);
    } else if (currentFigure) {
      currentFigure.setTitle(title);
    }
  }

  export function legend(): void {
    if (currentAxes) {
      currentAxes.legend();
    }
  }

  export function grid(visible?: boolean): void {
    if (currentAxes) {
      currentAxes.grid(visible);
    }
  }

  export function savefig(filename: string): void {
    if (currentFigure) {
      currentFigure.savefig(filename);
    }
  }

  export function show(): void {
    if (currentFigure) {
      currentFigure.show();
    }
  }

  export function close(): void {
    currentFigure = null;
    currentAxes = null;
  }
}
