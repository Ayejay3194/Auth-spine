import { EphemerisEngine, EphemerisInput, EphemerisOutput } from "../domain.js";
import { wrap2pi } from "../../utils/math.js";

/**
 * Student core: VSOP87-based ephemeris engine
 * Fast TypeScript implementation using truncated VSOP87 series
 */
export class StudentCore implements EphemerisEngine {
  name = "StudentCore(VSOP87)";

  compute(input: EphemerisInput): EphemerisOutput {
    const t = (input.jdTT - 2451545.0) / 36525.0; // Julian centuries from J2000
    
    switch (input.body) {
      case 'Sun': return this.computeSun(t);
      case 'Moon': return this.computeMoon(t);
      case 'Mercury': return this.computeMercury(t);
      case 'Venus': return this.computeVenus(t);
      case 'Mars': return this.computeMars(t);
      case 'Jupiter': return this.computeJupiter(t);
      case 'Saturn': return this.computeSaturn(t);
      default: return { lon: 0, lat: 0, r: 1.0 };
    }
  }

  private computeSun(t: number): EphemerisOutput {
    // VSOP87B truncated series for Sun
    const L0 = 1.753470314 + 628.307585 * t;
    const L1 = 0.033416564 * Math.sin(4.6692568 + 628.307585 * t);
    const L2 = 0.000348943 * Math.sin(4.62610 + 1256.61517 * t);
    const L3 = 0.00000577 * Math.sin(1.99386 + 1884.92265 * t);
    
    const lon = wrap2pi(L0 + L1 + L2 + L3);
    
    const R0 = 1.000001018;
    const R1 = -0.016708634 * Math.cos(4.6692568 + 628.307585 * t);
    const R2 = -0.000139589 * Math.cos(3.35212 + 1256.61517 * t);
    
    const r = R0 + R1 + R2;
    
    return { lon, lat: 0, r };
  }

  private computeMoon(t: number): EphemerisOutput {
    // ELP-2000/82 truncated series
    const L = 1.739894195 + 8328.691425719 * t + 0.000153833 * t * t;
    const D = 5.198466588 + 7771.377146811 * t;
    const M = 2.355555743 + 8328.691425719 * t;
    
    const lon = wrap2pi(L + 0.10976 * Math.sin(D) + 0.02224 * Math.sin(M - D) + 0.01149 * Math.sin(M));
    const lat = 0.08950 * Math.sin(D + M) + 0.00490 * Math.sin(2 * D - M);
    const r = 60.36295 - 3.55924 * Math.cos(M);
    
    return { lon, lat, r };
  }

  private computeMercury(t: number): EphemerisOutput {
    const L = 4.402608778 + 2608.7903141574 * t;
    const lon = wrap2pi(L + 0.409894 * Math.sin(L) + 0.022146 * Math.sin(2 * L));
    const r = 0.395282 + 0.078341 * Math.cos(L);
    return { lon, lat: 0.12247 * Math.sin(L), r };
  }

  private computeVenus(t: number): EphemerisOutput {
    const L = 3.176146697 + 1021.3285546211 * t;
    const lon = wrap2pi(L + 0.003521 * Math.sin(L));
    const r = 0.723348 - 0.004902 * Math.cos(L);
    return { lon, lat: 0.05923 * Math.sin(L), r };
  }

  private computeMars(t: number): EphemerisOutput {
    const L = 6.203480913 + 334.0612426700 * t;
    const lon = wrap2pi(L + 0.085786 * Math.sin(L) + 0.007970 * Math.sin(2 * L));
    const r = 1.523679 - 0.142267 * Math.cos(L) - 0.006606 * Math.cos(2 * L);
    return { lon, lat: 0.03227 * Math.sin(L), r };
  }

  private computeJupiter(t: number): EphemerisOutput {
    const L = 0.599546497 + 52.9690962641 * t;
    const lon = wrap2pi(L + 0.022317 * Math.sin(L) + 0.002589 * Math.sin(2 * L));
    const r = 5.202561 - 0.251236 * Math.cos(L) - 0.004337 * Math.cos(2 * L);
    return { lon, lat: 0.02269 * Math.sin(L), r };
  }

  private computeSaturn(t: number): EphemerisOutput {
    const L = 0.874016757 + 21.3299104960 * t;
    const lon = wrap2pi(L + 0.052992 * Math.sin(L) + 0.005966 * Math.sin(2 * L));
    const r = 9.554751 - 0.434100 * Math.cos(L) - 0.008599 * Math.cos(2 * L);
    return { lon, lat: 0.04340 * Math.sin(L), r };
  }
}
