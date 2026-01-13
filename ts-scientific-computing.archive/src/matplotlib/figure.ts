import { Axes } from './axes';

export class Figure {
  private width: number;
  private height: number;
  private dpi: number;
  private axes: Axes[] = [];
  constructor(width: number = 8, height: number = 6, dpi: number = 100) {
    this.width = width;
    this.height = height;
    this.dpi = dpi;
  }

  addSubplot(rows: number, cols: number, _index: number): Axes {
    const axes = new Axes(this.width / cols, this.height / rows);
    this.axes.push(axes);
    return axes;
  }

  setTitle(_title: string): void {
  }

  getSize(): [number, number] {
    return [this.width, this.height];
  }

  getDPI(): number {
    return this.dpi;
  }

  getAxes(): Axes[] {
    return this.axes;
  }

  savefig(filename: string): void {
    console.log(`Figure saved to ${filename}`);
  }

  show(): void {
    console.log('Displaying figure...');
  }
}
