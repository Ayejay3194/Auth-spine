/**
 * Image Generation System (Advanced) - stub.
 * Real diffusion training is compute-heavy. This provides:
 * - interface
 * - seedable noise
 * - placeholder sampler
 */
export interface ImageGenerator {
  generate(prompt: string, opts?: { seed?: number; steps?: number; width?: number; height?: number }): Promise<Uint8Array>;
}

export class StubImageGen implements ImageGenerator {
  async generate(_prompt: string, opts: { seed?: number; steps?: number; width?: number; height?: number } = {}): Promise<Uint8Array> {
    const w = opts.width ?? 64, h = opts.height ?? 64;
    const n = w*h*4;
    let s = (opts.seed ?? 42) >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0)/2**32;
    const buf = new Uint8Array(n);
    for (let i=0;i<n;i++) buf[i] = Math.floor(rnd()*256);
    return buf;
  }
}
