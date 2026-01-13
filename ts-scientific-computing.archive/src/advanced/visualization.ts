export namespace visualization {
  export interface Point3D {
    x: number;
    y: number;
    z: number;
    color?: string;
    label?: string;
  }

  export interface SceneConfig {
    width: number;
    height: number;
    backgroundColor?: string;
    showGrid?: boolean;
    showAxes?: boolean;
  }

  export class Scene3D {
    private points: Point3D[] = [];
    private config: SceneConfig;
    private canvas?: any;
    private ctx?: any;

    constructor(config: SceneConfig) {
      this.config = {
        backgroundColor: '#ffffff',
        showGrid: true,
        showAxes: true,
        ...config
      };
    }

    addPoint(point: Point3D): void {
      this.points.push(point);
    }

    addPoints(points: Point3D[]): void {
      this.points.push(...points);
    }

    project2D(point: Point3D, scale: number = 100): [number, number] {
      const centerX = this.config.width / 2;
      const centerY = this.config.height / 2;

      const x = centerX + point.x * scale;
      const y = centerY - point.z * scale;

      return [x, y];
    }

    render(canvas: any): void {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d')!;

      this.ctx.fillStyle = this.config.backgroundColor || '#ffffff';
      this.ctx.fillRect(0, 0, this.config.width, this.config.height);

      if (this.config.showGrid) {
        this.drawGrid();
      }

      if (this.config.showAxes) {
        this.drawAxes();
      }

      this.drawPoints();
    }

    private drawGrid(): void {
      if (!this.ctx) return;

      this.ctx.strokeStyle = '#e0e0e0';
      this.ctx.lineWidth = 0.5;

      const gridSize = 20;
      for (let x = 0; x < this.config.width; x += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, this.config.height);
        this.ctx.stroke();
      }

      for (let y = 0; y < this.config.height; y += gridSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.config.width, y);
        this.ctx.stroke();
      }
    }

    private drawAxes(): void {
      if (!this.ctx) return;

      const centerX = this.config.width / 2;
      const centerY = this.config.height / 2;

      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;

      // X axis (red)
      this.ctx.strokeStyle = '#ff0000';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX + 100, centerY);
      this.ctx.stroke();

      // Y axis (green)
      this.ctx.strokeStyle = '#00ff00';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX, centerY - 100);
      this.ctx.stroke();

      // Z axis (blue)
      this.ctx.strokeStyle = '#0000ff';
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(centerX + 70, centerY + 70);
      this.ctx.stroke();
    }

    private drawPoints(): void {
      if (!this.ctx) return;

      for (const point of this.points) {
        const [x, y] = this.project2D(point);

        this.ctx.fillStyle = point.color || '#0000ff';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
        this.ctx.fill();

        if (point.label) {
          this.ctx.fillStyle = '#000000';
          this.ctx.font = '12px Arial';
          this.ctx.fillText(point.label, x + 10, y);
        }
      }
    }

    getPoints(): Point3D[] {
      return this.points;
    }

    clear(): void {
      this.points = [];
    }
  }

  export class Heatmap2D {
    private data: number[][];
    private width: number;
    private height: number;

    constructor(data: number[][], width: number = 400, height: number = 400) {
      this.data = data;
      this.width = width;
      this.height = height;
    }

    getColor(value: number, min: number, max: number): string {
      const normalized = (value - min) / (max - min);
      const hue = (1 - normalized) * 240;
      return `hsl(${hue}, 100%, 50%)`;
    }

    render(canvas: any): void {
      const ctx = canvas.getContext('2d')!;
      const rows = this.data.length;
      const cols = this.data[0].length;

      let min = Infinity;
      let max = -Infinity;

      for (const row of this.data) {
        for (const val of row) {
          min = Math.min(min, val);
          max = Math.max(max, val);
        }
      }

      const cellWidth = this.width / cols;
      const cellHeight = this.height / rows;

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const color = this.getColor(this.data[i][j], min, max);
          ctx.fillStyle = color;
          ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight);
        }
      }
    }
  }

  export class LineChart {
    private data: number[];
    private width: number;
    private height: number;
    private padding: number = 40;

    constructor(data: number[], width: number = 400, height: number = 300) {
      this.data = data;
      this.width = width;
      this.height = height;
    }

    render(canvas: any, color: string = '#0000ff'): void {
      const ctx = canvas.getContext('2d')!;

      const min = Math.min(...this.data);
      const max = Math.max(...this.data);
      const range = max - min || 1;

      const chartWidth = this.width - 2 * this.padding;
      const chartHeight = this.height - 2 * this.padding;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.padding, this.padding, chartWidth, chartHeight);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < this.data.length; i++) {
        const x = this.padding + (i / (this.data.length - 1)) * chartWidth;
        const y = this.padding + chartHeight - ((this.data[i] - min) / range) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }
  }

  export class ScatterPlot {
    private points: Array<[number, number]>;
    private width: number;
    private height: number;
    private padding: number = 40;

    constructor(points: Array<[number, number]>, width: number = 400, height: number = 400) {
      this.points = points;
      this.width = width;
      this.height = height;
    }

    render(canvas: any, color: string = '#0000ff'): void {
      const ctx = canvas.getContext('2d')!;

      const xValues = this.points.map(p => p[0]);
      const yValues = this.points.map(p => p[1]);

      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      const xRange = xMax - xMin || 1;
      const yRange = yMax - yMin || 1;

      const chartWidth = this.width - 2 * this.padding;
      const chartHeight = this.height - 2 * this.padding;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, this.width, this.height);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.padding, this.padding, chartWidth, chartHeight);

      ctx.fillStyle = color;
      for (const [x, y] of this.points) {
        const px = this.padding + ((x - xMin) / xRange) * chartWidth;
        const py = this.padding + chartHeight - ((y - yMin) / yRange) * chartHeight;

        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
}
