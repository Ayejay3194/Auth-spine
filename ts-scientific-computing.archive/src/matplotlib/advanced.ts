export class Colormap {
  private name: string;
  private colors: string[];

  constructor(name: string, colors: string[]) {
    this.name = name;
    this.colors = colors;
  }

  getColor(value: number): string {
    const index = Math.floor(value * (this.colors.length - 1));
    return this.colors[Math.max(0, Math.min(index, this.colors.length - 1))];
  }

  getName(): string {
    return this.name;
  }
}

export const colormaps: Record<string, Colormap> = {
  viridis: new Colormap('viridis', ['#440154', '#31688e', '#35b779', '#fde724']),
  plasma: new Colormap('plasma', ['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921']),
  inferno: new Colormap('inferno', ['#000004', '#420a68', '#932667', '#fca236', '#fcfdbf']),
  magma: new Colormap('magma', ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fcfdbf']),
  cividis: new Colormap('cividis', ['#00204d', '#404d7b', '#7d87b8', '#b8b0d1', '#e8ddf5']),
  cool: new Colormap('cool', ['#0000ff', '#00ffff']),
  hot: new Colormap('hot', ['#000000', '#ff0000', '#ffff00', '#ffffff']),
  spring: new Colormap('spring', ['#ff00ff', '#ffff00']),
  summer: new Colormap('summer', ['#008000', '#ffff00']),
  autumn: new Colormap('autumn', ['#ff0000', '#ffff00']),
  winter: new Colormap('winter', ['#0000ff', '#00ff00'])
};

export class Style {
  private linewidth: number = 1;
  private linestyle: string = '-';
  private marker: string = '';
  private markersize: number = 6;
  private alpha: number = 1;

  setLinewidth(width: number): this {
    this.linewidth = width;
    return this;
  }

  setLinestyle(style: string): this {
    this.linestyle = style;
    return this;
  }

  setMarker(marker: string): this {
    this.marker = marker;
    return this;
  }

  setMarkersize(size: number): this {
    this.markersize = size;
    return this;
  }

  setAlpha(alpha: number): this {
    this.alpha = Math.max(0, Math.min(1, alpha));
    return this;
  }

  getLinewidth(): number {
    return this.linewidth;
  }

  getLinestyle(): string {
    return this.linestyle;
  }

  getMarker(): string {
    return this.marker;
  }

  getMarkersize(): number {
    return this.markersize;
  }

  getAlpha(): number {
    return this.alpha;
  }
}

export class Annotation {
  private x: number;
  private y: number;
  private text: string;
  private fontsize: number = 10;
  private color: string = 'black';

  constructor(x: number, y: number, text: string) {
    this.x = x;
    this.y = y;
    this.text = text;
  }

  setFontsize(size: number): this {
    this.fontsize = size;
    return this;
  }

  setColor(color: string): this {
    this.color = color;
    return this;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getText(): string {
    return this.text;
  }

  getFontsize(): number {
    return this.fontsize;
  }

  getColor(): string {
    return this.color;
  }
}

export class Patch {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private color: string;
  private edgecolor: string = 'black';
  private linewidth: number = 1;

  constructor(x: number, y: number, width: number, height: number, color: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  setEdgecolor(color: string): this {
    this.edgecolor = color;
    return this;
  }

  setLinewidth(width: number): this {
    this.linewidth = width;
    return this;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  getColor(): string {
    return this.color;
  }

  getEdgecolor(): string {
    return this.edgecolor;
  }

  getLinewidth(): number {
    return this.linewidth;
  }
}

export class Text {
  private x: number;
  private y: number;
  private text: string;
  private fontsize: number = 12;
  private color: string = 'black';
  private fontweight: string = 'normal';
  private ha: string = 'left';
  private va: string = 'bottom';

  constructor(x: number, y: number, text: string) {
    this.x = x;
    this.y = y;
    this.text = text;
  }

  setFontsize(size: number): this {
    this.fontsize = size;
    return this;
  }

  setColor(color: string): this {
    this.color = color;
    return this;
  }

  setFontweight(weight: string): this {
    this.fontweight = weight;
    return this;
  }

  setHa(ha: string): this {
    this.ha = ha;
    return this;
  }

  setVa(va: string): this {
    this.va = va;
    return this;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getText(): string {
    return this.text;
  }

  getFontsize(): number {
    return this.fontsize;
  }

  getColor(): string {
    return this.color;
  }

  getFontweight(): string {
    return this.fontweight;
  }

  getHa(): string {
    return this.ha;
  }

  getVa(): string {
    return this.va;
  }
}
