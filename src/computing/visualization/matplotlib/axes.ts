export class Axes {
  private width: number;
  private height: number;
  private xlabel: string = '';
  private ylabel: string = '';
  private title: string = '';
  private data: Array<{ x: number[]; y: number[]; label: string; color: string }> = [];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  plot(x: number[], y: number[], label?: string, color?: string): void {
    this.data.push({
      x,
      y,
      label: label || '',
      color: color || 'blue'
    });
  }

  scatter(x: number[], y: number[], label?: string, color?: string): void {
    this.data.push({
      x,
      y,
      label: label || '',
      color: color || 'blue'
    });
  }

  bar(x: number[], height: number[], label?: string, color?: string): void {
    this.data.push({
      x,
      y: height,
      label: label || '',
      color: color || 'blue'
    });
  }

  hist(data: number[], bins?: number, label?: string, color?: string): void {
    const numBins = bins || 10;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / numBins;

    const binCounts: number[] = new Array(numBins).fill(0);
    for (const value of data) {
      const binIndex = Math.floor((value - min) / binWidth);
      if (binIndex < numBins) {
        binCounts[binIndex]++;
      }
    }

    const binCenters = Array.from({ length: numBins }, (_, i) => min + (i + 0.5) * binWidth);
    this.data.push({
      x: binCenters,
      y: binCounts,
      label: label || '',
      color: color || 'blue'
    });
  }

  setXLabel(label: string): void {
    this.xlabel = label;
  }

  setYLabel(label: string): void {
    this.ylabel = label;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  legend(): void {
    console.log('Legend displayed');
  }

  grid(visible: boolean = true): void {
    console.log(`Grid ${visible ? 'enabled' : 'disabled'}`);
  }

  getSize(): [number, number] {
    return [this.width, this.height];
  }

  getData(): Array<{ x: number[]; y: number[]; label: string; color: string }> {
    return this.data;
  }
}
