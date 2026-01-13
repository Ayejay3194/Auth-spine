export namespace colors {
  export const NAMED_COLORS: Record<string, string> = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    yellow: '#FFFF00',
    cyan: '#00FFFF',
    magenta: '#FF00FF',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#808080',
    orange: '#FFA500',
    purple: '#800080',
    brown: '#A52A2A',
    pink: '#FFC0CB',
    lime: '#00FF00',
    navy: '#000080',
    teal: '#008080',
    olive: '#808000',
    maroon: '#800000',
    aqua: '#00FFFF',
    silver: '#C0C0C0'
  };

  export function toHex(color: string): string {
    if (color.startsWith('#')) {
      return color;
    }
    return NAMED_COLORS[color.toLowerCase()] || '#000000';
  }

  export function toRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ];
    }
    return [0, 0, 0];
  }

  export function toRGBA(hex: string, alpha: number = 1): [number, number, number, number] {
    const [r, g, b] = toRGB(hex);
    return [r, g, b, Math.round(alpha * 255)];
  }
}
